export enum IpfsType {
    localhost,  // pin the files locally
    cloud,      // pin the files in a cloud service
    pinata      // pin the files in web3 service (pinata)
}

export enum IpfsPinType {
    Sequential, // pin on one device before moving to another
    Parallel    // pin on all devices at the same time
}