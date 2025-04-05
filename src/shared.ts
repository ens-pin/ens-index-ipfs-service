import { IpfsNodeAdapter } from "./ipfs/adapter";
import { LocalhostNodeAdapter } from "./ipfs/adapter.localhost";
import { RemoteNode, RemoteNodeAdapter } from "./ipfs/adapter.remote";
import { IpfsType, IpfsPinType } from "./ipfs/enums";

let current_id = 0;

export class Node {
    id: string
    name: string
    type: IpfsType
    url: string
    node_adapter: IpfsNodeAdapter;

    constructor(id: string, name: string, type: IpfsType, url: string){
        this.id = id;
        this.name = name;
        this.type = type;
        this.url = url;
        switch(type){
            case IpfsType.localhost:
                this.node_adapter = new LocalhostNodeAdapter();
                break;
            case IpfsType.cloud:
                this.node_adapter = new RemoteNodeAdapter(url);
                break;
            default:
                throw new Error("Invalid node type");
        }
    }
}

export function createNode(name: string, type: IpfsType, url: string): Node {
    let id = current_id.toString();
    current_id++;
    return new Node(id, name, type, url);
}

export let ipfs_pin_type: IpfsPinType = IpfsPinType.Parallel;
export let nodes: Node[] = [createNode("localhost", IpfsType.localhost, "http://127.0.0.1:5001")];
