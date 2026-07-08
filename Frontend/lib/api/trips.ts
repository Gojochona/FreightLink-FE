/**
 * Trips API Service
 */

import { apiClient } from './client';
import {
  CreateTripRequest,
  Trip,
  PaginatedTripList,
  CreateBookingRequest,
  Booking,
  RejectBookingRequest,
} from './types';

export interface TripsListParams {
  from_location?: string;
  to_location?: string;
  travel_month?: string;
  min_kg_needed?: number;
  max_price_per_kg?: number;
  page?: number;
}

export const tripsApi = {
  /**
   * List available trips with filtering
   */
  async listTrips(params?: TripsListParams): Promise<PaginatedTripList> {
    const queryParams = new URLSearchParams();

    if (params?.from_location)
      queryParams.append('from_location', params.from_location);
    if (params?.to_location)
      queryParams.append('to_location', params.to_location);
    if (params?.travel_month)
      queryParams.append('travel_month', params.travel_month);
    if (params?.min_kg_needed)
      queryParams.append('min_kg_needed', params.min_kg_needed.toString());
    if (params?.max_price_per_kg)
      queryParams.append('max_price_per_kg', params.max_price_per_kg.toString());
    if (params?.page) queryParams.append('page', params.page.toString());

    const endpoint = `/api/v1/trips/${queryParams.toString() ? '?' + queryParams.toString() : ''
      }`;

    return apiClient.get<PaginatedTripList>(endpoint);
  },

  /**
   * Get single trip by ID
   */
  async getTrip(tripId: string): Promise<Trip> {
    return apiClient.get<Trip>(`/api/v1/trips/${tripId}/`);
  },

  /**
   * Create new trip (carrier/traveler). Requires a ticket_upload file —
   * an admin reviews it before the trip appears in sender search results.
   */
  async createTrip(data: CreateTripRequest): Promise<Trip> {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value === undefined || value === null) return;
      formData.append(key, value instanceof File ? value : String(value));
    });
    return apiClient.post<Trip>('/api/v1/trips/', formData, { skipContentType: true });
  },

  /**
   * Book space on a trip
   */
  async bookTrip(tripId: string, data: CreateBookingRequest): Promise<Booking> {
    return apiClient.post<Booking>(`/api/v1/trips/${tripId}/book/`, data);
  },

  /**
   * Get list of bookings for current user
   */
  async listBookings(): Promise<Booking[]> {
    return apiClient.get<Booking[]>('/api/v1/trips/bookings/');
  },

  /**
  * Get a single booking's full detail
  */
  async getBookingDetail(bookingId: string): Promise<Booking> {
    return apiClient.get<Booking>(`/api/v1/trips/bookings/${bookingId}/`);
  },

  /**
   * Get list of bookings on current user's trips
   */
  async getMyTripsBookings(): Promise<Booking[]> {
    return apiClient.get<Booking[]>('/api/v1/trips/my-trips/bookings/');
  },

  /**
   * Get current user's created trips (for carriers)
   */
  async getMyTrips(params?: TripsListParams): Promise<PaginatedTripList> {
    const queryParams = new URLSearchParams();

    if (params?.from_location)
      queryParams.append('from_location', params.from_location);
    if (params?.to_location)
      queryParams.append('to_location', params.to_location);
    if (params?.travel_month)
      queryParams.append('travel_month', params.travel_month);
    if (params?.min_kg_needed)
      queryParams.append('min_kg_needed', params.min_kg_needed.toString());
    if (params?.max_price_per_kg)
      queryParams.append('max_price_per_kg', params.max_price_per_kg.toString());
    if (params?.page) queryParams.append('page', params.page.toString());

    const endpoint = `/api/v1/trips/my-trips/${queryParams.toString() ? '?' + queryParams.toString() : ''
      }`;

    return apiClient.get<PaginatedTripList>(endpoint);
  },
  async acceptBooking(bookingId: string): Promise<Booking> {
    return apiClient.post<Booking>(
      `/api/v1/trips/bookings/${bookingId}/accept/`,
      {}
    );
  },

  /**
   * Reject a booking with reason
   */
  async rejectBooking(
    bookingId: string,
    reason: string
  ): Promise<Booking> {
    const data: RejectBookingRequest = { reason };
    return apiClient.post<Booking>(
      `/api/v1/trips/bookings/${bookingId}/reject/`,
      data
    );
  },

  /**
   * Confirm physical handover of item.
   * A photo is required — the sender confirms first (proving they handed
   * the item over), then the traveler confirms receipt (proving they now
   * have it). Returns whether both sides have now confirmed.
   */
  async confirmHandover(bookingId: string, photo: File): Promise<{ detail: string; handover_complete: boolean }> {
    const formData = new FormData();
    formData.append('photo', photo);
    return apiClient.post(`/api/v1/trips/bookings/${bookingId}/confirm-handover/`, formData, {
      skipContentType: true,
    });
  },

  /**
   * Mark booking as in transit
   */
  async markInTransit(bookingId: string): Promise<Booking> {
    return apiClient.post<Booking>(
      `/api/v1/trips/bookings/${bookingId}/in-transit/`,
      {}
    );
  },

  /**
   * Initiate delivery (generate OTP). Requires a photo as proof of
   * delivery to the receiver.
   */
  async initiateDelivery(bookingId: string, photo: File): Promise<{ detail: string }> {
    const formData = new FormData();
    formData.append('photo', photo);
    return apiClient.post(
      `/api/v1/trips/bookings/${bookingId}/initiate-delivery/`,
      formData,
      { skipContentType: true }
    );
  },

  /**
   * Verify OTP and release escrow
   */
  async verifyOTP(escrowId: string, otp: string): Promise<any> {
    return apiClient.post(
      `/api/v1/wallet/escrow/${escrowId}/verify-otp/`,
      { otp }
    );
  },

  /**
   * Fallback for when the receiver can't relay the OTP back to the
   * carrier (e.g. they're not a FreightLink user and hard to reach).
   * The sender confirms delivery directly instead.
   */
  async senderConfirmDelivery(bookingId: string): Promise<Booking> {
    return apiClient.post<Booking>(
      `/api/v1/trips/bookings/${bookingId}/confirm-delivery/`,
      {}
    );
  },
};
