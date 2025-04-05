/// @description: manages the adapters
import { create } from "kubo-rpc-client";

import { ipfs_pin_type } from "../shared";
import { LocalhostNodeAdapter } from "./adapter.localhost";
import { IpfsPinType, IpfsType } from "./enums";
import { nodes } from "../shared";
import { RemoteNodeAdapter } from "./adapter.remote";

let next_node = 0;

/// Here's the list of things this function do
/// 1. Check all the nodes that are available (local, cloud, pinata)
/// 2. Check if the file is already pinned in the nodes
/// 3. Check what pinning strategy is preferred by the user (sequential: finish pinning in one device first before moving to another, parallel: slowly fill up storage in all the devices, backup: pin the files in all devices)
/// 4. Pin with the relevant strategy on the relevant nodes
export async function pinFile(fileHash: string): Promise<void> {

    /// check if the file has already been pinned in the services we are using
    // if yes, then we skip pinning

    // remove the previous fileHash from wherever we pinned

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