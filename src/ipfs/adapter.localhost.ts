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
            console.log(`[IPFS] Starting pin process for file ${fileHash} to IPFS node at ${this.url}`);
            
            // Check if we can connect to the IPFS node
            try {
                const version = await this.ipfsClient.version();
                console.log(`[IPFS] Connected to IPFS node version: ${version.version}`);

                // Check if file is already pinned
                const pins = await this.ipfsClient.pin.ls({ paths: [fileHash] });
                for await (const pin of pins) {
                    if (pin.cid.toString() === fileHash) {
                        console.log(`[IPFS] File ${fileHash} is already pinned`);
                        const fileStats = await this.ipfsClient.files.stat(`/ipfs/${fileHash}`);
                        return fileStats.size;
                    }
                }
            } catch (error: any) {
                console.error(`[IPFS] Failed to connect to IPFS node at ${this.url}:`, error.message);
                if (error.code === 'ECONNREFUSED') {
                    console.error(`[IPFS] Make sure IPFS daemon is running and accessible at ${this.url}`);
                }
                return 0;
            }

            console.log(`[IPFS] Starting to pin file ${fileHash}`);

            // Pin the file - this will automatically fetch the content if needed
            console.log(`[IPFS] Attempting to pin file ${fileHash}`);
            await this.ipfsClient.pin.add(fileHash, {
                timeout: 120000 // 2 minute timeout for pinning specifically
            });
            console.log(`[IPFS] Successfully pinned file ${fileHash}`);

            // Verify the pin
            console.log(`[IPFS] Verifying pin status for ${fileHash}`);
            const pins = await this.ipfsClient.pin.ls({ paths: [fileHash] });
            let isPinned = false;
            for await (const pin of pins) {
                if (pin.cid.toString() === fileHash) {
                    isPinned = true;
                    break;
                }
            }

            if (!isPinned) {
                console.error(`[IPFS] Pin verification failed for ${fileHash}`);
                return 0;
            }

            // Retrieve and return the file size
            console.log(`[IPFS] Getting file stats for ${fileHash}`);
            const fileStats = await this.ipfsClient.files.stat(`/ipfs/${fileHash}`, {
                timeout: 30000 // 30 second timeout for stat operation
            });
            console.log(`[IPFS] File ${fileHash} successfully pinned and verified. Size: ${fileStats.size} bytes`);
            return fileStats.size;
        } catch (error: any) {
            if (error?.name === 'HeadersTimeoutError' || error?.name === 'TimeoutError') {
                console.error(`[IPFS] Timeout while pinning file ${fileHash}. Consider increasing timeout values if this happens frequently.`);
                console.error(`[IPFS] Error details:`, error.message);
            } else {
                console.error(`[IPFS] Error pinning file ${fileHash} to ${this.url}:`, error.message);
                if (error.code === 'ECONNREFUSED') {
                    console.error(`[IPFS] Connection refused. Make sure IPFS daemon is running at ${this.url}`);
                }
                // Log the full error for debugging
                console.error('[IPFS] Full error:', error);
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
            console.log(`[IPFS] Starting unpin process for file ${fileHash} from IPFS node at ${this.url}`);
            
            // Check if file is actually pinned before trying to unpin
            let isPinned = false;
            const pins = await this.ipfsClient.pin.ls({ paths: [fileHash] });
            for await (const pin of pins) {
                if (pin.cid.toString() === fileHash) {
                    isPinned = true;
                    break;
                }
            }

            if (!isPinned) {
                console.log(`[IPFS] File ${fileHash} is not pinned, skipping unpin`);
                return;
            }

            // Remove the pin with timeout
            await this.ipfsClient.pin.rm(fileHash, {
                timeout: 30000 // 30 second timeout for unpinning
            });
            console.log(`[IPFS] Successfully unpinned file ${fileHash}`);

            // Trigger garbage collection with timeout
            console.log(`[IPFS] Starting garbage collection`);
            await this.ipfsClient.repo.gc({
                timeout: 60000 // 60 second timeout for garbage collection
            });
            console.log('[IPFS] Garbage collection completed');
        } catch (error: any) {
            if (error?.name === 'HeadersTimeoutError' || error?.name === 'TimeoutError') {
                console.error(`[IPFS] Timeout while unpinning file ${fileHash}`);
            } else {
                console.error(`[IPFS] Error unpinning file ${fileHash} from ${this.url}:`, error.message);
                if (error.code === 'ECONNREFUSED') {
                    console.error(`[IPFS] Connection refused. Make sure IPFS daemon is running at ${this.url}`);
                }
                // Log the full error for debugging
                console.error('[IPFS] Full error:', error);
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
            console.log(`[IPFS] Getting size for file ${fileHash} from IPFS node at ${this.url}`);
            const fileStats = await this.ipfsClient.files.stat(`/ipfs/${fileHash}`, {
                timeout: 30000 // 30 second timeout for stat operation
            });
            console.log(`[IPFS] File ${fileHash} size: ${fileStats.size} bytes`);
            return fileStats.size;
        } catch (error: any) {
            if (error?.name === 'HeadersTimeoutError' || error?.name === 'TimeoutError') {
                console.error(`[IPFS] Timeout while getting file size for ${fileHash}`);
            } else {
                console.error(`[IPFS] Error getting size for file ${fileHash} from ${this.url}:`, error.message);
                if (error.code === 'ECONNREFUSED') {
                    console.error(`[IPFS] Connection refused. Make sure IPFS daemon is running at ${this.url}`);
                }
                // Log the full error for debugging
                console.error('[IPFS] Full error:', error);
            }
            return 0;
        }
    }

    /**
     * Checks if the node is over its storage quota.
     * @returns True if the node is over quota, false otherwise.
     */
    public isOverQuota(): boolean {
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
            console.log(`[IPFS] Getting quota range from IPFS node at ${this.url}`);
            const stats = await this.ipfsClient.stats.repo();
            console.log(`[IPFS] Repo size: ${stats.repoSize}, Storage max: ${stats.storageMax}`);
            return [stats.repoSize, stats.storageMax];
        } catch (error: any) {
            console.error(`[IPFS] Error retrieving quota range from ${this.url}:`, error.message);
            if (error.code === 'ECONNREFUSED') {
                console.error(`[IPFS] Connection refused. Make sure IPFS daemon is running at ${this.url}`);
            }
            return [BigInt(0), BigInt(0)];
        }
    }
}