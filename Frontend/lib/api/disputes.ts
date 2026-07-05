/**
 * Disputes API Service
 * Handles dispute management and resolution
 */

import { apiClient } from './client';
import {
  Dispute,
  DisputeMessage,
  CreateDisputeRequest,
  AddDisputeMessageRequest,
} from './types';

export interface DisputeListParams {
  limit?: number;
  offset?: number;
  status?: string;
}

export const disputesApi = {
  /**
   * Create a dispute for a booking
   */
  async createDispute(
    bookingId: string,
    request: CreateDisputeRequest
  ): Promise<Dispute> {
    return apiClient.post<Dispute>(
      `/api/v1/bookings/${bookingId}/dispute/`,
      request
    );
  },

  /**
   * Get list of disputes for current user
   */
  async listDisputes(params?: DisputeListParams): Promise<Dispute[]> {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());
    if (params?.status) queryParams.append('status', params.status);

    const query = queryParams.toString();
    const url = `/api/v1/disputes/${query ? `?${query}` : ''}`;

    return apiClient.get<Dispute[]>(url);
  },

  /**
   * Get dispute details and messages
   */
  async getDisputeDetail(disputeId: string): Promise<{
    dispute: Dispute;
    messages: DisputeMessage[];
  }> {
    return apiClient.get(
      `/api/v1/disputes/${disputeId}/`
    );
  },

  /**
   * Add a message to a dispute thread
   */
  async addDisputeMessage(
    disputeId: string,
    request: AddDisputeMessageRequest
  ): Promise<DisputeMessage> {
    return apiClient.post<DisputeMessage>(
      `/api/v1/disputes/${disputeId}/messages/`,
      request
    );
  },

  /**
   * Resolve dispute (admin only)
   * @param disputeId - ID of dispute
   * @param resolution_type - 'refund' or 'release'
   * @param notes - Resolution notes
   */
  async resolveDispute(
    disputeId: string,
    resolution_type: 'refund' | 'release',
    notes: string
  ): Promise<Dispute> {
    return apiClient.post<Dispute>(
      `/api/v1/admin/disputes/${disputeId}/resolve/`,
      {
        resolution_type,
        resolution_notes: notes,
      }
    );
  },
};
