/// @summary
/// This class is supposed to implement the common methods
/// This class shouldn't be used standalone
/// The children classes should be used
export class IpfsNodeAdapter {
    /// @description: the quota of this particular node type
    /// if the node exceeds the quota, it will not pin the file
    quota: number;

    /// @description: The amount of quota this particular node has already consumed
    quota_used: number;

    constructor(quota: number = -1, quota_used: number = 0) {
        this.quota = quota;
        this.quota_used = quota_used;
    }
    /// pin the file to the IPFS node
    public pinFile(fileHash: string): Promise<void> {
        return Promise.resolve();
    }

    public isOverQuota(fileHash: string): boolean{
        return false;
    }

    /// @description: update the available storage quota for a node in the database
    public adjustQuota(new_quota: BigInt): void{
        
    }

    public getQuotaRange(): Promise<[bigint, bigint]> {
        return Promise.resolve([BigInt(0), BigInt(0)]);
    }
};