// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {RMRKTokenHolder} from "./RMRK/tokenHolder/RMRKTokenHolder.sol";
import {IERC165} from "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title Treasury
 * @dev Contract to manage the withdrawal and tracking of ERC-20 tokens, with ownership control
 */
contract Treasury is  RMRKTokenHolder {

    mapping(address => uint256) private _ownedEconomicBalances;
    mapping(address => uint256) private _ownedEconomicPower;
    uint256 private _economicMintedSupply;
    uint256 internal _totaEconomicPower;
    address internal lpAddress;
    address internal erc20LpValocracyAddress;

    /**
     * @dev Returns the total balance of ERC-20 tokens of a specific type held by the contract.
     * @return uint256 The total amount of the specified token held by the contract.
     */
    function totalBalance() 
    public view returns (uint256) {
        // Returns the balance of the specified ERC-20 token held by the contract
        return IERC20(erc20LpValocracyAddress).balanceOf(address(this));
    }
    
    /**
     * @dev Fetches the total economic power accumulated in the treasury.
     * @return uint256 The total economic power.
     */
    function fetchTotalEconomicPower()
    public view returns(uint256) {
        return _totaEconomicPower;
    }

    /**
     * @dev Fetches the economic power associated with a specific owner.
     * @param _owner The address of the owner to query.
     * @return ownedEconomicPower The economic power owned by the specified address.
     */
    function fetchOwnedEconomicPower(
        address _owner
    )public view returns(uint256 ownedEconomicPower) {
        ownedEconomicPower = _ownedEconomicPower[_owner];
    }

    /**
     * @dev Fetches the total number of economic tokens minted.
     * @return uint256 The total number of minted economic tokens.
     */
    function fetchEconomicMintedSupply()
    public view returns(uint256) {
        return _economicMintedSupply;
    }

    /**
     * @dev Mints an economic token and assigns its economic power to the specified owner.
     * Transfers the corresponding ERC-20 tokens to the new token.
     * @param _to The address of the owner receiving the minted token.
     * @param _tokenId The ID of the minted token.
     * @param _rarity The rarity level of the token, which determines its economic power.
     */
    function _mintageEconomicToken( 
        address _to,
        uint256 _tokenId,
        uint256 _rarity
    ) internal {

        _economicMintedSupply += 1;
        _ownedEconomicBalances[_to] += 1;

        _addEconomicPower(_rarity * decimals());
        transferERC20ToToken(lpAddress, _tokenId, _rarity * decimals(), "0x");
        
        _ownedEconomicPower[_to] +=_rarity * decimals();
    }

    /**
     * @dev Adds economic power to the total economic power in the treasury.
     * @param _power The amount of economic power to add.
     */
    function _addEconomicPower(
        uint256 _power
    ) internal {
        _totaEconomicPower += _power;
    }

    /**
     * @dev Sets the address of the ERC-20 token contract used within the Valocracy system.
     * @param _erc20CoinValocracyAddress The address of the ERC-20 contract.
     */
    function _setErc20LpValocracyAddress(
        address _erc20CoinValocracyAddress
    ) internal {
        erc20LpValocracyAddress = _erc20CoinValocracyAddress;
    }

    /**
     * @dev Fetches the address of the ERC-20 token contract used within the Valocracy system.
     * @return address The address of the ERC-20 contract.
     */
    function fetchErc20CoinValocracyAddress(   
    ) external view returns(address){
        return erc20LpValocracyAddress;
    }

    /**
     * @dev Sets the address of the liquidity provider (LP) contract.
     * @param _lpAddress The address of the LP contract.
     */
    function _setLpAddress(
        address _lpAddress
    ) internal {
        lpAddress = _lpAddress;
    }

    /**
     * @dev Fetches the address of the liquidity provider (LP) contract.
     * @return address The address of the LP contract.
     */
    function fetchLpAddress(   
    ) external view returns(address){
        return lpAddress;
    }

    /**
     * @dev Fetches the number of economic tokens held by a specific owner.
     * @param owner The address of the owner to query.
     * @return balance The number of economic tokens held by the specified address.
     */
    function balanceOfEconomic(
        address owner
    ) public view returns (uint256 balance) {
        balance = _ownedEconomicBalances[owner];
    }

    /**
     * @dev Allows the withdrawal of a specific amount of ERC-20 tokens by a token owner.
     * @param withdrawAmount The amount of tokens to withdraw.
     * @param ownerToken The address of the token owner initiating the withdrawal.
     */
    function _withdrawByClaim(
        uint256 withdrawAmount,
        address ownerToken
    ) internal {
        _withdraw(withdrawAmount, ownerToken);
    }

    /**
     * @dev Withdraws ERC-20 tokens from the contract to a specified wallet.
     * @param _amount The amount of tokens to withdraw.
     * @param _wallet The address of the wallet to which the tokens will be transferred.
     */
    function _withdraw(
        uint256 _amount,
        address _wallet
    ) private {
        // Transfers the specified amount of tokens to the given wallet address
        IERC20(erc20LpValocracyAddress).transfer(_wallet, _amount);
    }

    /**
     * @dev Burns an economic token, reducing the total economic power and supply.
     * @param owner The address of the token owner.
     * @param _power The amount of economic power to be burned.
     */
    function _burnTokenEconomic(
        address owner,
        uint256 _power
    ) internal {

        _totaEconomicPower -= _power;
        _economicMintedSupply -= 1;
        _ownedEconomicBalances[owner] -= 1;
        _ownedEconomicPower[owner] -= _power;
    }

    /**
     * @dev Transfers economic power from one owner to another.
     * @param _from The address of the current token owner.
     * @param _to The address of the new token owner.
     * @param _power The amount of economic power to transfer.
     */
    function _transferTokenEconomic(
        address _from,
        address _to,
        uint256 _power
    ) internal {

        _ownedEconomicBalances[_from] -= 1;
        _ownedEconomicPower[_from] -= _power;

        _ownedEconomicBalances[_to] += 1;
        _ownedEconomicPower[_to] += _power;
    }

    /**
     * @dev Returns the decimal precision used in economic power calculations.
     * @return uint256 The decimal precision (10^18).
     */
    function decimals()
    internal pure returns (uint256){
        return 10 ** 6;
    }
    
    /**
     * @inheritdoc IERC165
     */
    function supportsInterface(
        bytes4 interfaceId
    ) public view virtual override(RMRKTokenHolder) returns (bool) {
        return RMRKTokenHolder.supportsInterface(interfaceId);
    }

    function transferHeldERC20FromToken(
        address erc20Contract,
        uint256 tokenId,
        address to,
        uint256 amount,
        bytes memory data
    ) external override virtual  {}
}

/**



 */