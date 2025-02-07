// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.24;

import {RMRKAbstractNestable} from "./RMRK/abstract/RMRKAbstractNestable.sol";
import {RMRKTokenURIPerToken} from "@rmrk-team/evm-contracts/contracts/implementations/utils/RMRKTokenURIPerToken.sol";
import {RMRKImplementationBase} from "@rmrk-team/evm-contracts/contracts/implementations/utils/RMRKImplementationBase.sol";
import {IERC165} from "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import {Effort} from "./Effort.sol";
import {Treasury} from "./Treasury.sol";
import "hardhat/console.sol";
import "./ValocracyError.sol";

error OnlyNFTOwnerCanTransferTokensFromIt();

contract Collection is RMRKAbstractNestable, RMRKTokenURIPerToken, Effort {

    // Event emitted when a new token is minted
    event Mint(address indexed to, uint256 indexed governanceId, uint256 indexed economicId);

    struct TokenMetadata {
        string id;
        string name;
        string text;
    }

    struct TokensIds {
        uint256 governanceId;
        uint256 economicId;
    }

    struct MintData {
        address to;
        string _tokenURIGovernance;
        string _tokenURIEconomic;
        uint256 rarity;
        TokenMetadata tokenMetadata;
        uint256 mintCost;
    }

    mapping(uint256  => TokensIds) private _allTokensIds;
    mapping(uint256  => uint256 ) private _allTokensIndex;

    mapping(address  => mapping(uint256 => TokensIds)) internal _ownedToken;
    mapping(uint256  => uint256) internal _ownedTokenIndex;

    mapping(address => uint256) private _ownedbalance;
    uint256 private _balanceAllTokens;

    mapping(uint256 => TokenMetadata) private tokenIdMetadata;

    mapping(uint256 => uint256) private tokenMintCost;

    constructor(
        string memory name,
        string memory symbol,
        string memory collectionMetadata,
        uint256 maxSupply,
        address royaltyRecipient,
        uint16 royaltyPercentageBps
    )
        RMRKImplementationBase(
            name,
            symbol,
            collectionMetadata,
            maxSupply,
            royaltyRecipient,
            royaltyPercentageBps
        )
    {}

    /**
     * @dev Mints a new token to the specified address with a given token URI.
     * @param to The address to receive the minted token.
     * @param tokenURI The URI associated with the newly minted token.
     * @return The ID of the newly minted token.
     */
    function _mint(
        address to,
        string memory tokenURI
    ) private  returns (uint256) {
        (uint256 nextToken, uint256 totalSupplyOffset) = _prepareMint(1);
        totalSupplyOffset;

        _setTokenURI(nextToken, tokenURI);
        _safeMint(to, nextToken, "");
        
        return nextToken;
    }

    /**
     * @dev Mints a governance and economic token pair with specified metadata.
     * @param _to The address to receive the minted tokens.
     * @param _tokenURIGovernance The URI associated with the governance token.
     * @param _tokenURIEconomic The URI associated with the economic token.
     * @param _rarity The rarity level of the tokens being minted.
     * @param tokenMetadata Metadata information for the tokens being minted.
     */
    function mintValocracy(
        address _to,
        string memory _tokenURIGovernance,
        string memory _tokenURIEconomic,
        uint256 _rarity,
        TokenMetadata memory tokenMetadata,
        uint256 mintCost
    ) public onlyOwnerOrContributor {

        if(_rarity == 0)revert RarityCannotBeZero();
        
        uint256 tokenIdGov = _mint(_to, _tokenURIGovernance);
        _mintageGovernanceToken(_to, tokenIdGov, _rarity * decimals());

        uint256 tokenIdEco = _mint(_to, _tokenURIEconomic);

        tokenIdMetadata[tokenIdGov] = tokenMetadata;
        tokenIdMetadata[tokenIdEco] = tokenMetadata;

        uint256 index = balanceOfAllTokens();
        
        _allTokensIds[index] = TokensIds({
            governanceId: tokenIdGov,
            economicId: tokenIdEco
        });
        
        _allTokensIndex[tokenIdGov] = index;
        _allTokensIndex[tokenIdEco] = index;

        uint256 ownerIndex = balanceOfOwner(_to);

        _ownedToken[_to][ownerIndex] = TokensIds({
            governanceId: tokenIdGov,
            economicId: tokenIdEco
        });
        _ownedTokenIndex[tokenIdGov] = ownerIndex;
        _ownedTokenIndex[tokenIdEco] = ownerIndex;
        _ownedbalance[_to] ++;

        _mintageEconomicToken(_to, tokenIdEco, _rarity);

        _balanceAllTokens ++;

        tokenMintCost[tokenIdEco] = mintCost;

        emit Mint(_to,tokenIdGov,tokenIdEco);
    }

    /**
     * @dev Mints a batch of governance and economic tokens based on the provided mint data.
     * @param mintData An array of MintData structs containing the information for each minting operation.
     */
    function mintBatch(MintData[] memory mintData) external onlyOwnerOrContributor {

        if(mintData.length > 100) revert ArrayExceedsMaxLengthOf100();

        for (uint256 i = 0; i < mintData.length; i++) {
            
            mintValocracy(
                mintData[i].to,
                mintData[i]._tokenURIGovernance,
                mintData[i]._tokenURIEconomic,
                mintData[i].rarity,
                mintData[i].tokenMetadata,
                mintData[i].mintCost
            );
        }

    }

    /**
     * @dev Fetches the tokens owned by an address in paginated form.
     * @param _owner The address of the token owner.
     * @param _pageIndex The page index for the query.
     * @param _pageSize The number of tokens to return per page.
     * @param _ascending Whether the tokens should be returned in ascending order.
     * @return An array of TokensIds structs containing the token IDs.
     */
    function fetchOwnerTokens(address _owner, uint256 _pageIndex, uint256 _pageSize, bool _ascending) external view returns (TokensIds[] memory) {
        
        if(_pageSize <= 0) revert PageSizeMustBeGreaterThanZero();
        
        uint256 tokensCount = balanceOfOwner(_owner);
        if(_balanceAllTokens == 0) return new TokensIds[](0);

        uint256 start = _pageIndex * _pageSize;
        
        if(start >= tokensCount) revert PageIndexOutOfBounds();
        
        uint256 end = start + _pageSize;

        if (end > tokensCount) {
            end = tokensCount;
        }

        uint256 returnSize = end - start;
        TokensIds[] memory tokensPage = new TokensIds[](returnSize);

        if (_ascending) {
 
            for (uint256 i = 0; i < returnSize; i++) {
                
                tokensPage[i] = _ownedToken[_owner][start+i];
            }
        } else {
  
            for (uint256 i = 0; i < returnSize; i++) {

                tokensPage[i] = _ownedToken[_owner][end - 1 - i];
            }
        }

        return tokensPage;
    }

    /**
     * @dev Gets the minting cost for a specific economic token.
     * @param tokenId The ID of the economic token.
     * @return The minting cost associated with the token.
     */
    function getEconomicTokenMintCost(uint256 tokenId) public view returns (uint256) {
        return tokenMintCost[tokenId];
    }

    /**
     * @dev Retrieves metadata associated with a specific token ID.
     * @param tokenId The ID of the token to fetch metadata for.
     * @return A TokenMetadata struct containing the metadata for the specified token ID.
     */
    function getTokenMetadata(uint256 tokenId) public view returns(TokenMetadata memory) {
        return tokenIdMetadata[tokenId];
    }

    /**
     * @dev Fetches all tokens in the contract in paginated form.
     * @param _pageIndex The page index for the query.
     * @param _pageSize The number of tokens to return per page.
     * @param _ascending Whether the tokens should be returned in ascending order.
     * @return An array of TokensIds structs containing the token IDs.
     */
    function fetchAllTokens(uint256 _pageIndex, uint256 _pageSize, bool _ascending) 
        external view returns (TokensIds[] memory) 
    {
        if(_pageSize <= 0) revert PageSizeMustBeGreaterThanZero();

        uint256 tokensCount = _balanceAllTokens;
        if(_balanceAllTokens == 0) return new TokensIds[](0);

        uint256 start = _pageIndex * _pageSize;

        if(start >= tokensCount) revert PageIndexOutOfBounds();

        uint256 end = start + _pageSize;

        if (end > tokensCount) {
            end = tokensCount;
        }

        uint256 returnSize = end - start;
        TokensIds[] memory tokensPage = new TokensIds[](returnSize);

        if (_ascending) {
        
            for (uint256 i = 0; i < returnSize; i++) {
                tokensPage[i] = _allTokensIds[start + i];
            }
        } else {
          
            for (uint256 i = 0; i < returnSize; i++) {
                tokensPage[i] = _allTokensIds[end - 1 - i];
            }
        }

        return tokensPage;
    }

    /**
     * @dev Removes a token from the ownership record of the specified owner.
     * Handles cleanup during token transfers or burns.
     * @param _owner The address of the token owner.
     * @param _tokenId The ID of the token to be removed.
     */
    function _removeTokenFromOwner(
        address _owner,
        uint256 _tokenId
    ) internal {

        //index do dono
        uint256 indexDelOwnerToken = _ownedTokenIndex[_tokenId];

        //Em caso de CLAIM, Se ambos os IDs são zero, remove o token do array
        if(_ownedToken[_owner][indexDelOwnerToken].governanceId == 0){
    
            uint256 ownerLastIndex = balanceOfOwner(_owner) - 1;

            if(indexDelOwnerToken != ownerLastIndex){
                TokensIds memory lastOwnerTokenId = _ownedToken[_owner][ownerLastIndex];

                _ownedToken[_owner][indexDelOwnerToken] = lastOwnerTokenId;
                if(lastOwnerTokenId.governanceId != 0) _ownedTokenIndex[lastOwnerTokenId.governanceId] = indexDelOwnerToken;
                if(lastOwnerTokenId.economicId != 0) _ownedTokenIndex[lastOwnerTokenId.economicId] = indexDelOwnerToken;
            }

            delete _ownedToken[_owner][ownerLastIndex];
            delete _ownedTokenIndex[_tokenId];

            _ownedbalance[_owner] --;
        
            return;
        }

        _ownedToken[_owner][indexDelOwnerToken].economicId = 0;
    }

    /**
     * @dev Removes a token from the global list of all tokens.
     * If the token being removed is the last in the list, it is deleted directly.
     * Otherwise, it replaces the token being removed with the last token in the list,
     * and then adjusts the indices accordingly.
     * @param _tokenId The ID of the token to remove from the global list.
     */
    function _removeFromAllTokens(
        uint256 _tokenId
    ) internal {
        
        uint256 indexDelToken = indexByToken(_tokenId);

        if(_allTokensIds[indexDelToken].governanceId == 0){
           
            uint256 lastIndexAllToken = balanceOfAllTokens() - 1;

            if(indexDelToken != lastIndexAllToken){
                TokensIds memory lastAllToken = _allTokensIds[lastIndexAllToken];
                
                _allTokensIds[indexDelToken] = lastAllToken;
                if(lastAllToken.economicId != 0) _allTokensIndex[lastAllToken.economicId] = indexDelToken;
                if(lastAllToken.governanceId != 0) _allTokensIndex[lastAllToken.governanceId] = indexDelToken;
            }

            delete _allTokensIds[lastIndexAllToken];
            delete _allTokensIndex[_tokenId];

            _balanceAllTokens--;

            return;
        }
        
        _allTokensIds[indexDelToken].economicId = 0;
    }

    /**
     * @dev Returns the total number of tokens stored in the global list.
     * @return The total balance of all tokens.
     */
    function balanceOfAllTokens() public view returns (uint256) {
        return _balanceAllTokens;
    }

    /**
     * @dev Returns the number of tokens owned by a specific address.
     * @param owner The address of the token owner.
     * @return balance The number of tokens owned by the given address.
     */
    function balanceOfOwner(
        address owner
    ) public view returns (uint256 balance) {
        balance = _ownedbalance[owner];
    }

    /**
     * @dev Retrieves the token ID at a given index in the global list.
     * @param _index The index to query.
     * @return token The token ID at the specified index.
     */
    function tokenByIndex(
        uint256 _index
    ) public view returns (uint256 token) {
        token = _allTokensIndex[_index];
    }

    /**
     * @dev Retrieves the token IDs owned by a specific address at a given index.
     * @param owner The address of the token owner.
     * @param _index The index to query within the owner's list.
     * @return The TokensIds struct containing the governance and economic token IDs.
     */
    function tokenOwnerByIndex(
        address owner,
        uint256 _index
    ) public view returns (TokensIds memory) {
        return _ownedToken[owner][_index];
    }

    /**
     * @dev Retrieves the index of a specific token ID in the global list.
     * @param _tokenId The ID of the token to query.
     * @return The index of the specified token ID in the global list.
     */
    function indexByToken(
        uint256 _tokenId
    ) public view returns (uint256) {
        return _allTokensIndex[_tokenId];
    }

    /**
     * @dev Retrieves the index of a specific token ID within the list of a specific owner.
     * @param _tokenId The ID of the token to query.
     * @return The index of the specified token ID within the owner's list.
     */
    function indexOwnerByToken(
        uint256 _tokenId
    ) public view returns (uint256) {
        return _ownedTokenIndex[_tokenId];
    }

    /**
     * @dev Transfers ownership of an economic token from one address to another.
     * Adjusts the ownership record and updates the economic power of the new owner.
     * @param _from The address transferring the token.
     * @param _to The address receiving the token.
     * @param _tokenId The ID of the economic token being transferred.
     */
    function _transferOwnerEconomicToken(address _from, address _to, uint256 _tokenId) private {
        uint256 index = balanceOfOwner(_to);
        _ownedToken[_to][index] = TokensIds({
            governanceId: 0,
            economicId: _tokenId
        });
        _ownedTokenIndex[_tokenId] = index;

        _ownedbalance[_to] ++;

        uint256 economicPowerOfEffort = fetchEconomicPowerOfEffort(_tokenId);
        _transferTokenEconomic(_from,_to,economicPowerOfEffort);
    }

    /**
     * @dev Transfers an economic token to the global list.
     * Updates the global list to include the transferred economic token.
     * @param _tokenId The ID of the economic token being transferred.
     */
    function _transferAllEconomicToken(uint256 _tokenId) private {
        uint256 index = balanceOfAllTokens();
        _allTokensIds[index] = TokensIds({
            governanceId: 0,
            economicId: _tokenId
        });
        _allTokensIndex[_tokenId] = index;

        _balanceAllTokens ++;
    }

    /**
     * @dev Checks if a specific token is an economic token for a given owner.
     * @param _owner The address of the token owner.
     * @param _tokenId The ID of the token to check.
     * @return True if the token is an economic token, false otherwise.
     */
    function isTokenEconomic(
        address _owner,
        uint256 _tokenId
    ) internal view returns (bool) {

        uint256 index = indexOwnerByToken(_tokenId);
        TokensIds memory token = tokenOwnerByIndex(_owner,index);

        return token.economicId == _tokenId;
    }

    /**
     * @dev Checks if a specific token is a governance token for a given owner.
     * @param _owner The address of the token owner.
     * @param _tokenId The ID of the token to check.
     * @return True if the token is a governance token, false otherwise.
     */
    function isTokenGovernance(
        address _owner,
        uint256 _tokenId
    ) internal view returns (bool) {
        
        uint256 index = indexOwnerByToken(_tokenId);
        TokensIds memory token = tokenOwnerByIndex(_owner,index);

        return token.governanceId == _tokenId;
    }

    /**
     * @dev Handles the logic after a token transfer occurs.
     * This function updates the ownership records and adjusts the global token list.
     * It is called internally after each transfer or burn operation.
     * @param _from The address transferring the token.
     * @param _to The address receiving the token, or the zero address if burning.
     * @param _tokenId The ID of the token being transferred or burned.
     */
    function _afterTokenTransfer(
        address _from,
        address _to,
        uint256 _tokenId
    ) internal override {
        super._afterTokenTransfer(_from, _to, _tokenId);

        if (_from != address(0) && _to != address(0)) {
            
            _removeTokenFromOwner(_from, _tokenId);
            
            uint256 indexToken = _allTokensIndex[_tokenId];
            
            if(_allTokensIds[indexToken].governanceId != 0){
                _removeFromAllTokens(_tokenId);
                _transferAllEconomicToken(_tokenId);
            }

            _transferOwnerEconomicToken(_from,_to,_tokenId);

            return;
        }

        if(_from != address(0) && _to == address(0)){

            uint256 economicPowerOfEffort = fetchEconomicPowerOfEffort(_tokenId);
            _removeFromAllTokens(_tokenId);
            _removeTokenFromOwner(_from,_tokenId);
            _burnTokenEconomic(_from,economicPowerOfEffort);
        }
    }

    /**
     * @dev Handles the logic before a token transfer occurs.
     * This function enforces restrictions, such as preventing the transfer or burn of governance tokens.
     * It is called internally before each transfer or burn operation.
     * @param _from The address transferring the token.
     * @param _to The address receiving the token, or the zero address if burning.
     * @param _tokenId The ID of the token being transferred or burned.
     */
    function _beforeTokenTransfer(
        address _from,
        address _to,
        uint256 _tokenId
    ) internal virtual override {
        super._beforeTokenTransfer(_from, _to, _tokenId);

        if (_from != address(0) && _to != address(0)) {
            require(
                !isTokenGovernance(_from,_tokenId),
                "Not transferable, soulbound NFT!"
            );
        }

        if(_from != address(0) && _to == address(0)){

            require(
                !isTokenGovernance(_from,_tokenId),
                "NFT Moon Badges are not burnable!"
            );
        }


    }

    /**
     * @inheritdoc IERC165
     */
    function supportsInterface(
        bytes4 interfaceId
    ) public view override(Treasury, RMRKAbstractNestable) returns (bool) {
        return
            RMRKAbstractNestable.supportsInterface(interfaceId) ||
            Treasury.supportsInterface(interfaceId);
    }

}