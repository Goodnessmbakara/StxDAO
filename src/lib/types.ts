import type { Network } from './stacks-types';

export interface KnownDao {
  name: string;
  contractAddress: string;
  network?: Network; // Network the DAO is deployed on
  adapterType?: string; // Optional: specific adapter to use (e.g., 'executor', 'generic')
}

export interface DaoTreasury {
  name: string;
  stxBalance: number;
  lastUpdatedBlock: number;
  fungibleTokens?: {
    // Optional: other tokens held by the DAO
    assetId: string;
    balance: string;
    symbol?: string;
  }[];
}

export type ProposalStatus = 'Active' | 'Passed' | 'Rejected';

export interface Proposal {
  id: string;
  title: string;
  status: ProposalStatus;
  daoContractAddress: string;
}

export interface ProposalDetails extends Proposal {
  description: string;
  votes: {
    yes: number;
    no: number;
  };
  creationBlock: number;
  proposer: string;
}

/**
 * Error type for DAO operations
 */
export interface DaoError {
  code: 'INVALID_ADDRESS' | 'NOT_A_DAO' | 'NETWORK_ERROR' | 'UNKNOWN_STRUCTURE' | 'NOT_FOUND';
  message: string;
  contractAddress?: string;
}

