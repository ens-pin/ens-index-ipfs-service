import { ponder } from "ponder:registry";
import { decode } from "@ensdomains/content-hash";
import { pinFile } from "./ipfs/adapter.manager";
import { hexToBytes, parseAbi } from "viem";
import { bytesToPacket } from "@ensdomains/ensjs/utils";

// Address of the NameWrapper contract
const NAMEWRAPPER_ADDRESS = '0x0635513f179D50A207757E05759CbD106d7dFcE8';

// ABI for the NameWrapper contract's `names` function
const NAMEWRAPPER_ABI = parseAbi(['function names(bytes32 node) view returns (bytes encodedName)']);

/**
 * Resolves the ENS name associated with a given node.
 * 
 * @param client - The client used to interact with the blockchain.
 * @param node - The ENS node (hash) to resolve.
 * @returns The resolved ENS name or a fallback string if resolution fails.
 */
async function resolveName(client: any, node: string): Promise<string> {
  try {
    // Call the `names` function on the NameWrapper contract to get the encoded name
    const encodedName = await client.readContract({
      address: NAMEWRAPPER_ADDRESS,
      abi: NAMEWRAPPER_ABI,
      functionName: 'names',
      args: [node],
    });

    // Decode the encoded name into a human-readable format
    return bytesToPacket(hexToBytes(encodedName));
  } catch {
    // Return a fallback string if the resolution fails
    return `[${node}]`;
  }
}

/**
 * Handles the `ContenthashChanged` event by resolving the ENS name and pinning the content hash to IPFS.
 * 
 * @param param0 - The event and context containing the event data and blockchain client.
 */
async function handleContenthashChanged({
  event,
  context,
}: {
  event: { args: { node: `0x${string}`; hash: `0x${string}`; }; };
  context: { client: any; };
}): Promise<void> {
  const { client } = context;
  const node = event.args.node;
  const hash = event.args.hash;

  // Resolve the ENS name associated with the node
  const name = await resolveName(client, node);

  try {
    // Decode the content hash and pin it to IPFS
    const resolvedContentHash = decode(hash);
    await pinFile(name, node, resolvedContentHash);
  } catch {
    // If decoding fails, pin an empty string as the content hash
    await pinFile(name, node, "");
  }
}

// Register the `ContenthashChanged` event handler with the Ponder registry
ponder.on("ensResolver:ContenthashChanged", handleContenthashChanged);
