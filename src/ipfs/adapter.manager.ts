/// @description: Manages the adapters and pinning strategies
import { create } from "kubo-rpc-client";

import { ipfsPinType } from "../shared";
import { LocalhostNodeAdapter } from "./adapter.localhost";
import { IpfsPinType, IpfsType } from "./enums";
import { nodes } from "../shared";
import { RemoteNodeAdapter } from "./adapter.remote";

let nextNodeIndex = 0;

// Map to store how ENS names are related to file hashes
// Key: Node ID
// Value: [file hash, ENS name, file size]
export const contentHashMap: Map<string, [string, string, number]> = new Map();

// Class to manage pin references for files
class PinReference {
    hash: string;  // Hash of the file
    count: number; // Number of references to the file

    constructor(hash: string, count: number) {
        this.hash = hash;
        this.count = count;
    }
}

const contentHashList: PinReference[] = [];

/**
 * Pins a file based on the specified pinning strategy.
 * 
 * @param name - The ENS name associated with the file.
 * @param transactionDataNode - The node ID for the transaction data.
 * @param fileHash - The hash of the file to be pinned.
 */
export async function pinFile(name: string, transactionDataNode: string, fileHash: string): Promise<void> {
    // Handle unpinning of the previous file hash if it exists
    const previousFileHash = contentHashMap.get(transactionDataNode)?.[0];
    if (previousFileHash) {
        const previousPinReference = contentHashList.find(pin => pin.hash === previousFileHash);
        if (previousPinReference) {
            previousPinReference.count--;
            if (previousPinReference.count === 0) {
                contentHashList.splice(contentHashList.indexOf(previousPinReference), 1);
                // Unpin the file hash from all nodes
                for (const node of nodes) {
                    await node.nodeAdapter.unpinFile(previousFileHash);
                }
            }
        }
    }

    // Update the content hash map with the new file hash
    contentHashMap.set(transactionDataNode, [fileHash, name, 0]);

    // Skip pinning if the file hash is empty
    if (!fileHash) {
        contentHashMap.delete(transactionDataNode);
        return;
    }

    // Check if the file is already pinned
    let pinReference = contentHashList.find(pin => pin.hash === fileHash);
    if (pinReference) {
        pinReference.count++;
        return;
    }

    // Add a new pin reference for the file
    pinReference = new PinReference(fileHash, 1);
    contentHashList.push(pinReference);

    // Pin the file based on the selected strategy
    switch (ipfsPinType) {
        case IpfsPinType.Sequential:
            // Sequential: Finish pinning on one device before moving to another
            for (const node of nodes) {
                await node.nodeAdapter.pinFile(fileHash);
                const fileSize = await node.nodeAdapter.getFileSize(fileHash);
                if (fileSize !== undefined) {
                    contentHashMap.set(transactionDataNode, [fileHash, name, fileSize]);
                    break;
                }
            }
            break;

        case IpfsPinType.Parallel:
            // Parallel: Pin on all devices simultaneously
            let isSetup = false;
            for (const node of nodes) {
                await node.nodeAdapter.pinFile(fileHash);
                const fileSize = await node.nodeAdapter.getFileSize(fileHash);
                if (!isSetup && fileSize !== undefined) {
                    contentHashMap.set(transactionDataNode, [fileHash, name, fileSize]);
                    isSetup = true;
                }
            }
            break;

        case IpfsPinType.Distributed:
            // Distributed: Pin on one device, then move to the next
            const currentNode = nodes[nextNodeIndex];
            if (currentNode?.nodeAdapter) {
                await currentNode.nodeAdapter.pinFile(fileHash);
                const fileSize = await currentNode.nodeAdapter.getFileSize(fileHash);
                if (fileSize !== undefined) {
                    contentHashMap.set(transactionDataNode, [fileHash, name, fileSize]);
                } else {
                    console.error(`Failed to retrieve file size for hash: ${fileHash}`);
                }
            }
            nextNodeIndex = (nextNodeIndex + 1) % nodes.length;
            break;

        default:
            console.warn("Unknown pinning strategy. No action taken.");
            break;
    }
}