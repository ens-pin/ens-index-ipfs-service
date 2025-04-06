import { IpfsNodeAdapter } from "./adapter";
import { create, KuboRPCClient } from "kubo-rpc-client";
import * as dotenv from 'dotenv';

dotenv.config();

/**
 * Represents a remote IPFS node.
 */
export class RemoteNode {
    id: string;
    name: string;
    url: string;

    constructor(id: string, name: string, url: string) {
        this.id = id;
        this.name = name;
        this.url = url;
    }
}

/**
 * Adapter for interacting with a remote IPFS node.
 * This is designed for self-hosted pinning services using DigitalOcean virtual machines.
 */
export class RemoteNodeAdapter extends IpfsNodeAdapter {
    private ipfs_client: KuboRPCClient;

    constructor(node_ipfs_url: string) {
        super();
        this.ipfs_client = create({ 
            url: node_ipfs_url,
            timeout: 60000 // 60 second timeout for operations
        });
    }

    /**
     * Pins a file to the remote IPFS node.
     * @param fileHash - The hash of the file to pin.
     * @returns The size of the pinned file in bytes.
     */
    public async pinFile(fileHash: string): Promise<number> {
        try {
            // Pin the file - this will automatically fetch the content if needed
            await this.ipfs_client.pin.add(fileHash, {
                timeout: 120000 // 2 minute timeout for pinning specifically
            });

            // Retrieve and return the file size
            const fileStats = await this.ipfs_client.files.stat(`/ipfs/${fileHash}`, {
                timeout: 30000 // 30 second timeout for stat operation
            });
            return fileStats.size;
        } catch (error: any) {
            if (error?.name === 'HeadersTimeoutError' || error?.name === 'TimeoutError') {
                console.error(`Timeout while pinning file ${fileHash}. Consider increasing timeout values if this happens frequently.`);
            } else {
                console.error("Error pinning file:", error);
            }
            return 0;
        }
    }

    /**
     * Unpins a file from the remote IPFS node.
     * @param fileHash - The hash of the file to unpin.
     */
    public async unpinFile(fileHash: string): Promise<void> {
        try {
            // Remove the pin with timeout
            await this.ipfs_client.pin.rm(fileHash, {
                timeout: 30000 // 30 second timeout for unpinning
            });

            // Trigger garbage collection with timeout
            await this.ipfs_client.repo.gc({
                timeout: 60000 // 60 second timeout for garbage collection
            });
        } catch (error: any) {
            if (error?.name === 'HeadersTimeoutError' || error?.name === 'TimeoutError') {
                console.error(`Timeout while unpinning file ${fileHash}`);
            } else {
                console.error("Error unpinning file:", error);
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
            const fileStats = await this.ipfs_client.files.stat(`/ipfs/${fileHash}`, {
                timeout: 30000 // 30 second timeout for stat operation
            });
            return fileStats.size;
        } catch (error: any) {
            if (error?.name === 'HeadersTimeoutError' || error?.name === 'TimeoutError') {
                console.error(`Timeout while getting file size for ${fileHash}`);
            } else {
                console.error("Error retrieving file size:", error);
            }
            return 0;
        }
    }

    /**
     * Checks if the node is over its storage quota.
     * @param fileHash - The hash of the file to check.
     * @returns True if the node is over quota, false otherwise.
     */
    public isOverQuota(fileHash: string): boolean {
        // TODO: Implement logic to check if the file size exceeds the available quota.
        return false;
    }

    /**
     * Adjusts the storage quota for the node.
     * @param new_quota - The new quota value.
     */
    public adjustQuota(new_quota: bigint): void {
        // TODO: Implement quota adjustment logic.
    }

    /**
     * Retrieves the current storage usage and maximum storage capacity of the node.
     * @returns A tuple containing the current storage usage and the maximum storage capacity.
     */
    public async getQuotaRange(): Promise<[bigint, bigint]> {
        try {
            const stats = await this.ipfs_client.stats.repo();
            return [stats.repoSize, stats.storageMax];
        } catch (error) {
            console.error("Error retrieving quota range:", error);
            return [BigInt(0), BigInt(0)];
        }
    }
}