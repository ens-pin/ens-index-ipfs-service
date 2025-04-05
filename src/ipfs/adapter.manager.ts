/// @description: manages the adapters
import { create } from "kubo-rpc-client";

import { ipfs_pin_type } from "../shared";
import { LocalhostNodeAdapter } from "./adapter.localhost";
import { IpfsPinType, IpfsType } from "./enums";
import { nodes } from "../shared";
import { RemoteNodeAdapter } from "./adapter.remote";

let next_node = 0;

// store how ens names are related to the file hashes
const content_hash_map: Map<string, string> = new Map<string, string>();

/// @description: manages how many pins are there for each file to manage whether it should be pinned or nto
class PinReference{
    hash: string  // hash of the file
    count: number // number of references to the file

    constructor(hash: string, count: number){
        this.hash = hash;
        this.count = count;
    }
}

const content_hash_list: PinReference[] = [];

/// Here's the list of things this function do
/// 1. Check all the nodes that are available (local, cloud, pinata)
/// 2. Check if the file is already pinned in the nodes
/// 3. Check what pinning strategy is preferred by the user (sequential: finish pinning in one device first before moving to another, parallel: slowly fill up storage in all the devices, backup: pin the files in all devices)
/// 4. Pin with the relevant strategy on the relevant nodes
export async function pinFile(transaction_data_node: string, fileHash: string): Promise<void> {

    // remove the previous fileHash from wherever we pinned
    // we will in fact check count how many references are there
    // if there is only one reference (this is the last one), then we remove the fileHash from the list
    const previousFileHash = content_hash_map.get(transaction_data_node);
    if (previousFileHash) {
        console.log(previousFileHash);
        const previousPinReference = content_hash_list.find(pin => pin.hash === previousFileHash);
        if (previousPinReference) {
            console.log(previousPinReference.count);
            previousPinReference.count--;
            if (previousPinReference.count == 0) {
                content_hash_list.splice(content_hash_list.indexOf(previousPinReference), 1);
                // remove the fileHash from all devices
                console.log("trying to remove");
                nodes.forEach(
                    async (node) => {
                        await node.node_adapter.unpinFile(previousFileHash);
                    }
                )
            }
        }
    }
    content_hash_map.set(transaction_data_node, fileHash);

    /// check if the file has already been pinned in the services we are using
    // if yes, then we skip pinning
    let pinReference = content_hash_list.find(pin => pin.hash === fileHash);
    if (pinReference) {
        pinReference.count++;
        return;
    }
    pinReference = new PinReference(fileHash, 1);
    content_hash_list.push(pinReference);

    // pin the new file with the relevant strategy
    switch(ipfs_pin_type){
        case IpfsPinType.Sequential:
            // Finish pinning on one device before moving to another
            break;
        case IpfsPinType.Parallel:
            /// Pin on all devices at the same time
            nodes.forEach(async (node) => {
                await node.node_adapter.pinFile(fileHash)
            })
            break;
        case IpfsPinType.Distributed:
            // Pin on one device, then move to another
            if(nodes[next_node] != undefined){
                if (nodes[next_node]?.node_adapter) {
                    await nodes[next_node]?.node_adapter.pinFile(fileHash);
                }
            }
            next_node = (next_node + 1) % nodes.length;
            break;
        default:
            break;
    }
}