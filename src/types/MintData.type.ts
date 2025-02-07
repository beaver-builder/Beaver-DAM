type TokenMetadata = {
    id: string;
    name: string;
    text: string;
};
  
type MintData = {
    to: string; // Endereço de destino (address)
    _tokenURIGovernance: string;
    _tokenURIEconomic: string; // URI do token econômico e governamental
    rarity: number; // Nível de raridade (uint256)
    tokenMetadata: TokenMetadata; // Dados do metadado do token
    mintCost:bigint
}

export { MintData, TokenMetadata};