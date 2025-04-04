/// @description: manages the adapters
import { create } from "kubo-rpc-client";
import { LocalhostNodeAdapter } from "./adapter.localhost";

/// Here's the list of things this function do
/// 1. Check all the nodes that are available (local, remote, cloud, pinata)
/// 2. Check if the file is already pinned in the nodes
/// 3. Check what pinning strategy is preferred by the user (sequential: finish pinning in one device first before moving to another, parallel: slowly fill up storage in all the devices, backup: pin the files in all devices)
/// 4. Pin with the relevant strategy on the relevant nodes
export async function pinFile(fileHash: string): Promise<void> {
    let localhost_adapter = new LocalhostNodeAdapter();
    localhost_adapter.pinFile(fileHash);
    /*await ipfs_client.get(fileHash)
    ipfs_client.pin.add(fileHash).then(
        value => {
            console.log(value)
            ipfs_client.routing.provide(fileHash)
            console.log(fileHash);
        },
        onrejected => {
            console.log("Error pinning file: ", onrejected);
        }
    )
    console.log("hmm")*/
}