'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/dashboard/header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Package,
  Truck,
  MapPin,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader,
  Send,
} from 'lucide-react';
import { tripsApi } from '@/lib/api';
import { useFetch } from '@/hooks/useApi';
import { Booking, BookingStatus, Trip } from '@/lib/api/types';

interface BookingWithTrip {
  id: string;
  status: string;
  receiver_name: string;
  receiver_phone: string;
  receiver_address: string;
  weight_kg: string;
  total_price: string;
  trip: {
    origin_city: string;
    destination_city: string;
    departure_date: string;
    arrival_date: string;
  };
  escrow?: {
    id: string;
  };
}

const getBookingStatusColor = (status: string) => {
  switch (status) {
    case 'pending':
      return { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700' };
    case 'confirmed':
      return { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700' };
    case 'in_transit':
      return { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700' };
    case 'delivered':
      return { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700' };
    case 'completed':
      return { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700' };
    default:
      return { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-700' };
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'pending':
      return <Clock className="w-5 h-5" />;
    case 'confirmed':
      return <CheckCircle className="w-5 h-5" />;
    case 'in_transit':
      return <Truck className="w-5 h-5" />;
    case 'delivered':
      return <Package className="w-5 h-5" />;
    case 'completed':
      return <CheckCircle className="w-5 h-5" />;
    default:
      return <AlertCircle className="w-5 h-5" />;
  }
};

export default function DeliveriesPage() {
  const [selectedBooking, setSelectedBooking] = useState<string | null>(null);
  const [otpValue, setOtpValue] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Fetch all bookings for the current user
  const { data: bookingsData, loading: bookingsLoading, refetch } = useFetch<Booking[]>(
    () => tripsApi.listBookings?.() || Promise.resolve([]),
    []
  );

  // Map API Booking objects to BookingWithTrip by fetching trip details
  const [bookings, setBookings] = useState<BookingWithTrip[]>([]);
  
  React.useEffect(() => {
    const mapBookingsToTrips = async () => {
      if (!bookingsData || bookingsData.length === 0) {
        setBookings([]);
        return;
      }

      try {
        const mappedBookings = await Promise.all(
          bookingsData.map(async (booking) => {
            try {
              const tripData = await tripsApi.getTrip(booking.trip);
              return {
                ...booking,
                trip: {
                  origin_city: tripData.origin_city,
                  destination_city: tripData.destination_city,
                  departure_date: tripData.departure_date,
                  arrival_date: tripData.arrival_date,
                },
              } as BookingWithTrip;
            } catch {
              // Fallback if trip details fail
              return {
                ...booking,
                trip: {
                  origin_city: 'Unknown',
                  destination_city: 'Unknown',
                  departure_date: '',
                  arrival_date: '',
                },
              } as BookingWithTrip;
            }
          })
        );
        setBookings(mappedBookings);
      } catch (error) {
        console.error('Failed to map bookings:', error);
      }
    };
    
    mapBookingsToTrips();
  }, [bookingsData]);

  // Group bookings by status
  const statusGroups = {
    pending: bookings.filter((b) => b.status === 'pending'),
    confirmed: bookings.filter((b) => b.status === 'confirmed'),
    in_transit: bookings.filter((b) => b.status === 'in_transit'),
    delivered: bookings.filter((b) => b.status === 'delivered'),
    completed: bookings.filter((b) => b.status === 'completed'),
  };

  const handleMarkInTransit = async (bookingId: string) => {
    try {
      await tripsApi.markInTransit?.(bookingId);
      setMessage('✓ Marked as in transit');
      setTimeout(() => {
        setMessage('');
        refetch();
      }, 2000);
    } catch (error: any) {
      setMessage(`✗ ${error.detail || 'Failed to mark as in transit'}`);
    }
  };

  const handleInitiateDelivery = async (bookingId: string) => {
    try {
      await tripsApi.initiateDelivery?.(bookingId);
      setMessage('✓ OTP sent to receiver');
      setTimeout(() => {
        setMessage('');
        refetch();
      }, 2000);
    } catch (error: any) {
      setMessage(`✗ ${error.detail || 'Failed to initiate delivery'}`);
    }
  };

  const handleVerifyOTP = async (bookingId: string) => {
    if (!otpValue || otpValue.length !== 6) {
      setMessage('✗ Please enter a 6-digit OTP');
      return;
    }

    setOtpLoading(true);
    try {
      const escrow = bookings.find((b) => b.id === bookingId)?.escrow;
      if (!escrow) {
        setMessage('✗ No escrow found for this booking');
        return;
      }
      await tripsApi.verifyOTP?.(escrow.id, otpValue);
      setMessage('✓ OTP verified! Payment released to your wallet');
      setOtpValue('');
      setSelectedBooking(null);
      setTimeout(() => {
        setMessage('');
        refetch();
      }, 2000);
    } catch (error: any) {
      setMessage(`✗ ${error.detail || 'Invalid OTP'}`);
    } finally {
      setOtpLoading(false);
    }
  };

  const BookingCard = ({ booking }: { booking: BookingWithTrip }) => {
    const colors = getBookingStatusColor(booking.status);
    const isSelected = selectedBooking === booking.id;

    return (
      <Card className={`${colors.bg} border ${colors.border}`}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className={colors.text}>{getStatusIcon(booking.status)}</span>
                <CardTitle className={`text-base ${colors.text}`}>
                  {booking.trip.origin_city} → {booking.trip.destination_city}
                </CardTitle>
              </div>
              <CardDescription className={colors.text}>
                {booking.receiver_name} • {booking.weight_kg}kg
              </CardDescription>
            </div>
            <div className={`text-sm font-semibold ${colors.text}`}>
              ₦{booking.total_price.toLocaleString()}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Booking Details */}
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-gray-600">Status:</span>
              <p className={`font-medium ${colors.text}`}>{booking.status.toUpperCase()}</p>
            </div>
            <div>
              <span className="text-gray-600">Date:</span>
              <p className="font-medium">{new Date(booking.trip.arrival_date).toLocaleDateString()}</p>
            </div>
            <div className="col-span-2">
              <span className="text-gray-600">Receiver:</span>
              <p className="font-medium">{booking.receiver_phone}</p>
              <p className="text-xs text-gray-600">{booking.receiver_address}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            {booking.status === 'confirmed' && (
              <Button
                size="sm"
                className="flex-1"
                onClick={() => handleMarkInTransit(booking.id)}
              >
                <Truck className="w-4 h-4 mr-2" />
                In Transit
              </Button>
            )}

            {booking.status === 'in_transit' && (
              <Button
                size="sm"
                className="flex-1"
                onClick={() => handleInitiateDelivery(booking.id)}
              >
                <MapPin className="w-4 h-4 mr-2" />
                Initiate Delivery
              </Button>
            )}

            {booking.status === 'delivered' && (
              <Button
                size="sm"
                variant="outline"
                className="flex-1"
                onClick={() => setSelectedBooking(isSelected ? null : booking.id)}
              >
                {isSelected ? 'Cancel' : 'Enter OTP'}
              </Button>
            )}
          </div>

          {/* OTP Input */}
          {booking.status === 'delivered' && isSelected && (
            <div className="pt-2 border-t space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter 6-digit OTP from receiver
                </label>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="000000"
                    value={otpValue}
                    onChange={(e) => setOtpValue(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    maxLength={6}
                    className="flex-1 text-center font-mono text-lg"
                  />
                  <Button
                    size="sm"
                    onClick={() => handleVerifyOTP(booking.id)}
                    disabled={otpLoading || otpValue.length !== 6}
                  >
                    {otpLoading ? (
                      <>
                        <Loader className="w-4 h-4 animate-spin" />
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <>
      <Header
        title="Deliveries"
        subtitle="Track and confirm your shipments"
      />

      <div className="p-6 space-y-6">
        {/* Message Alert */}
        {message && (
          <Card
            className={
              message.startsWith('✓')
                ? 'border-green-300 bg-green-50'
                : 'border-red-300 bg-red-50'
            }
          >
            <CardContent className="pt-4 flex items-center gap-2">
              {message.startsWith('✓') ? (
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              )}
              <span
                className={
                  message.startsWith('✓')
                    ? 'text-green-800'
                    : 'text-red-800'
                }
              >
                {message}
              </span>
            </CardContent>
          </Card>
        )}

        {/* Bookings by Status */}
        {bookingsLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : bookings.length === 0 ? (
          <Card>
            <CardContent className="pt-12 text-center">
              <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="font-medium text-gray-900 mb-2">No bookings yet</p>
              <p className="text-sm text-gray-600">
                Create a trip or accept bookings to get started
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Pending Bookings */}
            {statusGroups.pending.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-lg font-semibold text-gray-900">
                  Pending Acceptance ({statusGroups.pending.length})
                </h2>
                {statusGroups.pending.map((booking) => (
                  <BookingCard key={booking.id} booking={booking} />
                ))}
              </div>
            )}

            {/* Confirmed Bookings */}
            {statusGroups.confirmed.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-lg font-semibold text-gray-900">
                  Confirmed ({statusGroups.confirmed.length})
                </h2>
                {statusGroups.confirmed.map((booking) => (
                  <BookingCard key={booking.id} booking={booking} />
                ))}
              </div>
            )}

            {/* In Transit */}
            {statusGroups.in_transit.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-lg font-semibold text-gray-900">
                  In Transit ({statusGroups.in_transit.length})
                </h2>
                {statusGroups.in_transit.map((booking) => (
                  <BookingCard key={booking.id} booking={booking} />
                ))}
              </div>
            )}

            {/* Awaiting OTP */}
            {statusGroups.delivered.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-lg font-semibold text-gray-900">
                  Awaiting OTP Confirmation ({statusGroups.delivered.length})
                </h2>
                {statusGroups.delivered.map((booking) => (
                  <BookingCard key={booking.id} booking={booking} />
                ))}
              </div>
            )}

            {/* Completed */}
            {statusGroups.completed.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-lg font-semibold text-gray-900">
                  Completed ({statusGroups.completed.length})
                </h2>
                {statusGroups.completed.map((booking) => (
                  <BookingCard key={booking.id} booking={booking} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
