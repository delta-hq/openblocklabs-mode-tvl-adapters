import { AMM_TYPES, CHAINS, PROTOCOLS, SUBGRAPH_URLS } from "./config";

export interface Position {
    poolName: string,
    poolAddress: string,
    userAddress: string,
    poolShares: number
    tokenA: string,
    balanceA: string,
    tokenB: string,
    balanceB: string,
    valueInUSD: number,
};

export const getPositionsForAddressByPoolAtBlock = async (
    blockNumber: number,
    address: string,
    poolId: string,
    chainId: CHAINS,
    protocol: PROTOCOLS,
    ammType: AMM_TYPES
): Promise<Position[]> => {
    let subgraphUrl = (SUBGRAPH_URLS as any)[chainId][protocol][ammType];
    let blockQuery = blockNumber !== 0 ? ` block: {number: ${blockNumber}}` : ``;
    let poolQuery = poolId !== "" ? ` poolId: "${poolId.toLowerCase()}"}` : ``;
    let ownerQuery = address !== "" ? `userAddress: "${address.toLowerCase()}"` : ``;

    let whereQuery = ownerQuery !== "" && poolQuery !== "" ? `where: {balance_gt: 0.000000000001, ${ownerQuery} , ${poolQuery}}` : ownerQuery !== "" ? `where: {balance_gt: 0.000000000001, ${ownerQuery}}` : poolQuery !== "" ? `where: {balance_gt: 0.000000000001, ${poolQuery}}` : `where: {balance_gt: 0.000000000001}`;
    let fetchNext = true;
    let skip = 0
    let result: Position[] = [];
    while (fetchNext) {
        let query = `{
            poolShares(${whereQuery} ${blockQuery}, first:1000, skip: ${skip}) {
                id
                poolId {
                  id
                  name
                  address
                  tokens {
                    address
                    balance
                    decimals
                  }
                  totalLiquidity
                  totalShares
                }
                balance
                userAddress {
                  id
                }
            }
        }`;

        // console.log(query)

        let response = await fetch(subgraphUrl, {
            method: "POST",
            body: JSON.stringify({ query }),
            headers: { "Content-Type": "application/json" },
        });
        let data = await response.json();
        let positions = data.data.poolShares;

        for (let i = 0; i < positions.length; i++) {

            const balanceA = Number(positions[i].poolId.tokens[0].balance) * Number(positions[i].balance) / Number(positions[i].poolId.totalShares);
            const balanceB = Number(positions[i].poolId.tokens[1].balance) * Number(positions[i].balance) / Number(positions[i].poolId.totalShares);

            result.push(
                {
                    poolName: positions[i].poolId.name,
                    poolAddress: positions[i].poolId.address,
                    userAddress: positions[i].userAddress.id,
                    poolShares: positions[i].balance,
                    tokenA: positions[i].poolId.tokens[0].address,
                    balanceA: balanceA.toFixed(positions[i].poolId.tokens[0].decimals),
                    tokenB: positions[i].poolId.tokens[1].address,
                    balanceB: balanceB.toFixed(positions[i].poolId.tokens[1].decimals),
                    valueInUSD: Number(positions[i].balance) * Number(positions[i].poolId.totalLiquidity) / Number(positions[i].poolId.totalShares)
                }
            )
        }

        if (positions.length < 1000) {
            fetchNext = false;
        }
        skip += 1000
    }
    return result;
}