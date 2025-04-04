import { onchainTable } from "ponder";

export const example = onchainTable("example", (t) => ({
  id: t.text().primaryKey(),
  name: t.text(),
}));

/// The IPFS nodes that are made available by the user
export const ipfs_nodes = onchainTable("ipfs_nodes", (t) => ({
  id: t.text().primaryKey(),
  name: t.text(),
  type: t.text(),
  url: t.text()
}))
