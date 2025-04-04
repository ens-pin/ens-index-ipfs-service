/// @description: manages the adapters
import { create } from "kubo-rpc-client";

import { ipfs_pin_type } from "../shared";
import { LocalhostNodeAdapter } from "./adapter.localhost";
import { IpfsPinType } from "./enums";

/// Here's the list of things this function do
/// 1. Check all the nodes that are available (local, cloud, pinata)
/// 2. Check if the file is already pinned in the nodes
/// 3. Check what pinning strategy is preferred by the user (sequential: finish pinning in one device first before moving to another, parallel: slowly fill up storage in all the devices, backup: pin the files in all devices)
/// 4. Pin with the relevant strategy on the relevant nodes
export async function pinFile(fileHash: string): Promise<void> {

    switch(ipfs_pin_type){
        case IpfsPinType.Sequential:
            break;
        case IpfsPinType.Parallel:
            /// pin on all devices at the same time
            break;
        default:
    }

    let localhost_adapter = new LocalhostNodeAdapter();
    localhost_adapter.pinFile(fileHash);

}