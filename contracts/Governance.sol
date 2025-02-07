// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.24;

contract Governance  {

    mapping(address => uint256) private _ownedGovernanceBalances;
    mapping(address => uint256) internal _ownedGovernancePower;
    mapping(uint256 tokenId => uint256 power) internal tokenGovernancePower;
    uint256 private _totalGovernanceBalances;
    uint256 private totalGovernacePower;

    /**
     * @dev Fetches the total number of governance tokens minted.
     * @return uint256 The total number of minted governance tokens.
     */
    function fetchGovernanceMintedSupply()
    public view returns(uint256) {
        return _totalGovernanceBalances;
    }

    /**
     * @dev Fetches the number of governance tokens held by a specific owner.
     * @param owner The address of the owner to query.
     * @return balance The number of governance tokens held by the specified address.
     */
    function balanceOfGovernance(
        address owner
    ) public view returns (uint256 balance) {
        balance = _ownedGovernanceBalances[owner];
    }

    /**
     * @dev Mints a governance token and assigns its governance power to the specified owner.
     * @param _to The address of the owner receiving the minted token.
     * @param _tokenId The ID of the minted token.
     * @param _rarity The rarity level of the token, which determines its governance power.
     */
    function _mintageGovernanceToken(
        address _to, uint256 _tokenId, uint256 _rarity
    ) internal {
        
        _ownedGovernanceBalances[_to] += 1;
        _ownedGovernancePower[_to] +=_rarity;
        tokenGovernancePower[_tokenId] = _rarity;
        _totalGovernanceBalances += 1;
        totalGovernacePower += _rarity;
    }

    /**
     * @dev Fetches the total governance power accumulated across all holders.
     * @return uint256 The total governance power.
     */
    function fetchTotalGovernancePower()
    public view returns (uint256) {
       return totalGovernacePower;
    }
} 