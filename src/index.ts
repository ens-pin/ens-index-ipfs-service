import { ponder } from "ponder:registry";
import { decode } from "@ensdomains/content-hash";
import { pinFile } from "./ipfs/adapter.manager";
import { content_changes } from "../ponder.schema";

/// This is the event listening code that listens to the ContenthashChanged event
/// emitted by the ENS resolver contract. It decodes the content hash
/// and pin the file to nodes available
ponder.on("ensResolver:ContenthashChanged", async ({ event, context }) => {
  // await pinFile(decode(event.args.hash));

  // hardcoded for now
  const node_hash = "0x0000000000000000000000000000000000000000000000000000000000000000";
  await context.db.insert(content_changes).values({
    id: event.log.address,
    node_hash: node_hash,
    ens_name: "vitalik.eth",
    content_hash: event.args.hash,
    decoded_ipfs_cid: decode(event.args.hash),
    timestamp: new Date(Number(event.block.timestamp) * 1000),
    block_number: Number(event.block.number),
  });
});