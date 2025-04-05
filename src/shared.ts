import { IpfsNodeAdapter } from "./ipfs/adapter"; // Base class for IPFS node adapters
import { LocalhostNodeAdapter } from "./ipfs/adapter.localhost"; // Adapter for localhost IPFS nodes
import { RemoteNodeAdapter } from "./ipfs/adapter.remote"; // Adapter for remote IPFS nodes
import { IpfsType, IpfsPinType } from "./ipfs/enums"; // Enums for IPFS types and pinning strategies

let currentId = 0; // Counter to generate unique IDs for nodes

export class Node {
    id: string; // Unique identifier for the node
    name: string; // Human-readable name of the node
    type: IpfsType; // Type of the IPFS node (e.g., localhost, cloud)
    url: string; // URL of the IPFS node
    nodeAdapter: IpfsNodeAdapter; // Adapter instance for interacting with the node

    constructor(id: string, name: string, type: IpfsType, url: string) {
        this.id = id;
        this.name = name;
        this.type = type;
        this.url = url;
        this.nodeAdapter = this.createNodeAdapter(type, url); // Initialize the appropriate adapter
    }

    // Factory method to create the appropriate node adapter based on the node type
    private createNodeAdapter(type: IpfsType, url: string): IpfsNodeAdapter {
        switch (type) {
            case IpfsType.localhost:
                return new LocalhostNodeAdapter(); // Adapter for localhost nodes
            case IpfsType.cloud:
                return new RemoteNodeAdapter(url); // Adapter for remote/cloud nodes
            default:
                throw new Error(`Invalid node type: ${type}`); // Handle invalid node types
        }
    }
}

// Helper function to create a new Node instance with a unique ID
export function createNode(name: string, type: IpfsType, url: string): Node {
    const id = (currentId++).toString(); // Generate a unique ID
    return new Node(id, name, type, url);
}

export let ipfsPinType: IpfsPinType = IpfsPinType.Parallel; // Default pinning strategy for IPFS

/// Function to set the pinning strategy
/// @param type - The pinning strategy to set (e.g., Parallel, Sequential)
/// @returns void
/// @description: This function updates the pinning strategy used for IPFS operations.
/// It allows the user to choose between different strategies for pinning files to IPFS nodes.
export function setIpfsPinType(type: IpfsPinType): void {
    ipfsPinType = type; // Update the pinning strategy
}

// Predefined list of nodes
export const nodes: Node[] = [
    createNode("localhost", IpfsType.localhost, "http://127.0.0.1:5001"), // Localhost node
];
