/**
 * Generic DAO Adapter
 * Works with any DAO contract using common patterns and fallback strategies
 */

import { BaseDaoAdapter } from './base';
import type { DaoTreasury, Proposal, ProposalDetails } from '../types';
import type { Network } from '../stacks-types';
import {
  fetchAccountBalance,
  getLatestBlockHeight,
  microStxToStx,
  parseContractId,
} from '../stacks-api';

/**
 * Generic adapter that attempts to work with any DAO structure
 */
export class GenericDaoAdapter extends BaseDaoAdapter {
  getName(): string {
    return 'Generic DAO Adapter';
  }

  /**
   * Generic adapter can always attempt to handle any DAO
   */
  async canHandle(_contractAddress: string, _network: Network): Promise<boolean> {
    return true; // Always returns true as fallback adapter
  }

  /**
   * Get treasury information
   * Strategy:
   * 1. Fetch contract's STX balance via account balance API
   * 2. Try common read-only functions for additional data
   * 3. Return best available information
   */
  async getTreasury(contractAddress: string, network: Network): Promise<DaoTreasury> {
    try {
      // Get account balance (always works)
      const balanceData = await fetchAccountBalance(contractAddress, network);
      const stxBalance = microStxToStx(balanceData.stx.balance);

      // Get current block height
      const lastUpdatedBlock = await getLatestBlockHeight(network);

      // Extract DAO name from contract address
      const name = this.extractDaoName(contractAddress);

      // Try to get additional treasury info from contract functions
      const parsed = parseContractId(contractAddress);
      if (parsed) {
        // Try common function names
        const treasuryFunctions = [
          'get-balance',
          'get-treasury',
          'get-stx-balance',
          'get-treasury-balance',
        ];

        for (const funcName of treasuryFunctions) {
          const result = await this.tryCallReadOnly(
            parsed.principal,
            parsed.contractName,
            funcName,
            [],
            network
          );

          if (result !== undefined) {
            console.log(`Found treasury via ${funcName}:`, result);
            // If we got a value, use it (might be more accurate than account balance)
            const contractBalance = this.extractNumber(result);
            if (contractBalance > 0) {
              return {
                name,
                stxBalance: microStxToStx(contractBalance),
                lastUpdatedBlock,
              };
            }
          }
        }
      }

      // Return data from account balance API
      return {
        name,
        stxBalance,
        lastUpdatedBlock,
      };
    } catch (error) {
      console.error('Failed to fetch treasury:', error);
      throw new Error(
        `Unable to fetch treasury data for ${contractAddress}: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Get proposals
   * Strategy:
   * 1. Try get-proposal-count to determine total proposals
   * 2. Iterate through proposals using get-proposal-by-id or get-proposal
   * 3. Fall back to empty array if no proposals found
   */
  async getProposals(contractAddress: string, network: Network): Promise<Proposal[]> {
    const parsed = parseContractId(contractAddress);
    if (!parsed) {
      console.warn('Invalid contract address format for proposals');
      return [];
    }

    try {
      // Try to get proposal count
      const countFunctions = ['get-proposal-count', 'get-proposals-count', 'proposal-count'];
      let proposalCount: number | undefined;

      for (const funcName of countFunctions) {
        const result = await this.tryCallReadOnly(
          parsed.principal,
          parsed.contractName,
          funcName,
          [],
          network
        );
        if (result !== undefined) {
          proposalCount = this.extractNumber(result);
          console.log(`Found ${proposalCount} proposals via ${funcName}`);
          break;
        }
      }

      // If we have a count, try to fetch proposals
      if (proposalCount !== undefined && proposalCount > 0) {
        const proposals: Proposal[] = [];
        const limit = Math.min(proposalCount, 50); // Cap at 50 for performance

        for (let i = 0; i < limit; i++) {
          // Try different proposal getter patterns
          const getterFunctions = [
            { name: 'get-proposal', arg: String(i) },
            { name: 'get-proposal-by-id', arg: String(i) },
            { name: 'proposal', arg: String(i) },
          ];

          for (const { name: funcName, arg } of getterFunctions) {
            const proposalData = await this.tryCallReadOnly(
              parsed.principal,
              parsed.contractName,
              funcName,
              [arg],
              network
            );

            if (proposalData) {
              const proposal = this.parseProposalData(i, proposalData, contractAddress);
              if (proposal) {
                proposals.push(proposal);
                break;
              }
            }
          }
        }

        return proposals;
      }

      // No proposals found via standard functions
      console.log('No proposals found using standard functions');
      return [];
    } catch (error) {
      console.error('Error fetching proposals:', error);
      return [];
    }
  }

  /**
   * Get proposal details
   * Strategy:
   * 1. Try to call get-proposal-details with the proposal ID
   * 2. Fall back to get-proposal
   * 3. Return undefined if not found
   */
  async getProposalDetails(
    proposalId: string,
    network: Network
  ): Promise<ProposalDetails | undefined> {
    // For generic adapter, we need the DAO contract address
    // This is a limitation - we'll need to pass it from the context
    // For now, return undefined
    console.warn('Generic adapter cannot fetch proposal details without DAO context');
    return undefined;
  }

  /**
   * Parse proposal data from contract response
   */
  private parseProposalData(
    id: number,
    data: any,
    daoContractAddress: string
  ): Proposal | undefined {
    try {
      // Handle different response formats
      if (typeof data === 'object') {
        const title = this.extractString(data.title || data.name || data.description || `Proposal ${id}`);
        const status = this.parseProposalStatus(data.status || data.state);

        return {
          id: String(id),
          title: title || `Proposal ${id}`,
          status,
          daoContractAddress,
        };
      }

      // If we got basic data, create minimal proposal
      return {
        id: String(id),
        title: `Proposal ${id}`,
        status: 'Active',
        daoContractAddress,
      };
    } catch (error) {
      console.error(`Failed to parse proposal ${id}:`, error);
      return undefined;
    }
  }
}
