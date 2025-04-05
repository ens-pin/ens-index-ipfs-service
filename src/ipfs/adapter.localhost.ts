import { create, KuboRPCClient, urlSource} from "kubo-rpc-client";
import { IpfsNodeAdapter } from "./adapter";
import { setFlagsFromString } from "v8";

/// @description : Node Adapter for Localhost
export class LocalhostNodeAdapter extends IpfsNodeAdapter {

    ipfs_client: KuboRPCClient;

    constructor() {
        super();
        this.ipfs_client = create(
            {
                url: "http://127.0.0.1:5001"
            }
        )
    }
    /// pin the file to the IPFS node
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

    public isOverQuota(): boolean{
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