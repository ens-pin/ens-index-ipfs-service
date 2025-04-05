import { createConfig } from "ponder";
import { http } from "viem";

import { ensContentHashEventAbi } from "./abis/ensContentHashEventAbi";
import { ensNameWrapperAbi } from "./abis/ensNameWrapperAbi";

export default createConfig({
  networks: {
    sepolia: {
      chainId: 11155111,
      transport: http(process.env.PONDER_RPC_URL_11155111),
    },
  },
  contracts: {
    ensResolver: {
      abi: ensContentHashEventAbi,
      network: "sepolia",
      filter: { event: "ContenthashChanged", args: {} },
      startBlock: "latest"
    },
    ensNameWrapper: {
      abi: ensNameWrapperAbi,
      address: "0x0635513f179D50A207757E05759CbD106d7dFcE8",
      network: "sepolia",
      startBlock: "latest"
    }
  },
  database: {
    kind: "postgres",
    connectionString: process.env.PONDER_DATABASE_URL,
  }
});
