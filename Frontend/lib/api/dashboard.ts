/**
 * Dashboard API Service
 * Handles analytics and overview data
 */

import { apiClient } from './client';
import {
  DashboardStats,
  RecentTrip,
  UpcomingTrip,
  QuickAction,
  FinancialAnalytics,
  WalletBalanceHistory,
} from './types';

export const dashboardApi = {
  /**
   * Get dashboard statistics (cached for 5 minutes)
   */
  async getStats(): Promise<DashboardStats> {
    return apiClient.get<DashboardStats>('/api/v1/dashboard/stats/');
  },

  /**
   * Get recent trips
   */
  async getRecentTrips(limit: number = 5): Promise<RecentTrip[]> {
    return apiClient.get<RecentTrip[]>(`/api/v1/dashboard/recent-trips/?limit=${limit}`);
  },

  /**
   * Get upcoming trips
   */
  async getUpcomingTrips(): Promise<UpcomingTrip[]> {
    return apiClient.get<UpcomingTrip[]>('/api/v1/dashboard/upcoming-trips/');
  },

  /**
   * Get quick actions for user's role
   */
  async getQuickActions(): Promise<QuickAction[]> {
    return apiClient.get<QuickAction[]>('/api/v1/dashboard/quick-actions/');
  },

  /**
   * Get financial analytics
   * @param period - 'days' | 'weeks' | 'months'
   * @param range - number of periods to retrieve
   */
  async getFinancialAnalytics(
    period: 'days' | 'weeks' | 'months' = 'days',
    range: number = 30
  ): Promise<FinancialAnalytics> {
    return apiClient.get<FinancialAnalytics>(
      `/api/v1/dashboard/financial-analytics/?period=${period}&range=${range}`
    );
  },

  /**
   * Get wallet balance history
   */
  async getWalletBalanceHistory(): Promise<WalletBalanceHistory> {
    return apiClient.get<WalletBalanceHistory>('/api/v1/wallet/balance-history/');
  },
};
