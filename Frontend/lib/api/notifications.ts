/**
 * Notifications API Service
 */

import { apiClient } from './client';
import { Notification } from './types';

export interface NotificationListResponse {
  results: Notification[];
  count: number;
  limit: number;
  offset: number;
}

export const notificationsApi = {
  /**
   * Get list of notifications with pagination and filtering
   */
  async listNotifications(params?: {
    limit?: number;
    offset?: number;
    read?: 'true' | 'false' | 'all';
  }): Promise<NotificationListResponse> {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());
    if (params?.read) queryParams.append('read', params.read);

    const url = `/api/v1/notifications/?${queryParams.toString()}`;
    return apiClient.get<NotificationListResponse>(url);
  },

  /**
   * Get unread notification count
   */
  async getUnreadCount(): Promise<{ unread_count: number }> {
    return apiClient.get<{ unread_count: number }>(
      '/api/v1/notifications/unread-count/'
    );
  },

  /**
   * Mark specific notification as read
   */
  async markAsRead(notificationId: string): Promise<void> {
    return apiClient.patch(
      `/api/v1/notifications/${notificationId}/mark-read/`,
      {}
    );
  },

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(): Promise<{ detail: string }> {
    return apiClient.post('/api/v1/notifications/mark-all-read/', {});
  },
};
