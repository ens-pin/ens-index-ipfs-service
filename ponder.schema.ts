import { onchainTable } from "ponder";

export const example = onchainTable("example", (t) => ({
  id: t.text().primaryKey(),
  name: t.text(),
}));

export const ipfs_nodes = onchainTable("ipfs_nodes", (t) => ({
  id: t.text().primaryKey(),
  name: t.text(),
  type: t.text(),
}))
