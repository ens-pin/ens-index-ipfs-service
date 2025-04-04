import { ponder } from "ponder:registry";
import { decode } from "@ensdomains/content-hash";
import { pinFile } from "./ipfs/adapter.manager";

/// This is the event listening code that listens to the ContenthashChanged event
/// emitted by the ENS resolver contract. It decodes the content hash
/// and pin the file to nodes available
ponder.on("ensResolver:ContenthashChanged", async ({ event}) => {
  await pinFile(decode(event.args.hash));
});