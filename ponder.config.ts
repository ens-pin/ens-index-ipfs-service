import { createConfig } from "ponder";
import { http } from "viem";

import { ensContentHashEventAbi } from "./abis/ensContentHashEventAbi";

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
    }
  },
});
