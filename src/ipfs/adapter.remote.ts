import { IpfsNodeAdapter } from "./adapter";
import { create, KuboRPCClient } from "kubo-rpc-client";
import * as dotenv from 'dotenv';
import { createApiClient } from "dots-wrapper";

dotenv.config();

export class RemoteNode {
    id: string
    name: string
    url: string

    constructor(id: string, name: string, url: string){
        this.id = id;
        this.name = name;
        this.url = url;
    }
}

/// Self-hosted pinning service to use digital ocean virtual machines
export class RemoteNodeAdapter extends IpfsNodeAdapter {

    ipfs_client: KuboRPCClient;

    constructor(node_ipfs_url: string){
        super();
        this.ipfs_client = create(
            {
                url: node_ipfs_url
            }
        )
    }

    /// pin the file to the remote IPFS node
    public async pinFile(fileHash: string): Promise<void> {
        await this.ipfs_client.get(fileHash);
        this.ipfs_client.pin.add(fileHash).then(
            value => {
                this.ipfs_client.routing.provide(fileHash)
            },
            onrejected => {
                console.log("Error pinning file: ", onrejected);
            }
        )
    }

    public async unpinFile(fileHash: string): Promise<void> {
        // unpin the file from the IPFS node
        this.ipfs_client.pin.rm(fileHash).then(
            value => {
                this.ipfs_client.repo.gc();
            },
            onrejected => {
                console.log("Error unpinning file: ", onrejected);
            }
        )
    }
    
    public isOverQuota(fileHash: String): boolean{
        // Check if the ipfs file at the fileHash's file size is greater than the available quota
        // If it is, then the node is over quota
        // If it is not, then the node is not over quota

        // Get the size of the file

        return false;
    }

    public adjustQuota(new_quota: BigInt): void{
        this.ipfs_client
    }

    public async getQuotaRange(): Promise<[bigint, bigint]> {
        let results = await this.ipfs_client.stats.repo();
        return [results.repoSize, results.storageMax];
    }
}