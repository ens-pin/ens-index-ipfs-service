import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { LocalhostNodeAdapter } from '../ipfs/adapter.localhost';
import { RemoteNode, RemoteNodeAdapter } from '../ipfs/adapter.remote';
import { nodes, createNode } from '../shared';
import { IpfsType } from '../ipfs/enums';
import { contentHashMap } from '../ipfs/adapter.manager';
import { graphql } from "ponder";
import { db } from "ponder:api";
import schema from "ponder:schema";

const app = new Hono();

app.use( "*", cors());
 
// Utility function to format node details
const formatNode = (node: any) => ({
    id: node.id,
    name: node.name,
    type: IpfsType[node.type],
    url: node.url,
});

// Create a new node
app.post('/nodes', async (c) => {
    const body = await c.req.parseBody({ dot: true });

    if (!body.name || !body.url) {
        return c.json({ message: 'Missing required parameters: name or url' }, 400);
    }

    const newNode = createNode(body.name.toString(), IpfsType.cloud, body.url.toString());
    nodes.push(newNode);

    return c.json({
        message: 'Node created',
        node: formatNode(newNode),
    });
});

// Retrieve all nodes
app.get('/nodes', async (c) => {
    return c.json({
        message: 'List of nodes',
        nodes: nodes.map(formatNode),
    });
});

// Retrieve node count
app.get('/nodes/count', async (c) => {
    return c.json({ message: 'Node count', count: nodes.length });
});

// Retrieve a specific node by ID
app.get('/nodes/:id', async (c) => {
    const { id } = c.req.param();
    const node = nodes.find((node) => node.id === id);

    if (!node) {
        return c.json({ message: 'Node not found' }, 404);
    }

    const usage = await node.nodeAdapter.getQuotaRange();
    return c.json({
        message: 'Node details',
        node: {
            ...formatNode(node),
            usage: usage.toString(),
        },
    });
});

// Update a specific node by ID
app.put('/nodes/:id', async (c) => {
    const { id } = c.req.param();
    const updatedNode = await c.req.json();

    const nodeIndex = nodes.findIndex((node) => node.id === id);
    if (nodeIndex === -1) {
        return c.json({ message: 'Node not found' }, 404);
    }

    nodes[nodeIndex] = { ...nodes[nodeIndex], ...updatedNode };
    return c.json({
        message: `Node with ID ${id} updated`,
        node: formatNode(nodes[nodeIndex]),
    });
});

// Delete a specific node by ID
app.delete('/nodes/:id', async (c) => {
    const { id } = c.req.param();

    if (id === '0') {
        return c.json({ message: 'Cannot delete localhost node' }, 400);
    }

    const nodeIndex = nodes.findIndex((node) => node.id === id);
    if (nodeIndex === -1) {
        return c.json({ message: 'Node not found' }, 404);
    }

    nodes.splice(nodeIndex, 1);
    return c.json({ message: `Node with ID ${id} deleted` });
});

// Retrieve hosted content details
app.get('/hosted', async (c) => {
    const users = Array.from(contentHashMap.entries()).map(([key, value]) => ({
        name: value[1],
        node: key,
        hash: value[0],
        file_size: value[2],
    }));

    return c.json({ message: 'List of users', users });
});

// Display node statistics (to be implemented)
app.get('/stats', async (c) => {
    return c.json({ message: 'Statistics endpoint not implemented yet' });
});

export default app;