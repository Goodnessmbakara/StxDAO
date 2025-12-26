/**
 * Base DAO Adapter Interface
 * Defines the contract that all DAO adapters must implement
 */

import type { DaoTreasury, Proposal, ProposalDetails } from '../types';
import type { Network } from '../stacks-types';

/**
 * Abstract interface for DAO adapters
 */
export interface DaoAdapter {
  /**
   * Get the DAO's treasury information
   */
  getTreasury(contractAddress: string, network: Network): Promise<DaoTreasury>;

  /**
   * Get all proposals for the DAO
   */
  getProposals(contractAddress: string, network: Network): Promise<Proposal[]>;

  /**
   * Get details for a specific proposal
   */
  getProposalDetails(proposalId: string, network: Network): Promise<ProposalDetails | undefined>;

  /**
   * Check if this adapter can handle the given DAO contract
   */
  canHandle(contractAddress: string, network: Network): Promise<boolean>;

  /**
   * Get adapter name for logging/debugging
   */
  getName(): string;
}

/**
 * Base class providing common utilities for DAO adapters
 */
export abstract class BaseDaoAdapter implements DaoAdapter {
  abstract getTreasury(contractAddress: string, network: Network): Promise<DaoTreasury>;
  abstract getProposals(contractAddress: string, network: Network): Promise<Proposal[]>;
  abstract getProposalDetails(
    proposalId: string,
    network: Network
  ): Promise<ProposalDetails | undefined>;
  abstract canHandle(contractAddress: string, network: Network): Promise<boolean>;
  abstract getName(): string;

  /**
   * Extract DAO name from contract address or source code
   */
  protected extractDaoName(contractAddress: string): string {
    const parts = contractAddress.split('.');
    if (parts.length === 2) {
      // Convert contract-name-format to Title Case
      const contractName = parts[1];
      return contractName
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    }
    return 'Unknown DAO';
  }

  /**
   * Try calling a read-only function, return undefined if it fails
   */
  protected async tryCallReadOnly(
    contractAddress: string,
    contractName: string,
    functionName: string,
    args: string[],
    network: Network
  ): Promise<any | undefined> {
    try {
      const { callReadOnlyFunction } = await import('../stacks-api');
      const principal = contractAddress.split('.')[0];
      return await callReadOnlyFunction(principal, contractName, functionName, args, principal, network);
    } catch (error) {
      console.debug(`Function ${functionName} not available:`, error);
      return undefined;
    }
  }

  /**
   * Parse proposal status from contract response
   */
  protected parseProposalStatus(statusValue: any): 'Active' | 'Passed' | 'Rejected' {
    if (typeof statusValue === 'string') {
      const lower = statusValue.toLowerCase();
      if (lower.includes('pass') || lower.includes('executed')) return 'Passed';
      if (lower.includes('reject') || lower.includes('failed')) return 'Rejected';
      return 'Active';
    }

    if (typeof statusValue === 'object') {
      // Handle Clarity response types
      if (statusValue.type === 'bool') {
        return statusValue.value ? 'Passed' : 'Rejected';
      }
      if (statusValue.type === 'uint' || statusValue.type === 'int') {
        // Common pattern: 0 = Active, 1 = Passed, 2 = Rejected
        const val = parseInt(statusValue.value, 10);
        if (val === 1) return 'Passed';
        if (val === 2) return 'Rejected';
        return 'Active';
      }
    }

    return 'Active'; // Default fallback
  }

  /**
   * Extract number from Clarity value
   */
  protected extractNumber(value: any): number {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') return parseInt(value, 10);
    if (typeof value === 'object' && value.value !== undefined) {
      return parseInt(value.value, 10);
    }
    return 0;
  }

  /**
   * Extract string from Clarity value
   */
  protected extractString(value: any): string {
    if (typeof value === 'string') return value;
    if (typeof value === 'object' && value.value !== undefined) {
      return String(value.value);
    }
    return '';
  }
}
