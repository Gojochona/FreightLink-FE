/**
 * FreightLink API Types
 * Auto-generated from OpenAPI schema
 */

// ============================================================================
// ENUMS
// ============================================================================

// User capabilities (replaced UserRole enum)
// Users can now have multiple capabilities simultaneously
export const UserCapabilities = {
  SENDER: 'is_sender',
  TRAVELER: 'is_traveler',
  PLATFORM_ADMIN: 'is_platform_admin',
} as const;

export enum KycStatus {
  UNVERIFIED = 'unverified',
  PENDING = 'pending',
  VERIFIED = 'verified',
  REJECTED = 'rejected',
}

export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  ITEM_HANDED_OVER = 'item_handed_over',
  IN_TRANSIT = 'in_transit',
  DELIVERED = 'delivered',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  DISPUTED = 'disputed',
}

export enum TripStatus {
  OPEN = 'open',
  FULLY_BOOKED = 'fully_booked',
  IN_TRANSIT = 'in_transit',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum NotificationType {
  BOOKING_RECEIVED = 'booking_received',
  BOOKING_CONFIRMED = 'booking_confirmed',
  BOOKING_REJECTED = 'booking_rejected',
  BOOKING_CANCELLED = 'booking_cancelled',
  ITEM_HANDED_OVER = 'item_handed_over',
  ITEM_IN_TRANSIT = 'item_in_transit',
  OTP_SENT = 'otp_sent',
  DELIVERY_CONFIRMED = 'delivery_confirmed',
  ESCROW_RELEASED = 'escrow_released',
  ESCROW_REFUNDED = 'escrow_refunded',
  ESCROW_HELD = 'escrow_held',         
  WALLET_DEPOSIT = 'wallet_deposit',
  KYC_APPROVED = 'kyc_approved',
  KYC_REJECTED = 'kyc_rejected',
  TRIP_EXPIRING_SOON = 'trip_expiring_soon',
}

export enum EscrowStatus {
  HOLDING = 'holding',
  RELEASED = 'released',
  REFUNDED = 'refunded',
  DISPUTED = 'disputed',
}

export enum DocumentType {
  PASSPORT = 'passport',
  NATIONAL_ID = 'national_id',
  DRIVERS_LICENSE = 'drivers_license',
}

export enum ItemCategory {
  FOOD = 'food',
  CLOTHING = 'clothing',
  ELECTRONICS = 'electronics',
  DOCUMENTS = 'documents',
  COSMETICS = 'cosmetics',
  MEDICINE = 'medicine',
  GIFTS = 'gifts',
  OTHER = 'other',
}

export enum TransactionType {
  DEPOSIT = 'deposit',
  ESCROW_HOLD = 'escrow_hold',
  ESCROW_RELEASE = 'escrow_release',
  ESCROW_REFUND = 'escrow_refund',
  WITHDRAWAL = 'withdrawal',
  PLATFORM_FEE = 'platform_fee',
}

export enum TransactionStatus {
  PENDING = 'pending',
  SUCCESS = 'success',
  FAILED = 'failed',
}

// ============================================================================
// AUTH
// ============================================================================

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  password: string;
  password_confirm: string;
  account_type: 'sender' | 'traveler';
}

export interface RegisterResponse {
  user: UserProfile;
  message: string;
}

export interface VerifyRegistrationRequest {
  email: string;
  otp: string;
}

export interface VerifyRegistrationResponse {
  user: UserProfile;
  tokens: TokenResponse;
}

export interface ResendVerificationOTPRequest {
  email: string;
  channel?: 'phone' | 'email';
}

export interface TokenResponse {
  access: string;
  refresh: string;
}

export interface RefreshTokenRequest {
  refresh: string;
}

// ============================================================================
// USER
// ============================================================================

export interface CarrierProfile {
  vehicle_type: string;
  vehicle_plate: string;
  company_name?: string;
  tier: number;
  total_deliveries: number;
  average_rating: number;
}

export interface UserProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  phone_number: string;
  is_sender: boolean;          // User can send packages
  is_traveler: boolean;        // User can create trips (carrier mode)
  is_platform_admin: boolean;  // User is admin
  kyc_status: KycStatus;
  is_active: boolean;
  created_at: string;
  carrier_profile?: CarrierProfile | null;
  unread_notifications: number;
  profile_picture_url: string | null;
}

export interface UpdateUserProfileRequest {
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  is_active?: boolean;
}

// ============================================================================
// KYC
// ============================================================================

export interface ActivateTravelerResponse {
  detail: string;
  kyc_required: boolean;
  message: string;
}

export interface KYCStatusResponse {
  kyc_status: KycStatus;
  message: string;
}

export interface KYCUploadRequest {
  document_type: DocumentType;
  document_front: File;
  document_back?: File;
  selfie?: File;
}

// ============================================================================
// WALLET
// ============================================================================

