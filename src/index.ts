import { ponder } from "ponder:registry";
import { decode } from "@ensdomains/content-hash";
import { pinFile } from "./ipfs/adapter.manager";
import { Hex, hexToBytes, parseAbi, PublicClient } from "viem";
import { bytesToPacket } from "@ensdomains/ensjs/utils";



/// This is the event listening code that listens to the ContenthashChanged event
/// emitted by the ENS resolver contract. It decodes the content hash
/// and pin the file to nodes available
ponder.on("ensResolver:ContenthashChanged", async ({ event, context }) => {

  const { client } = context;

  // from the node we can get the ETH address that the name resolves to
  // and check if that has a primary name
  let name: string | undefined = undefined;

  // First try to decode the name using the namewrapper
  try {
    const encodedName = await client.readContract({
      address: '0x0635513f179D50A207757E05759CbD106d7dFcE8',
      abi: parseAbi(['function names(bytes32 node) view returns (bytes encodedName)']),
      functionName: 'names',
      args: [event.args.node],
    })
    name = bytesToPacket(hexToBytes(encodedName))
  }catch(e){
     name = '[' + event.args.node + ']';
  }

  try{
    const resolved_content_hash = decode(event.args.hash);
    await pinFile(name, event.args.node, resolved_content_hash);
  }catch(e){
    await pinFile(name, event.args.node, "");
  }
});
