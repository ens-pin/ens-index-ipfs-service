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
        this.ipfs_client = create({ url: node_ipfs_url });
    }

    /**
     * Pins a file to the remote IPFS node.
     * @param fileHash - The hash of the file to pin.
     * @returns The size of the pinned file in bytes.
     */
    public async pinFile(fileHash: string): Promise<number> {
        try {
            // Ensure the file is available on the node
            await this.ipfs_client.get(fileHash);

            // Pin the file
            await this.ipfs_client.pin.add(fileHash);

            // Provide the file to the network
            await this.ipfs_client.routing.provide(fileHash);

            // Retrieve and return the file size
            const fileStats = await this.ipfs_client.files.stat(`/ipfs/${fileHash}`);
            return fileStats.size;
        } catch (error) {
            console.error("Error pinning file:", error);
            return 0;
        }
    }

    /**
     * Unpins a file from the remote IPFS node.
     * @param fileHash - The hash of the file to unpin.
     */
    public async unpinFile(fileHash: string): Promise<void> {
        try {
            // Remove the pin
            await this.ipfs_client.pin.rm(fileHash);

            // Trigger garbage collection
            await this.ipfs_client.repo.gc();
        } catch (error) {
            console.error("Error unpinning file:", error);
        }
    }

    /**
     * Retrieves the size of a file stored on the IPFS node.
     * @param fileHash - The hash of the file.
     * @returns The size of the file in bytes.
     */
    public async getFileSize(fileHash: string): Promise<number> {
        try {
            const fileStats = await this.ipfs_client.files.stat(`/ipfs/${fileHash}`);
            return fileStats.size;
        } catch (error) {
            console.error("Error retrieving file size:", error);
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