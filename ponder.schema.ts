import { onchainTable } from "ponder";

/// The IPFS nodes that are made available by the user
export const ipfs_nodes = onchainTable("ipfs_nodes", (t) => ({
  id: t.text().primaryKey(),
  name: t.text(),
  type: t.text(),
  url: t.text()
}))

/// Records of ENS node content hash changes
export const content_changes = onchainTable("content_changes", (t) => ({
  id: t.text().primaryKey(), // The transaction hash
  node_hash: t.text().notNull(), // The ENS node hash from the event (bytes32)
  content_hash: t.text().notNull(), // The content hash from the event
  decoded_ipfs_cid: t.text().notNull(), // The decoded/real IPFS CID
  timestamp: t.timestamp().notNull(), // When the change occurred
  block_number: t.integer().notNull(), // The block number when this change occurred
}));

/// Track pinning status across different IPFS providers
export const pinning_status = onchainTable("pinning_status", (t) => ({
  id: t.text().primaryKey(), // composite of cid + provider
  cid: t.text().notNull(), // The IPFS CID being pinned
  provider: t.text().notNull(), // One of: 'local', 'cloud', 'pinata'
  node_id: t.text().notNull(), // Reference to ipfs_nodes.id - which specific node is handling this pin
  status: t.text().notNull(), // Status of pinning (pending, success, failed)
  pinned_at: t.timestamp(), // When it was successfully pinned
  last_check: t.timestamp(), // Last time we checked the pin status
  error: t.text() // Any error message if pinning failed
}));

/// Track metrics and statistics
export const pinning_metrics = onchainTable("pinning_metrics", (t) => ({
  id: t.text().primaryKey(), // Composite of metric_type + timestamp
  metric_type: t.text().notNull(), // Type of metric (total_pins, total_size, etc)
  provider: t.text().notNull(), // One of: 'local', 'cloud', 'pinata'
  node_id: t.text().notNull(), // Reference to ipfs_nodes.id - which node these metrics are for
  value: t.integer().notNull(), // The metric value
  timestamp: t.timestamp().notNull(), // When this metric was recorded
  period: t.text().notNull() // hourly, daily, weekly, monthly
}));