export interface Wallet {
  id: string;
  available_balance: string; // Decimal
  locked_balance: string; // Decimal
  total_balance: string; // Decimal
  currency: string;
  updated_at: string;
}

export interface WalletTransaction {
  id: string;
  transaction_type: TransactionType;
  amount: string;
  status: TransactionStatus;
  reference: string;             
  description: string;
  balance_after: string | null;
  created_at: string;
}

export interface InitiateDepositRequest {
  amount: string; // Decimal (in NGN)
}

export interface InitiateDepositResponse {
  payment_url: string;
  reference: string;
}

export interface PaystackWebhookRequest {
  event: string;
  data: Record<string, any>;
}

// ============================================================================
// ESCROW
// ============================================================================

export interface Escrow {
  id: string;
  amount: string; // Decimal
  platform_fee: string; // Decimal
  carrier_amount: string; // Decimal
  status: EscrowStatus;
  otp_expires_at: string | null;
  otp_verified_at: string | null;
  released_at: string | null;
  refunded_at: string | null;
  created_at: string;
}

export interface VerifyOTPRequest {
  otp: string; // 6 characters
}

export interface VerifyOTPResponse {
  detail: string;
  escrow: Escrow;
}

// ============================================================================
// TRIPS
// ============================================================================

export interface CreateTripRequest {
  origin_country: string;
  origin_city: string;
  destination_country: string;
  destination_city: string;
  departure_date: string; // ISO datetime
  arrival_date: string; // ISO datetime
  total_kg: string; // Decimal
  price_per_kg: string; // Decimal (NGN)
  booking_cutoff_date: string; // ISO datetime
  notes?: string;
  accepts_fragile?: boolean;
  accepts_food?: boolean;
  accepts_electronics?: boolean;
  ticket_upload: File;
}

export interface Trip {
  id: string;
  traveler_name: string;
  traveler_rating: string; // Decimal
  origin_country: string;
  origin_city: string;
  destination_country: string;
  destination_city: string;
  departure_date: string;
  arrival_date: string;
  total_kg: string;
  available_kg: string;
  booked_kg: string;
  price_per_kg: string;
  booking_cutoff_date: string;
  status: TripStatus;
  notes: string;
  accepts_fragile: boolean;
  accepts_food: boolean;
  accepts_electronics: boolean;
  booking_closes_soon: boolean;
  ticket_verified: boolean;
  created_at: string; 
  traveler_avatar: string | null;
}

export interface PaginatedTripList {
  count: number;
  next: string | null;
  previous: string | null;
  results: Trip[];
}

// ============================================================================
// BOOKINGS
// ============================================================================

export interface ItemDeclaration {
  category: ItemCategory;
  description: string;
  estimated_value_ngn: string;
  traveler_accepted: boolean;
}

export interface CreateBookingRequest {
  weight_kg: string; // Decimal
  estimated_value_ngn: string; // Decimal
  receiver_name: string;
  receiver_phone: string;
  receiver_address: string;
  item_category: ItemCategory;
  item_description: string;
  sender_confirmed_legal: boolean;
}

export interface HandoverState {
  sender_confirmed: boolean;
  sender_photo: string | null;
  traveler_confirmed: boolean;
  traveler_photo: string | null;
  is_complete: boolean;
}

export interface Booking {
  id: string;
  trip: string;
  trip_route: string;
  sender: string;
  sender_name: string;
  sender_phone: string;
  receiver_name: string;
  receiver_phone: string;
  receiver_address: string;
  weight_kg: string;
  total_price: string;
  status: BookingStatus;
  viewer_role: 'sender' | 'traveler' | null;
  item_declaration: ItemDeclaration | null;
  needs_last_mile_delivery: boolean;
  handover: HandoverState;
  delivery_photo_url: string | null;
  delivery_confirmed_via: 'receiver_otp' | 'sender_confirmation' | null;
  confirmed_at: string | null;
  handed_over_at: string | null;
  delivered_at: string | null;
  completed_at: string | null;
  created_at: string;
  sender_avatar: string | null;
}

export interface RejectBookingRequest {
  reason: string;
}

// ============================================================================
// NOTIFICATIONS
// ============================================================================

export interface Notification {
  id: string;
  notification_type: NotificationType;
  title: string;
  message: string;
  is_read: boolean;
  read_at: string | null;
  related_object_id: string | null;
  related_object_type: string;
  created_at: string;
}

export interface UnreadCountResponse {
  unread_count: number;
}

// ============================================================================
// API ERRORS
// ============================================================================

export interface ApiError {
  message: string;
  status: number;
  details?: Record<string, any>;
}

export class ApiErrorClass extends Error implements ApiError {
  message: string;
  status: number;
  details?: Record<string, any>;

  constructor(message: string, status: number, details?: Record<string, any>) {
    super(message);
    this.message = message;
    this.status = status;
    this.details = details;
    this.name = 'ApiError';
  }
}

