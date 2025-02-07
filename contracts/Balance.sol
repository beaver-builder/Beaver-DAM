// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.24;

contract Balance {

    function getBalance(address walletAddress) public view returns (uint256) {
        return walletAddress.balance;
    }
}
