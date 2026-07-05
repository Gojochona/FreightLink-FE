/**
 * Profile & Avatar API Service
 * Handles avatar uploads, business info, and profile picture management
 */

import { apiClient } from './client';
import { AvatarResponse } from './types';

export interface BusinessInfo {
  company_name: string;
  registration_number: string;
  tax_id: string;
  business_address: string;
}

export interface BusinessInfoResponse extends BusinessInfo {
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface KYCStatusResponse {
  status: 'not_started' | 'pending' | 'approved' | 'rejected';
  submitted_at: string | null;
  rejection_reason: string | null;
}

export const profileApi = {
  // ========================================================================
  // AVATAR MANAGEMENT
  // ========================================================================

  /**
   * Upload user avatar/profile picture
   * @param file - avatar file (jpg, png, or webp, max 5MB)
   */
  async uploadAvatar(file: File): Promise<AvatarResponse> {
    const formData = new FormData();
    formData.append('avatar', file);

    return apiClient.post<AvatarResponse>(
      '/api/v1/auth/profile/upload-avatar/',
      formData,
      {
        skipContentType: true,
      }
    );
  },

  /**
   * Delete user avatar
   */
  async deleteAvatar(): Promise<void> {
    return apiClient.delete('/api/v1/auth/profile/avatar/');
  },

  // ========================================================================
  // BUSINESS INFORMATION (FOR CARRIERS)
  // ========================================================================

  /**
   * Get business information (carrier profile)
   */
  async getBusinessInfo(): Promise<BusinessInfoResponse> {
    return apiClient.get<BusinessInfoResponse>(
      '/api/v1/auth/profile/business-info/'
    );
  },

  /**
   * Update business information
   */
  async updateBusinessInfo(
    data: BusinessInfo
  ): Promise<BusinessInfoResponse> {
    return apiClient.patch<BusinessInfoResponse>(
      '/api/v1/auth/profile/business-info/',
      data
    );
  },

  // ========================================================================
  // KYC STATUS
  // ========================================================================

  /**
   * Get KYC verification status
   */
  async getKycStatus(): Promise<KYCStatusResponse> {
    return apiClient.get<KYCStatusResponse>(
      '/api/v1/auth/kyc/status/'
    );
  },

  /**
   * Upload KYC documents
   */
  async uploadKycDocuments(formData: FormData): Promise<void> {
    return apiClient.post(
      '/api/v1/auth/kyc/upload/',
      formData,
      {
        skipContentType: true,
      }
    );
  },
};
