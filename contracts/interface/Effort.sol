// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface Effort {
    
    function fetchEconomicPowerOfUser(
        address _owner
    ) external view returns (uint256); 

    function getRelativeEconomicPowerOfUser(
        address _owner
    ) external view returns (uint256); 

    function fetchEconomicPowerOfEffort(
        uint256 tokenId
    ) external view returns (uint256); 

    function getRelativeEconomicPowerOfEffort(uint256 _tokenId ) external view returns (uint256); 

    function economicShareOfEffort(uint256 _tokenId) external view returns (uint256 shareOfEffort); 

    function getTotalUserEconomicPowerOfEffort(address _owner ) external view returns (uint256); 

    function economicShareOfUser(address _owner) external view returns (uint256 shareOfUser);

    function checkSender() external view returns (address);
}