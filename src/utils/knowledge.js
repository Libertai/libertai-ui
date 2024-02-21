const knowledgeDB = {
    "aleph|aleph.im|$aleph": "aleph.im: decentralized, serverless computing & cloud. $ALEPH. Enables data storage, compute & DApps in dcentralzd manner. Ensures data privacy & resilience. Supports cross-chain interactions.",
    "nft|nfts": "NFTs: Non-fungible tokens. Unique, indivisible & verifiable digital assets. Built on blockchain tech, used for art, collectibles, virtual goods, in-game items, etc. Ownership & provenance tracking. Tradable on NFT marketplaces."
};

export function findMatches(text) {
    const wordsRegex = /[\w.$]+/g;
    const terms = text.toLowerCase().match(wordsRegex) || [];
    const matches = new Set();

    for (const term of terms) {
        for (const key in knowledgeDB) {
            if (Object.prototype.hasOwnProperty.call(knowledgeDB, key)) {
                const keyTerms = key.toLowerCase().split('|');
                if (keyTerms.includes(term)) {
                    matches.add(knowledgeDB[key]);
                }
            }
        }
    }

    return Array.from(matches);
}