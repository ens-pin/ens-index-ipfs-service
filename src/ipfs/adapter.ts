/**
 * @summary
 * Abstract class representing a common interface for IPFS node adapters.
 * This class is not meant to be used standalone; it should be extended by child classes.
 */
export abstract class IpfsNodeAdapter {
    /**
     * @description The quota of this particular node type.
     * If the node exceeds the quota, it will not pin the file.
     */
    protected quota: number;

    /**
     * @description The amount of quota this particular node has already consumed.
     */
    protected quotaUsed: number;

    constructor(quota: number = -1, quotaUsed: number = 0) {
        this.quota = quota;
        this.quotaUsed = quotaUsed;
    }

    /**
     * @description Pins a file to the IPFS node.
     * @param fileHash The hash of the file to pin.
     * @returns A promise resolving to the size of the pinned file in bytes.
     */
    public abstract pinFile(fileHash: string): Promise<number>;

    /**
     * @description Unpins a file from the IPFS node.
     * @param fileHash The hash of the file to unpin.
     */
    public abstract unpinFile(fileHash: string): Promise<void>;

    /**
     * @description Retrieves the size of a file from the IPFS node.
     * @param fileHash The hash of the file.
     * @returns A promise resolving to the size of the file in bytes.
     */
    public abstract getFileSize(fileHash: string): Promise<number>;

    /**
     * @description Checks if the node is over its quota.
     * @param fileHash The hash of the file to check.
     * @returns A boolean indicating whether the node is over quota.
     */
    public abstract isOverQuota(fileHash: string): boolean;

    /**
     * @description Updates the available storage quota for the node.
     * @param newQuota The new quota value.
     */
    public abstract adjustQuota(newQuota: bigint): void;

    /**
     * @description Retrieves the quota range for the node.
     * @returns A promise resolving to a tuple containing the minimum and maximum quota values.
     */
    public abstract getQuotaRange(): Promise<[bigint, bigint]>;
}