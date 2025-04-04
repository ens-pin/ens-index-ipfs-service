export const ensContentHashEventAbi = [
    {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "bytes32",
            "name": "node",
            "type": "bytes32"
          },
          {
            "indexed": false,
            "internalType": "bytes",
            "name": "hash",
            "type": "bytes"
          }
        ],
        "name": "ContenthashChanged",
        "type": "event"
    },
] as const