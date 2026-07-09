/**
 * Authentication API Service
 */

import { apiClient } from './client';
import {
  LoginRequest,
  RegisterRequest,
  RegisterResponse,
  VerifyRegistrationRequest,
  VerifyRegistrationResponse,
  ResendVerificationOTPRequest,
  TokenResponse,
  RefreshTokenRequest,
  UserProfile,
  UpdateUserProfileRequest,
  KYCStatusResponse,
  KYCUploadRequest,
  ActivateTravelerResponse,
} from './types';

export const authApi = {
  /**
   * Login with email and password
   */
  async login(credentials: LoginRequest): Promise<TokenResponse> {
    return apiClient.post<TokenResponse>('/api/v1/auth/login/', credentials);
  },

  /**
   * Register new user. Returns no tokens — the account is unverified
   * until the OTP sent at registration is confirmed via verifyRegistration.
   */
  async register(data: RegisterRequest): Promise<RegisterResponse> {
    return apiClient.post<RegisterResponse>('/api/v1/auth/register/', data);
  },

  /**
   * Confirm the registration OTP. On success returns login tokens.
   */
  async verifyRegistration(data: VerifyRegistrationRequest): Promise<VerifyRegistrationResponse> {
    return apiClient.post<VerifyRegistrationResponse>('/api/v1/auth/verify-registration/', data);
  },

  /**
   * Resend the registration OTP, optionally switching to email delivery.
   */
  async resendVerificationOTP(data: ResendVerificationOTPRequest): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>('/api/v1/auth/resend-verification-otp/', data);
  },

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<TokenResponse> {
    const request: RefreshTokenRequest = { refresh: refreshToken };
    return apiClient.post<TokenResponse>('/api/v1/auth/refresh/', request);
  },

  /**
   * Logout (blacklist refresh token)
   */
  async logout(refreshToken: string): Promise<void> {
    await apiClient.post('/api/v1/auth/logout/', {
      refresh: refreshToken,
    });
  },

  /**
   * Get current user profile
   */
  async getProfile(): Promise<UserProfile> {
    return apiClient.get<UserProfile>('/api/v1/auth/me/');
  },

  /**
   * Update user profile
   */
  async updateProfile(data: UpdateUserProfileRequest): Promise<UserProfile> {
    return apiClient.patch<UserProfile>('/api/v1/auth/me/', data);
  },

  /**
   * Get KYC status
   */
  async getKycStatus(): Promise<KYCStatusResponse> {
    return apiClient.get<KYCStatusResponse>('/api/v1/auth/kyc/status/');
  },

  /**
   * Automatically verify identity via NIN or BVN lookup (Dojah), as a
   * faster alternative to manual document review. If the returned name
   * matches the account closely enough, kyc_status becomes 'verified'
   * immediately.
   */
  async verifyId(idType: 'nin' | 'bvn', idNumber: string): Promise<{
    verified: boolean;
    kyc_status: string;
    detail: string;
  }> {
    return apiClient.post('/api/v1/auth/kyc/verify-id/', {
      id_type: idType,
      id_number: idNumber,
    });
  },

  /**
   * Upload KYC documents
   */
  async uploadKycDocuments(data: KYCUploadRequest): Promise<void> {
    const formData = new FormData();
    formData.append('document_type', data.document_type);
    formData.append('document_front', data.document_front);

    if (data.document_back) {
      formData.append('document_back', data.document_back);
    }

    if (data.selfie) {
      formData.append('selfie', data.selfie);
    }

    return apiClient.post('/api/v1/auth/kyc/upload/', formData, {
      skipContentType: true,
    });
  },

  /**
   * Activate traveler mode
   * Converts user from sender-only to traveler (carrier) capable
   * Requires KYC verification after activation
   */
  async activateTraveler(): Promise<ActivateTravelerResponse> {
    return apiClient.post<ActivateTravelerResponse>('/api/v1/auth/activate-traveler/', {});
  },

  /**
   * Change user password
   */
  async changePassword(oldPassword: string, newPassword: string): Promise<void> {
    return apiClient.post('/api/v1/auth/change-password/', {
      old_password: oldPassword,
      new_password: newPassword,
    });
  },
};
