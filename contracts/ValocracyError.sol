// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.24;

// If the array length exceeds 100
error ArrayExceedsMaxLengthOf100();
// Page size must be greater than 0
error PageSizeMustBeGreaterThanZero();
// Page index does not exist
error PageIndexOutOfBounds();
// Governance token cannot be transferred
error NotTransferableSoulboundToken();
// Caller is not the owner of the NFT
error SenderIsNotTheOwnerOfTheToken();
// Token is not of the economic type
error TokenIsNotEconomic(); 
// Token rarity cannot be zero
error RarityCannotBeZero();
// Insufficient balance to make a Claim
error InsufficientClaimPayment();