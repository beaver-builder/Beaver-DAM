// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface Treasury {

    function fetchTotalEconomicPower() external view returns(uint256);
    
    function totalBalance() external view returns (uint256);

    function getErc20Address() external view  returns(address);
    
    function getLpAddress() external view  returns(address);

    function getOwnerTokensEconomics(address _owner) external view returns (uint256[] memory);

    function fetchEconomicPowerOfEffort(uint256 tokenId) external view returns (uint256);
}