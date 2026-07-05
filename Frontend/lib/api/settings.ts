/**
 * Settings & Security API Service
 * Handles 2FA, notification preferences, and security settings
 */

import { apiClient } from './client';
import {
  EnableTwoFactorRequest,
  EnableTwoFactorResponse,
  VerifyTwoFactorRequest,
  VerifyTwoFactorResponse,
  DisableTwoFactorRequest,
  NotificationPreferences,
  NotificationPreferencesResponse,
} from './types';

export const settingsApi = {
  // ========================================================================
  // TWO-FACTOR AUTHENTICATION
  // ========================================================================

  /**
   * Enable 2FA
   * Returns OTP destination (phone or email)
   */
  async enableTwoFactor(
    request: EnableTwoFactorRequest
  ): Promise<EnableTwoFactorResponse> {
    return apiClient.post<EnableTwoFactorResponse>(
      '/api/v1/auth/security/2fa/enable/',
      request
    );
  },

  /**
   * Verify 2FA with OTP
   * Returns backup codes for account recovery
   */
  async verifyTwoFactor(
    request: VerifyTwoFactorRequest
  ): Promise<VerifyTwoFactorResponse> {
    return apiClient.post<VerifyTwoFactorResponse>(
      '/api/v1/auth/security/2fa/verify/',
      request
    );
  },

  /**
   * Disable 2FA (requires password confirmation)
   */
  async disableTwoFactor(
    request: DisableTwoFactorRequest
  ): Promise<void> {
    return apiClient.post(
      '/api/v1/auth/security/2fa/disable/',
      request
    );
  },

  // ========================================================================
  // NOTIFICATION PREFERENCES
  // ========================================================================

  /**
   * Get user's notification preferences
   */
  async getNotificationPreferences(): Promise<NotificationPreferencesResponse> {
    return apiClient.get<NotificationPreferencesResponse>(
      '/api/v1/auth/settings/notifications/'
    );
  },

  /**
   * Update notification preferences
   */
  async updateNotificationPreferences(
    preferences: NotificationPreferences
  ): Promise<NotificationPreferencesResponse> {
    return apiClient.patch<NotificationPreferencesResponse>(
      '/api/v1/auth/settings/notifications/',
      preferences
    );
  },
};
