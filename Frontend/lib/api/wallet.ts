/**
 * Wallet & Payment API Service
 */

import { apiClient } from './client';
import {
  Wallet,
  WalletTransaction,
  PaginatedTransactionList,
  TransactionType,
  InitiateDepositRequest,
  InitiateDepositResponse,
  Escrow,
  VerifyOTPRequest,
  VerifyOTPResponse,
} from './types';

export const walletApi = {
  /**
   * Get user's wallet
   */
  async getWallet(): Promise<Wallet> {
    return apiClient.get<Wallet>('/api/v1/wallet/');
  },

  /**
   * Get wallet transaction history
   */
  /**
   * Recent transactions preview (first page, default size) — used for
   * the small list on the wallet overview page.
   */
  async getTransactions(): Promise<WalletTransaction[]> {
    const res = await apiClient.get<PaginatedTransactionList>('/api/v1/wallet/transactions/');
    return res.results;
  },

  /**
   * Full paginated transaction history — used by the dedicated
   * "All Transactions" screen.
   */
  async getTransactionsPaginated(params?: {
    page?: number;
    page_size?: number;
    type?: TransactionType;
  }): Promise<PaginatedTransactionList> {
    const query = new URLSearchParams();
    if (params?.page) query.set('page', String(params.page));
    if (params?.page_size) query.set('page_size', String(params.page_size));
    if (params?.type) query.set('type', params.type);
    const qs = query.toString();
    return apiClient.get<PaginatedTransactionList>(
      `/api/v1/wallet/transactions/${qs ? `?${qs}` : ''}`
    );
  },

  /**
   * Initiate deposit via Paystack
   */
  async initiateDeposit(amount: string): Promise<InitiateDepositResponse> {
    const request: InitiateDepositRequest = { amount };
    return apiClient.post<InitiateDepositResponse>(
      '/api/v1/wallet/deposit/initiate/',
      request
    );
  },

  /**
   * Verify deposit payment status after Paystack redirect
   */
  async verifyDeposit(reference: string): Promise<any> {
    return apiClient.get(`/api/v1/wallet/deposit/verify/?reference=${reference}`);
  },

  /**
  * Get a single transaction's full detail
  */
  async getTransactionDetail(transactionId: string): Promise<WalletTransaction> {
    return apiClient.get<WalletTransaction>(`/api/v1/wallet/transactions/${transactionId}/`);
  },

  /**
   * Verify OTP and release escrow
   * Called when carrier confirms delivery
   */
  async verifyOtp(
    escrowId: string,
    otp: string
  ): Promise<VerifyOTPResponse> {
    const request: VerifyOTPRequest = { otp };
    return apiClient.post<VerifyOTPResponse>(
      `/api/v1/wallet/escrow/${escrowId}/verify-otp/`,
      request
    );
  },
};
