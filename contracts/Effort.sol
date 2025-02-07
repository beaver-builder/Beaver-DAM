// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.24;
import  {Treasury} from "./Treasury.sol";
import  {Governance} from "./Governance.sol";

contract Effort is Treasury,Governance {

    // - TREASURY -

    /**
     * @dev Calculates the total economic power of a user based on all tokens they hold in relation to the treasury.
     * @param _owner The address of the token holder.
     * @return economicPowerOfUser The total economic power of the user.
     */
    function fetchEconomicPowerOfUser( /** -> 1000000 */
        address _owner
    ) public view returns (uint256 economicPowerOfUser) {
        
        economicPowerOfUser = fetchOwnedEconomicPower(_owner);
    }

    /**
     * @dev Calculates the percentage of the treasury's economic power represented by a specific token.
     * @param _tokenId The ID of the token to evaluate.
     * @return The percentage of the total economic power represented by the token.
     */
    function getRelativeEconomicPowerOfEffort(
        uint256 _tokenId
    ) public view returns (uint256) 
    {
        uint256 effortPower = fetchEconomicPowerOfEffort(_tokenId); /** -> 1000000  poder do token*/ 

        if(effortPower == 0) return 0;
        
        return (effortPower * 100 * decimals()) / fetchTotalEconomicPower() ; /** -> 1000000 */
    }

    /**
     * @dev Fetches the economic power of a specific token.
     * @param tokenId The ID of the token to evaluate.
     * @return The economic power of the token.
     */
    function fetchEconomicPowerOfEffort( /** -> 1000000  poder do token*/ 
        uint256 tokenId
    ) public view returns (uint256) {
        return this.balanceOfERC20(lpAddress,tokenId);
    }

    /**
     * @dev Calculates the economic balance of a token relative to the total balance of the treasury.
     * @param _tokenId The ID of the token to evaluate.
     * @return shareOfEffort The economic balance of the token.
     */
    function economicShareOfEffort(
        uint256 _tokenId
    ) public view returns (uint256 shareOfEffort) {
        uint256 balance = totalBalance();
        uint256 effortRelativePowerEconomic = getRelativeEconomicPowerOfEffort(_tokenId);

        if(effortRelativePowerEconomic == 0 || balance == 0) return 0;

        shareOfEffort = (balance * effortRelativePowerEconomic) / (100 * decimals());
    }

    /**
     * @dev Calculates the percentage of the total economic power that a user holds in the treasury.
     * @param _owner The address of the token holder.
     * @return The percentage of the total economic power held by the user.
     */
    function getRelativeEconomicPowerOfUser(
        address _owner
    ) public view returns (uint256) {
        uint256 economicPowerOfUser = fetchEconomicPowerOfUser(_owner);

        if(economicPowerOfUser == 0) return 0;

        return (economicPowerOfUser * 100 * decimals()) / fetchTotalEconomicPower() ;
    }

    /**
     * @dev Calculates the total economic balance of a user relative to the treasury's total balance.
     * @param _owner The address of the token holder.
     * @return shareOfUser The total economic balance of the user.
     */
    function economicShareOfUser(
        address _owner
    ) external view returns (uint256 shareOfUser) {
        uint256 balance = totalBalance();
        uint256 totalUserEconomicPower = getRelativeEconomicPowerOfUser(_owner);

        if(totalUserEconomicPower == 0) return 0;
        
        shareOfUser = (balance * totalUserEconomicPower) / (100 * decimals());
    }

    // - GOVERNANCE -

    /**
     * @dev Calculates the total governance power of a user based on all tokens they hold.
     * @param _owner The address of the token holder.
     * @return governancePowerOfUser The total governance power of the user.
     */
    function fetchGovernancePowerOfUser(
        address _owner
    ) public view returns (uint256 governancePowerOfUser) {

        governancePowerOfUser = _ownedGovernancePower[_owner];
    }

    /**
     * @dev Fetches the governance power associated with a specific token.
     * @param _tokenId The ID of the token to evaluate.
     * @return tokenPower The governance power of the token.
     */
    function fetchGovernancePowerOfEffort(
        uint256 _tokenId
    ) public view returns (uint256 tokenPower) {
       tokenPower = tokenGovernancePower[_tokenId];
    }

    /**
     * @dev Calculates the percentage of the total governance power that a user holds.
     * @param _owner The address of the token holder.
     * @return The percentage of the total governance power held by the user.
     */    
    function getRelativeGovernancePowerOfUser(
        address _owner
    ) public view returns (uint256) {
        uint256 governancePowerOfUser = fetchGovernancePowerOfUser(_owner);

        if(governancePowerOfUser == 0) return 0;

        return (governancePowerOfUser * 100 * decimals()) / fetchTotalGovernancePower();
    }

    /**
     * @dev Calculates the percentage of the total governance power represented by a specific token.
     * @param _tokenId The ID of the token to evaluate.
     * @return The percentage of the total governance power represented by the token.
     */
    function getRelativeGovernancePowerOfEffort(
        uint256 _tokenId
    ) public view returns (uint256) {
        uint256 governancePowerOfEffort = fetchGovernancePowerOfEffort(_tokenId);

        if(governancePowerOfEffort == 0) return 0;
 
        return (governancePowerOfEffort * 100 * decimals()) / fetchTotalGovernancePower();
    }
}