// ============================================================================
// 2FA / SECURITY
// ============================================================================

export interface EnableTwoFactorRequest {
  method: 'sms' | 'email';
}

export interface EnableTwoFactorResponse {
  otp_destination: string;
  otp_expires_in: number; // seconds
}

export interface VerifyTwoFactorRequest {
  otp: string;
}

export interface VerifyTwoFactorResponse {
  status: string;
  backup_codes: string[];
}

export interface DisableTwoFactorRequest {
  password: string;
}

// ============================================================================
// SETTINGS & PREFERENCES
// ============================================================================

export interface NotificationPreferences {
  email_notifications: boolean;
  sms_notifications: boolean;
  push_notifications: boolean;
  booking_updates: boolean;
  delivery_updates: boolean;
  payment_updates: boolean;
  promotional_emails: boolean;
}

export interface NotificationPreferencesResponse {
  id: string;
  user: string;
  email_notifications: boolean;
  sms_notifications: boolean;
  push_notifications: boolean;
  booking_updates: boolean;
  delivery_updates: boolean;
  payment_updates: boolean;
  promotional_emails: boolean;
  updated_at: string;
}

// ============================================================================
// AVATAR
// ============================================================================

export interface AvatarUploadRequest {
  file: File;
}

export interface AvatarResponse {
  url: string;
  file_name: string;
  file_size: number;
  uploaded_at: string;
}

// ============================================================================
// DASHBOARD
// ============================================================================

export interface DashboardStats {
  total_trips: number;
  active_bookings: number;
  total_revenue: string; // Decimal
  pending_payouts: string; // Decimal
  wallet_balance: string; // Decimal
  completed_trips: number;
  trips_change_percent: number;
  bookings_change_percent: number;
  wallet_change_percent: number;
  revenue_mtd: string; // Decimal
  revenue_change_percent: number;
  total_bookings: number;
}

export interface RecentTrip {
  id: string;
  origin_city: string;
  destination_city: string;
  departure_date: string;
  status: TripStatus;
  available_kg: string;
  price_per_kg: string;
  bookings_count: number;
  reference_number: string | null;
  from_location: string;
  to_location: string;
  available_capacity_kg: number;
}

export interface UpcomingTrip {
  id: string;
  origin_city: string;
  destination_city: string;
  departure_date: string;
  available_kg: string;
  price_per_kg: string;
}

export interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: string;
  action_url: string;
}

// Add this after TransactionType enum definition
export type SimpleTransactionType = 'credit' | 'debit';

// Update FinancialAnalytics interface
export interface FinancialAnalytics {
  period?: string;
  range?: number;
  total_revenue?: string | number;
  total_transactions?: number;
  avg_transaction?: string | number;
  revenue_change?: number;
  bookings_change?: number;
  total_bookings?: number;
  bookings_sent_count?: number;
  bookings_received_count?: number;
  total_credits?: number;
  total_debits?: number;
  transactions?: Array<{
    date: string;
    amount: string | number;
    type: SimpleTransactionType; // Changed from TransactionType
    description?: string;
  }>;
  recent_transactions?: Array<{
    date: string;
    amount: string | number;
    type: SimpleTransactionType; // Changed from string
    description?: string;
  }>;
  bookings_received?: Record<string, any>;
  bookings_sent?: Record<string, any>;
  revenue_overview?: Array<{
    period: string;
    amount: string | number;
  }>;
}

export interface WalletBalanceHistory {
  snapshots: Array<{
    date: string;
    balance: string;
  }>;
}

// ============================================================================
// DISPUTES
// ============================================================================

export enum DisputeStatus {
  OPEN = 'open',
  UNDER_REVIEW = 'under_review',
  RESOLVED_REFUND = 'resolved_refund',
  RESOLVED_RELEASE = 'resolved_release',
  CLOSED = 'closed',
}

export enum DisputeReason {
  ITEM_DAMAGE = 'item_damage',
  ITEM_MISSING = 'item_missing',
  WRONG_ITEM = 'wrong_item',
  ITEM_QUALITY = 'item_quality',
  DELIVERY_LATE = 'delivery_late',
  PAYMENT_WITHHELD = 'payment_withheld',
  OTHER = 'other',
}

export interface Dispute {
  id: string;
  booking_id: string;
  raised_by_id: string;
  raised_by_name: string;
  reason: DisputeReason;
  description: string;
  status: DisputeStatus;
  created_at: string;
  updated_at: string;
  resolution_notes?: string;
}

export interface DisputeMessage {
  id: string;
  dispute_id: string;
  sender_id: string;
  sender_name: string;
  message: string;
  created_at: string;
}

export interface CreateDisputeRequest {
  reason: DisputeReason;
  description: string;
}

export interface AddDisputeMessageRequest {
  message: string;
}
