import { ethers } from "hardhat";
import { expect } from "chai";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { Effort, ERC20Mock } from "../typechain-types";
import { convertBigNumberToDecimalTokenValue } from "../scripts/utils";

const IERC165 = "0x01ffc9a7";
const IRMRKERC20Holder = "0x6f87c75c";
const IOtherInterface = "0xffffffff";

async function tokenHolderFixture() {
  const tokenHolderFactory = await ethers.getContractFactory("Effort");
  const tokenHolder = await tokenHolderFactory.deploy(
    "https://ipfs.io/ipfs/QmQvm8XG7EkGN9BQGmkVATsyisVWRBo5hAb1EMERg9NAGU",
    ethers.MaxUint256,
    "0x992AAeb878fEAF573E9717Ed375383955549f642",
    "0"
  );
  await tokenHolder.waitForDeployment();

  const erc20Factory = await ethers.getContractFactory("ERC20Mock");
  const erc20A = await erc20Factory.deploy();
  await erc20A.waitForDeployment();

  const erc20B = await erc20Factory.deploy();
  await erc20B.waitForDeployment();

  return {
    tokenHolder,
    erc20A,
    erc20B,
  };
}

describe("ERC7590", async function () {
  let tokenHolder: Effort;
  let erc20A: ERC20Mock;
  let erc20B: ERC20Mock;
  let holder: SignerWithAddress;
  let otherHolder: SignerWithAddress;
  const tokenHolderId = 1n;
  const otherTokenHolderId = 2n;
  const tokenId = 1n;
  const mockValue = ethers.parseEther("10");

  beforeEach(async function () {
    [holder, otherHolder, ] = await ethers.getSigners() as unknown as SignerWithAddress[];
    ({ tokenHolder, erc20A, erc20B } = await loadFixture(tokenHolderFixture));
  });

  it("can support IERC165", async function () {
    expect(await tokenHolder.supportsInterface(IERC165)).to.equal(true);
  });

  it("can support TokenHolder", async function () {
    expect(await tokenHolder.supportsInterface(IRMRKERC20Holder)).to.equal(
      true
    );
  });

  it("does not support other interfaces", async function () {
    expect(await tokenHolder.supportsInterface(IOtherInterface)).to.equal(
      false
    );
  });

  describe("With minted tokens", async function () {
    beforeEach(async function () {
      await tokenHolder.mint(holder.address, 1n, tokenHolderId.toString());
      await tokenHolder.mint(otherHolder.address, 1n, otherTokenHolderId.toString());
      await erc20A.mint(holder.address, mockValue);
      await erc20A.mint(otherHolder.address, mockValue);
    });

    it("can receive ERC-20 tokens", async function () {
      await erc20A.approve(tokenHolder.getAddress(), mockValue);
      await expect(
        tokenHolder.transferERC20ToToken(
          erc20A.getAddress(),
          tokenHolderId,
          mockValue,
          "0x00"
        )
      )
        .to.emit(tokenHolder, "ReceivedERC20")
        .withArgs(erc20A.getAddress(), tokenHolderId, holder.address, mockValue);
      expect(await erc20A.balanceOf(tokenHolder.getAddress())).to.equal(mockValue);
    });

    it("can transfer ERC-20 tokens", async function () {
      await erc20A.approve(tokenHolder.getAddress(), mockValue);
      await tokenHolder.transferERC20ToToken(
        erc20A.getAddress(),
        tokenHolderId,
        mockValue,
        "0x00"
      );
      const balanceOfContract = await erc20A.balanceOf(tokenHolder.getAddress());
      let balanceOfERC20 = await tokenHolder.balanceOfERC20(erc20A.getAddress(), tokenHolderId);
      let otherBalanceOfERC20 = await tokenHolder.balanceOfERC20(erc20A.getAddress(), otherTokenHolderId);
      let userBalance = await erc20A.balanceOf(holder.address);

      console.log('balanceOfContract', convertBigNumberToDecimalTokenValue(balanceOfContract, 18));
      console.log('### Step 1 ###');
      console.log('balanceOfERC20 of tokenHolderId', convertBigNumberToDecimalTokenValue(balanceOfERC20, 18));
      console.log('otherBalanceOfERC20 of otherTokenHolderId', convertBigNumberToDecimalTokenValue(otherBalanceOfERC20, 18));
      console.log('userBalance ', convertBigNumberToDecimalTokenValue(userBalance, 18));

      await expect(
        tokenHolder.transferHeldERC20FromToken(
          erc20A.getAddress(),
          tokenHolderId,
          holder.address,
          mockValue / BigInt(2),
          "0x00"
        )
      )
        .to.emit(tokenHolder, "TransferredERC20")
        .withArgs(
          erc20A.getAddress(),
          tokenHolderId,
          holder.address,
          mockValue / BigInt(2),
        );
      balanceOfERC20 = await tokenHolder.balanceOfERC20(erc20A.getAddress(), tokenHolderId);
      otherBalanceOfERC20 = await tokenHolder.balanceOfERC20(erc20A.getAddress(), otherTokenHolderId);
      userBalance = await erc20A.balanceOf(holder.address);
      console.log('### Step 2 ###');
      console.log('balanceOfERC20 of tokenHolderId', convertBigNumberToDecimalTokenValue(balanceOfERC20, 18));
      console.log('otherBalanceOfERC20 of otherTokenHolderId', convertBigNumberToDecimalTokenValue(otherBalanceOfERC20, 18));
      console.log('userBalance ', convertBigNumberToDecimalTokenValue(userBalance, 18));

      expect(await erc20A.balanceOf(tokenHolder.getAddress())).to.equal(
        mockValue / BigInt(2),
      );
      expect(await tokenHolder.erc20TransferOutNonce(tokenHolderId)).to.equal(
        1
      );
    });

    it("cannot transfer 0 value", async function () {
      await expect(
        tokenHolder.transferERC20ToToken(erc20A.getAddress(), tokenId, 0, "0x00")
      ).to.be.revertedWithCustomError(tokenHolder, "InvalidValue");

      await expect(
        tokenHolder.transferHeldERC20FromToken(
          erc20A.getAddress(),
          tokenId,
          holder.address,
          0,
          "0x00"
        )
      ).to.be.revertedWithCustomError(tokenHolder, "InvalidValue");
    });

    it("cannot transfer to address 0", async function () {
      await expect(
        tokenHolder.transferHeldERC20FromToken(
          erc20A.getAddress(),
          tokenId,
          ethers.ZeroAddress,
          1,
          "0x00"
        )
      ).to.be.revertedWithCustomError(tokenHolder, "InvalidAddress");
    });

    it("cannot transfer a token at address 0", async function () {
      await expect(
        tokenHolder.transferHeldERC20FromToken(
          ethers.ZeroAddress,
          tokenId,
          holder.address,
          1,
          "0x00"
        )
      ).to.be.revertedWithCustomError(tokenHolder, "InvalidAddress");

      await expect(
        tokenHolder.transferERC20ToToken(
          ethers.ZeroAddress,
          tokenId,
          1,
          "0x00"
        )
      ).to.be.revertedWithCustomError(tokenHolder, "InvalidAddress");
    });

    it("cannot transfer more balance than the token has", async function () {
      await erc20A.approve(tokenHolder.getAddress(), mockValue);

      await tokenHolder.transferERC20ToToken(
        erc20A.getAddress(),
        tokenId,
        mockValue / BigInt(2),
        "0x00"
      );
      await tokenHolder.transferERC20ToToken(
        erc20A.getAddress(),
        otherTokenHolderId,
        mockValue / BigInt(2),
        "0x00"
      );
      await expect(
        tokenHolder.transferHeldERC20FromToken(
          erc20A.getAddress(),
          tokenId,
          holder.address,
          mockValue, // The token only owns half of this value
          "0x00"
        )
      ).to.be.revertedWithCustomError(tokenHolder, "InsufficientBalance");
    });

    it("cannot transfer balance from not owned token", async function () {
      await erc20A.approve(tokenHolder.getAddress(), mockValue);
      await tokenHolder.transferERC20ToToken(
        erc20A.getAddress(),
        tokenHolderId,
        mockValue,
        "0x00"
      );
      // Other holder is not the owner of tokenId
      await expect(
        tokenHolder
          .transferHeldERC20FromToken(
            erc20A.getAddress(),
            tokenHolderId,
            otherHolder.address,
            mockValue,
            "0x00"
          )
      ).to.be.revertedWithCustomError(
        tokenHolder,
        "OnlyNFTOwnerCanTransferTokensFromIt"
      );
    });

    it("can manage multiple ERC20s", async function () {
      await erc20B.mint(holder.address, mockValue);
      await erc20A.approve(tokenHolder.getAddress(), mockValue);
      await erc20B.approve(tokenHolder.getAddress(), mockValue);

      await tokenHolder.transferERC20ToToken(
        erc20A.getAddress(),
        tokenHolderId,
        ethers.parseEther("3"),
        "0x00"
      );
      await tokenHolder.transferERC20ToToken(
        erc20B.getAddress(),
        tokenHolderId,
        ethers.parseEther("5"),
        "0x00"
      );

      expect(
        await tokenHolder.balanceOfERC20(erc20A.getAddress(), tokenHolderId)
      ).to.equal(ethers.parseEther("3"));
      expect(
        await tokenHolder.balanceOfERC20(erc20B.getAddress(), tokenHolderId)
      ).to.equal(ethers.parseEther("5"));
    });
  });
});
