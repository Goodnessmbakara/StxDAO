/**
 * DAO Data Access Layer
 * Public API for fetching DAO information from the Stacks blockchain
 */

import type { KnownDao, DaoTreasury, Proposal, ProposalDetails } from './types';
import { getAdapterForDao, getKnownDaos as getKnownDaosRegistry } from './dao-registry';
import type { Network } from './stacks-types';
import { isValidStacksAddress } from './stacks-api';

// Default network - can be overridden via environment variable
const DEFAULT_NETWORK: Network =
  (process.env.NEXT_PUBLIC_DEFAULT_NETWORK as Network) || 'mainnet';

/**
 * Cache configuration for Next.js
 * Treasury data: 60 seconds
 * Proposals: 30 seconds
 * Proposal details: 120 seconds (more stable)
 */
const TREASURY_CACHE_TIME = 60;
const PROPOSALS_CACHE_TIME = 30;
const PROPOSAL_DETAILS_CACHE_TIME = 120;

/**
 * Get list of known/curated DAOs
 */
export async function getKnownDaos(network?: Network): Promise<KnownDao[]> {
  // Return known DAOs - this is static data so no API caching needed
  return getKnownDaosRegistry(network || DEFAULT_NETWORK);
}

/**
 * Get DAO treasury information
 * 
 * @param contractAddress - Full contract address (e.g., SP000...123.dao-contract)
 * @param network - Network to query (mainnet or testnet)
 */
export async function getDaoTreasury(
  contractAddress: string,
  network: Network = DEFAULT_NETWORK
): Promise<DaoTreasury | undefined> {
  try {
    // Validate address format
    if (!isValidStacksAddress(contractAddress)) {
      console.error('Invalid Stacks address format:', contractAddress);
      return undefined;
    }

    // Get appropriate adapter for this DAO
    const adapter = await getAdapterForDao(contractAddress, network);
    
    console.log(`Fetching treasury for ${contractAddress} using ${adapter.getName()}`);
    
    // Fetch treasury data - this should ALWAYS work if contract exists
    const treasury = await adapter.getTreasury(contractAddress, network);
    
    return treasury;
  } catch (error) {
    console.error('Failed to fetch DAO treasury:', error);
    
    // Return undefined to let UI handle the error state
    return undefined;
  }
}

/**
 * Get all proposals for a DAO
 * 
 * @param contractAddress - Full contract address
 * @param network - Network to query
 */
export async function getDaoProposals(
  contractAddress: string,
  network: Network = DEFAULT_NETWORK
): Promise<Proposal[]> {
  try {
    // Validate address format
    if (!isValidStacksAddress(contractAddress)) {
      console.error('Invalid Stacks address format:', contractAddress);
      return [];
    }

    // Get appropriate adapter
    const adapter = await getAdapterForDao(contractAddress, network);
    
    console.log(`Fetching proposals for ${contractAddress} using ${adapter.getName()}`);
    
    // Fetch proposals with caching
    const proposals = await adapter.getProposals(contractAddress, network);
    
    return proposals;
  } catch (error) {
    console.error('Failed to fetch DAO proposals:', error);
    
    // Return empty array on error - UI will show empty state
    return [];
  }
}

/**
 * Get detailed information about a specific proposal
 * 
 * @param proposalId - Proposal identifier
 * @param daoContractAddress - DAO contract address (needed for context)
 * @param network - Network to query
 */
export async function getProposalDetails(
  proposalId: string,
  daoContractAddress?: string,
  network: Network = DEFAULT_NETWORK
): Promise<ProposalDetails | undefined> {
  try {
    if (!daoContractAddress) {
      console.warn('DAO contract address required for proposal details');
      return undefined;
    }

    // Get appropriate adapter
    const adapter = await getAdapterForDao(daoContractAddress, network);
    
    console.log(`Fetching proposal ${proposalId} using ${adapter.getName()}`);
    
    // Fetch proposal details with caching
    const details = await adapter.getProposalDetails(proposalId, network);
    
    return details;
  } catch (error) {
    console.error('Failed to fetch proposal details:', error);
    return undefined;
  }
}

/**
 * Validate if a contract address appears to be a DAO
 * This is a quick check before attempting to fetch data
 */
export async function validateDaoContract(
  contractAddress: string,
  network: Network = DEFAULT_NETWORK
): Promise<{ isValid: boolean; error?: string }> {
  // Check address format
  if (!isValidStacksAddress(contractAddress)) {
    return {
      isValid: false,
      error: 'Invalid Stacks contract address format',
    };
  }

  try {
    // Try to fetch treasury - if it works, it's likely a valid contract
    const treasury = await getDaoTreasury(contractAddress, network);
    
    if (treasury) {
      return { isValid: true };
    } else {
      return {
        isValid: false,
        error: 'Contract not found or not accessible',
      };
    }
  } catch (error) {
    return {
      isValid: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

