import { Hono } from 'hono';
import { LocalhostNodeAdapter } from '../ipfs/adapter.localhost';
import { RemoteNode, RemoteNodeAdapter } from '../ipfs/adapter.remote';
import { nodes, createNode } from '../shared';
import { IpfsType } from '../ipfs/enums';

const app = new Hono();

app.post('/nodes', async (c) => {
    const body = await c.req.parseBody({
        dot: true
    });

    /* check if the parameters exists or not */
    if(body["name"] == undefined || body["url"] == undefined){
        throw new Error("");
    }

    /* create a node instance with the given parameters */
    let new_node = createNode(
        body["name"].toString(), 
        IpfsType.cloud, 
        body["url"].toString()
    );
    nodes.push(new_node);

    // return the created node details to frontend for whatever purposes
    return c.json({ message: 'Node created' , node: {
        id: new_node.id,
        name: new_node.name,
        type: IpfsType[new_node.type],
        url: new_node.url,
    }});
});

app.get('/nodes', async (c) => {
    // Logic to retrieve all nodes
    return c.json({ message: 'List of nodes', nodes:
        nodes.map((node) => {
            return {
                id: node.id,
                name: node.name,
                type: IpfsType[node.type], // Convert the type to its typename
                url: node.url,
            }
        })
    });
});

app.get('/nodes/count', async (c) => {
    return c.json({ message: 'Node count', count: nodes.length });
});

app.get('/nodes/:id', async (c) => {
    const { id } = c.req.param();
    const node = nodes.find((node) => node.id === id);
    if (!node) {
        return c.json({ message: 'Node not found' }, 404);
    }
    return c.json({ message: 'Node details', node: {
        id: node.id,
        name: node.name,
        type: IpfsType[node.type],
        url: node.url,
        usage: (await node.node_adapter.getQuotaRange()).toString()
    }});
});

app.put('/nodes/:id', async (c) => {
    const { id } = c.req.param();
    const updatedNode = await c.req.json();
    // Logic to update a specific node by ID
    return c.json({ message: `Node with ID ${id} updated`, node: updatedNode });
});

app.delete('/nodes/:id', async (c) => {
    const { id } = c.req.param();
    if (id == '0'){
        return c.json({ message: 'Cannot delete localhost node' }, 400);
    }
    const nodeIndex = nodes.findIndex((node) => node.id === id);
    if (nodeIndex === -1) {
        return c.json({ message: 'Node not found' }, 404);
    }
    nodes.splice(nodeIndex, 1);
    return c.json({ message: `Node with ID ${id} deleted` });
});

/// display the statistics of the nodes
app.get('/stats/', async (c) => {
    // number_of_files_pinned
    // total_storage_used
    // current pinning strategy
})

export default app;