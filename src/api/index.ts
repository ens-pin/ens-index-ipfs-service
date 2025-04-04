import { Hono } from 'hono';
import { LocalhostNodeAdapter } from '../ipfs/adapter.localhost';
import { RemoteNode, RemoteNodeAdapter } from '../ipfs/adapter.remote';

const app = new Hono();

let remoteNodes: RemoteNode[] = [];

app.post('/nodes', async (c) => {
    const body = await c.req.parseBody({
        dot: true
    });
    if(body["name"] == undefined || body["url"] == undefined){
        throw new Error("");
    }

    remoteNodes.push(new RemoteNode("0", body["name"].toString(), body["url"].toString()))
    // Logic to create a new node
    return c.json({ message: 'Node created' });
});

app.get('/nodes', async (c) => {
    // Logic to retrieve all nodes
    return c.json({ message: 'List of nodes', nodes: [] });
});

app.get('/nodes/count', async (c) => {
    // Logic to count the number of nodes
    const nodeCount = 0; // Replace with actual logic to count nodes
    return c.json({ message: 'Node count', count: nodeCount });
});

app.get('/nodes/:id', async (c) => {

    // id 0 always means localhost
    let localhost_adapter = new LocalhostNodeAdapter();
    let [repoSize, storageMax] = await localhost_adapter.getQuotaRange();
    return c.json({ 
        message: 'Node quota', 
        repoSize: repoSize.toString(), 
        storageMax: storageMax.toString() 
    });

});

app.put('/nodes/:id', async (c) => {
    const { id } = c.req.param();
    const updatedNode = await c.req.json();
    // Logic to update a specific node by ID
    return c.json({ message: `Node with ID ${id} updated`, node: updatedNode });
});

app.delete('/nodes/:id', async (c) => {
    const { id } = c.req.param();
    // Logic to delete a specific node by ID
    return c.json({ message: `Node with ID ${id} deleted` });
});

export default app;