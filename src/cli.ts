/// Author : Victor Mak
/// Date   : 2025-04-04
/// Description: CLI entry point for the application

import { Command } from "commander";
import {create} from "kubo-rpc-client";
const program = new Command();

const ipfs_client = create();