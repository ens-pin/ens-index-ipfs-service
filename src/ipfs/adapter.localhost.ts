import { IpfsNodeAdapter } from "./adapter";
import { create, KuboRPCClient } from "kubo-rpc-client";

/**
 * Adapter for interacting with a localhost IPFS node.
 */
export class LocalhostNodeAdapter extends IpfsNodeAdapter {
    private ipfsClient: KuboRPCClient;
    private readonly url: string;

    constructor(ipfsUrl: string = "http://127.0.0.1:5001") {
        super();
        this.url = ipfsUrl;
        console.log(`Initializing IPFS client with URL: ${ipfsUrl}`);
        this.ipfsClient = create({ 
            url: ipfsUrl,
            timeout: 60000 // 60 second timeout for operations
        });
    }

    /**
     * Pins a file to the localhost IPFS node.
     * @param fileHash - The hash of the file to pin.
     * @returns The size of the pinned file in bytes.
     */
    public async pinFile(fileHash: string): Promise<number> {
        try {
            console.log(`Attempting to pin file ${fileHash} to IPFS node at ${this.url}`);
            
            // Check if we can connect to the IPFS node
            try {
                const version = await this.ipfsClient.version();
                console.log(`Connected to IPFS node version: ${version.version}`);
            } catch (error: any) {
                console.error(`Failed to connect to IPFS node at ${this.url}:`, error.message);
                if (error.code === 'ECONNREFUSED') {
                    console.error(`Make sure IPFS daemon is running and accessible at ${this.url}`);
                }
                return 0;
            }

            // Pin the file - this will automatically fetch the content if needed
            await this.ipfsClient.pin.add(fileHash, {
                timeout: 120000 // 2 minute timeout for pinning specifically
            });
            console.log(`Successfully pinned file ${fileHash}`);

            // Retrieve and return the file size
            const fileStats = await this.ipfsClient.files.stat(`/ipfs/${fileHash}`, {
                timeout: 30000 // 30 second timeout for stat operation
            });
            console.log(`File ${fileHash} size: ${fileStats.size} bytes`);
            return fileStats.size;
        } catch (error: any) {
            if (error?.name === 'HeadersTimeoutError' || error?.name === 'TimeoutError') {
                console.error(`Timeout while pinning file ${fileHash}. Consider increasing timeout values if this happens frequently.`);
            } else {
                console.error(`Error pinning file ${fileHash} to ${this.url}:`, error.message);
                if (error.code === 'ECONNREFUSED') {
                    console.error(`Connection refused. Make sure IPFS daemon is running at ${this.url}`);
                }
            }
            return 0;
        }
    }

    /**
     * Unpins a file from the localhost IPFS node.
     * @param fileHash - The hash of the file to unpin.
     */
    public async unpinFile(fileHash: string): Promise<void> {
        try {
            console.log(`Attempting to unpin file ${fileHash} from IPFS node at ${this.url}`);
            
            // Remove the pin with timeout
            await this.ipfsClient.pin.rm(fileHash, {
                timeout: 30000 // 30 second timeout for unpinning
            });
            console.log(`Successfully unpinned file ${fileHash}`);

            // Trigger garbage collection with timeout
            await this.ipfsClient.repo.gc({
                timeout: 60000 // 60 second timeout for garbage collection
            });
            console.log('Garbage collection completed');
        } catch (error: any) {
            if (error?.name === 'HeadersTimeoutError' || error?.name === 'TimeoutError') {
                console.error(`Timeout while unpinning file ${fileHash}`);
            } else {
                console.error(`Error unpinning file ${fileHash} from ${this.url}:`, error.message);
                if (error.code === 'ECONNREFUSED') {
                    console.error(`Connection refused. Make sure IPFS daemon is running at ${this.url}`);
                }
            }
        }
    }

    /**
     * Retrieves the size of a file stored on the IPFS node.
     * @param fileHash - The hash of the file.
     * @returns The size of the file in bytes.
     */
    public async getFileSize(fileHash: string): Promise<number> {
        try {
            console.log(`Getting size for file ${fileHash} from IPFS node at ${this.url}`);
            const fileStats = await this.ipfsClient.files.stat(`/ipfs/${fileHash}`, {
                timeout: 30000 // 30 second timeout for stat operation
            });
            console.log(`File ${fileHash} size: ${fileStats.size} bytes`);
            return fileStats.size;
        } catch (error: any) {
            if (error?.name === 'HeadersTimeoutError' || error?.name === 'TimeoutError') {
                console.error(`Timeout while getting file size for ${fileHash}`);
            } else {
                console.error(`Error getting size for file ${fileHash} from ${this.url}:`, error.message);
                if (error.code === 'ECONNREFUSED') {
                    console.error(`Connection refused. Make sure IPFS daemon is running at ${this.url}`);
                }
            }
            return 0;
        }
    }

    /**
     * Checks if the node is over its storage quota.
     * @returns True if the node is over quota, false otherwise.
     */
    public isOverQuota(): boolean {
        // TODO: Implement logic to check if the node is over quota.
        return false;
    }

    /**
     * Adjusts the storage quota for the node.
     * @param newQuota - The new quota value.
     */
    public adjustQuota(newQuota: bigint): void {
        console.warn("adjustQuota is not implemented.");
    }

    /**
     * Retrieves the current storage usage and maximum storage capacity of the node.
     * @returns A tuple containing the current storage usage and the maximum storage capacity.
     */
    public async getQuotaRange(): Promise<[bigint, bigint]> {
        try {
            console.log(`Getting quota range from IPFS node at ${this.url}`);
            const stats = await this.ipfsClient.stats.repo();
            console.log(`Repo size: ${stats.repoSize}, Storage max: ${stats.storageMax}`);
            return [stats.repoSize, stats.storageMax];
        } catch (error: any) {
            console.error(`Error retrieving quota range from ${this.url}:`, error.message);
            if (error.code === 'ECONNREFUSED') {
                console.error(`Connection refused. Make sure IPFS daemon is running at ${this.url}`);
            }
            return [BigInt(0), BigInt(0)];
        }
    }
}