// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.24;
import {Collection} from "./Collection.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./ValocracyError.sol";
 
contract Valocracy is Collection,ReentrancyGuard {
    
    // Event emitted when a token is claimed and a share of the treasury is withdrawn
    event Claimed(uint256 indexed tokenId, uint256 shareOfEffort);
    // Event emitted when a token is forfeited without withdrawing from the treasury
    event Forfeiting(uint256 indexed tokenId, uint256 shareOfEffort);
    
    /** 
     @param _collectionMetadata Metadata for the collection
     @param _lpAddress Address of the liquidity provider (LP)
     @param _erc20LpValocracyAddress Address of the ERC20 token for LP in Valocracy
     @param _maxSupply Maximum supply of tokens in the collection
    */
    constructor(
      string memory _collectionMetadata,
      address _lpAddress,
      address _erc20LpValocracyAddress,
      uint256 _maxSupply,
      address _owner
    )
        Collection(
            "Beaver DAM",
            "Beaver DAM",
            _collectionMetadata,
            _maxSupply,
            _owner,
            200
        )
        
    {
        lpAddress = _lpAddress;
        erc20LpValocracyAddress = _erc20LpValocracyAddress;
        transferOwnership(_owner);
    }

    /**
     * @dev Allows the owner of an economic token to claim a share of the treasury.
     * The function calculates the economic power of the token and withdraws the equivalent
     * amount from the treasury. Once claimed, the token is burned.
     * The caller must pay the original minting cost of the token.
     * @param _tokenId The ID of the economic token to be claimed.
     */
    function claim(
        uint256 _tokenId
    ) external payable {
        address ownerToken = ownerOf(_tokenId);

        if (msg.sender != ownerToken) revert SenderIsNotTheOwnerOfTheToken();
        if (!isTokenEconomic(ownerToken, _tokenId)) revert TokenIsNotEconomic();

        uint256 mintCost = getEconomicTokenMintCost(_tokenId);
        if (msg.value < mintCost) revert InsufficientClaimPayment();

        uint256 shareOfEffort = economicShareOfEffort(_tokenId);

        _withdrawByClaim(shareOfEffort, ownerToken);

        burn(_tokenId);

        emit Claimed(_tokenId, shareOfEffort);
    }


    /**
     * @dev Allows the owner of an economic token to forfeit their claim without
     * withdrawing any funds from the treasury. The token is burned, representing
     * the owner's choice to abstain from receiving funds.
     * @param _tokenId The ID of the economic token to be forfeited.
     */
    function forfeiting(
        uint256 _tokenId
    ) external payable{
        
        address ownerToken = ownerOf(_tokenId);

        if(msg.sender != ownerToken) revert SenderIsNotTheOwnerOfTheToken();
        if(!isTokenEconomic(ownerToken,_tokenId)) revert TokenIsNotEconomic();

        uint256 mintCost = getEconomicTokenMintCost(_tokenId);
        if (msg.value < mintCost) revert InsufficientClaimPayment();

        uint256 shareOfEffort = economicShareOfEffort( _tokenId);
        burn(_tokenId);
        
        emit Forfeiting(_tokenId, shareOfEffort);
    }

    /**
     * @dev Sets the address of the liquidity provider (LP) contract.
     * This function can only be called by the owner or a designated contributor.
     * @param _lpAddress The new LP address to be set.
     */
    function setLpAddress(
        address _lpAddress
    ) internal onlyOwnerOrContributor{
        _setLpAddress(_lpAddress);
    }


    /**
     * @dev Sets the address of the ERC-20 token used within the Valocracy system.
     * This function can only be called by the owner or a designated contributor.
     * @param _erc20LpValocracyAddress The new ERC-20 LP address to be set.
     */
    function setErc20LpValocracyAddress(
        address _erc20LpValocracyAddress
    ) external onlyOwnerOrContributor{
        _setErc20LpValocracyAddress(_erc20LpValocracyAddress);
    }

    /**
     * @dev Withdraws all native tokens sent to this contract.
     * @dev This function is private and ensures that any Ether balance held by the contract is transferred to the contract owner.
     */
    function withdrawNativeToken() external onlyOwner nonReentrant{
        uint256 contractBalance = address(this).balance;
        require(contractBalance > 0, "Contract balance is zero");

        address payable recipient = payable(owner());

        // Using call method to transfer Ether and handle potential errors
        (bool success, ) = recipient.call{value: contractBalance}("");
        require(success, "Transfer failed");
    }
}
    