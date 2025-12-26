/**
 * TypeScript interfaces for Stacks API responses
 */

export type Network = 'mainnet' | 'testnet';

export interface NetworkConfig {
  url: string;
  network: Network;
}

export const NETWORKS: Record<Network, NetworkConfig> = {
  mainnet: {
    url: 'https://api.mainnet.hiro.so',
    network: 'mainnet',
  },
  testnet: {
    url: 'https://api.testnet.hiro.so',
    network: 'testnet',
  },
};

/**
 * Account Balance Response from Stacks API
 * GET /extended/v2/addresses/{address}/balances
 */
export interface AccountBalanceResponse {
  stx: {
    balance: string; // microSTX
    total_sent: string;
    total_received: string;
    total_fees_sent: string;
    total_miner_rewards_received: string;
    locked: string;
    lock_tx_id: string;
    lock_height: number;
    burnchain_lock_height: number;
    burnchain_unlock_height: number;
  };
  fungible_tokens: {
    [tokenAssetId: string]: {
      balance: string;
      total_sent: string;
      total_received: string;
    };
  };
  non_fungible_tokens: {
    [nftAssetId: string]: {
      count: string;
      total_sent: string;
      total_received: string;
    };
  };
}

/**
 * Read-Only Function Call Response
 * POST /v2/contracts/call-read/{contract_address}/{contract_name}/{function_name}
 */
export interface ReadOnlyFunctionResponse {
  okay: boolean;
  result: string; // Hex-encoded Clarity value
  cause?: string; // Error message if okay is false
}

/**
 * Contract Info Response
 * GET /v2/contracts/by_trait
 */
export interface ContractInfo {
  contract_id: string;
  tx_id: string;
  canonical: boolean;
  contract_interface?: {
    functions: ContractFunction[];
    variables: ContractVariable[];
    maps: ContractMap[];
    fungible_tokens: any[];
    non_fungible_tokens: any[];
  };
  source_code: string;
}

export interface ContractFunction {
  name: string;
  access: 'public' | 'read_only' | 'private';
  args: {
    name: string;
    type: string;
  }[];
  outputs: {
    type: string;
  };
}

export interface ContractVariable {
  name: string;
  type: string;
  access: 'constant' | 'variable';
}

export interface ContractMap {
  name: string;
  key: string;
  value: string;
}

/**
 * Block Info Response
 */
export interface BlockInfo {
  canonical: boolean;
  height: number;
  hash: string;
  parent_block_hash: string;
  burn_block_time: number;
  burn_block_time_iso: string;
  burn_block_hash: string;
  burn_block_height: number;
  miner_txid: string;
  parent_microblock_hash: string;
  parent_microblock_sequence: number;
  txs: string[];
  microblocks_accepted: string[];
  microblocks_streamed: string[];
  execution_cost_read_count: number;
  execution_cost_read_length: number;
  execution_cost_runtime: number;
  execution_cost_write_count: number;
  execution_cost_write_length: number;
}

/**
 * API Error Response
 */
export interface ApiError {
  error: string;
  message?: string;
  status?: number;
}
