/**
 * Wallet & Payment API Service
 */

import { apiClient } from './client';
import {
  Wallet,
  WalletTransaction,
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
  async getTransactions(): Promise<WalletTransaction[]> {
    return apiClient.get<WalletTransaction[]>('/api/v1/wallet/transactions/');
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
