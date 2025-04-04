import { ponder } from "ponder:registry";
import { decode } from "@ensdomains/content-hash";

ponder.on("ensResolver:ContenthashChanged", async ({ event}) => {
  // This is the address of the contract that emitted the event.
  // With this config, it could be any ERC20 contract on mainnet.
  console.log("Event Emitted Contract: " + event.log.address);  
  console.log("Event Emitted Data: " + decode(event.args.hash));
  //        ^? string
});