export const enum CHAINS {
    MODE = 34443,
}
export const enum PROTOCOLS {
    SWAAP = 0,
}

export const enum AMM_TYPES {
    SWAAP_MAKER = 0,
}

export const SUBGRAPH_URLS = {
    [CHAINS.MODE]: {
        [PROTOCOLS.SWAAP]: {
            [AMM_TYPES.SWAAP_MAKER]: "https://api.goldsky.com/api/public/project_clws2t7g7ae9c01xsbnu80a51/subgraphs/swaapv2-mode/1.0.1/gn"
        }
    },
}
export const RPC_URLS = {
    [CHAINS.MODE]: "https://rpc.goldsky.com",
}