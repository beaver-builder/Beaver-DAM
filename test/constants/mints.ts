import { MintData } from "@/types/MintData.type";

type MintsData = {
    mintDatas:MintData[];
    mintBatch:MintData[]
    rarityTotal:number
};

function getRandomRarity(): number {
    return Math.floor(Math.random() * 100) + 1;
}

function getRandom(): number {
    return Math.floor(Math.random() * 20) + 1;
}

export const getMintsDatas = (address:string,quantityMints:number):MintsData => {

    const mintDatas:MintData[] = []
    const mintBatch:MintData[] = []
    let rarityTotal = 0;

    for (let i = 0; i < quantityMints; i++) {

        const rarity = getRandomRarity();
        
        mintDatas.push({
            to:address,
            _tokenURIEconomic:`dale ${i+address}`,
            _tokenURIGovernance:`dale ${i+address}`,
            rarity:rarity,
            tokenMetadata:{id:"0",name:"dale",text:"Dale nessa parada!!"},
            mintCost:708018308554095n
        })

        rarityTotal += rarity;

    }

    for (let i = 0; i < getRandom(); i++) {

        const rarity = getRandomRarity();
        
        mintBatch.push({
            to:address,
            _tokenURIEconomic:`dale mintBatch ${i+address}`,
            _tokenURIGovernance:`dale mintBatch ${i+address}`,
            rarity:rarity,
            tokenMetadata:{id:"0",name:"dale",text:"Dale nessa parada!!"},
            mintCost:708018308554095n
        })

        rarityTotal += rarity;

    }

    return {
        mintDatas:mintDatas,
        mintBatch:mintBatch,
        rarityTotal:rarityTotal
    }
}
