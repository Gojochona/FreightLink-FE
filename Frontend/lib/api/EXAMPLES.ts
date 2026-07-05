/**
 * API Usage Examples & Guide
 * 
 * Import and use the APIs in your components:
 * 
 * import { authApi, walletApi, tripsApi, notificationsApi } from '@/lib/api'
 * import { useApi, useFetch } from '@/hooks/useApi'
 * import { ApiClient } from '@/lib/api'
 */

// ============================================================================
// AUTHENTICATION EXAMPLES
// ============================================================================

export const authExamples = {
  /**
   * Login
   */
  login: `
    import { authApi } from '@/lib/api';
    import { useApi } from '@/hooks/useApi';
    import { ApiClient } from '@/lib/api';

    export function LoginPage() {
      const { execute: login, loading, error } = useApi(authApi.login);

      const handleSubmit = async (email: string, password: string) => {
        try {
          const response = await login({ email, password });
          // Store tokens
          ApiClient.setTokens(response.access, response.refresh);
          // Redirect to dashboard
          router.push('/dashboard');
        } catch (err) {
          console.error('Login failed:', err);
        }
      };

      return (
        <form onSubmit={(e) => {
          e.preventDefault();
          const email = e.currentTarget.email.value;
          const password = e.currentTarget.password.value;
          handleSubmit(email, password);
        }}>
          <input type="email" name="email" required />
          <input type="password" name="password" required />
          <button type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
          {error && <p style={{color: 'red'}}>{error.message}</p>}
        </form>
      );
    }
  `,

  /**
   * Register
   */
  register: `
    import { authApi, UserRole } from '@/lib/api';
    import { useApi } from '@/hooks/useApi';
    import { ApiClient } from '@/lib/api';

    export function RegisterPage() {
      const { execute: register, loading } = useApi(authApi.register);

      const handleRegister = async (data) => {
        try {
          const user = await register({
            ...data,
            role: UserRole.SENDER, // or UserRole.CARRIER
          });
          // Redirect to login or auto-login
          router.push('/login');
        } catch (err) {
          console.error('Registration failed:', err);
        }
      };

      return (
        // Your register form JSX
      );
    }
  `,

  /**
   * Get Current User Profile
   */
  getProfile: `
    import { authApi } from '@/lib/api';
    import { useFetch } from '@/hooks/useApi';

    export function ProfilePage() {
      const { data: profile, loading, error } = useFetch(
        authApi.getProfile,
        [] // dependencies
      );

      if (loading) return <div>Loading...</div>;
      if (error) return <div>Error: {error.message}</div>;

      return (
        <div>
          <h1>{profile?.full_name}</h1>
          <p>Email: {profile?.email}</p>
          <p>Role: {profile?.role}</p>
          <p>KYC Status: {profile?.kyc_status}</p>
        </div>
      );
    }
  `,

  /**
   * Update Profile
   */
  updateProfile: `
    import { authApi } from '@/lib/api';
    import { useApi } from '@/hooks/useApi';

    export function EditProfile() {
      const { execute: updateProfile, loading } = useApi(authApi.updateProfile);

      const handleUpdate = async (data) => {
        try {
          const updated = await updateProfile({
            first_name: data.firstName,
            last_name: data.lastName,
            phone_number: data.phone,
          });
          console.log('Profile updated:', updated);
        } catch (err) {
          console.error('Update failed:', err);
        }
      };

      return (
        // Your form JSX
      );
    }
  `,

  /**
   * KYC Upload
   */
  kycUpload: `
    import { authApi, DocumentType } from '@/lib/api';
    import { useApi } from '@/hooks/useApi';

    export function KYCUploadPage() {
      const { execute: upload, loading } = useApi(authApi.uploadKycDocuments);

      const handleUpload = async (files) => {
        try {
          await upload({
            document_type: DocumentType.PASSPORT,
            document_front: files.front,
            document_back: files.back,
            selfie: files.selfie,
          });
          alert('Documents uploaded successfully!');
        } catch (err) {
          console.error('Upload failed:', err);
        }
      };

      return (
        // Your upload form JSX
      );
    }
  `,
};

// ============================================================================
// WALLET EXAMPLES
// ============================================================================

export const walletExamples = {
  /**
   * Get Wallet Balance
   */
  getWallet: `
    import { walletApi } from '@/lib/api';
    import { useFetch } from '@/hooks/useApi';

    export function WalletPage() {
      const { data: wallet, loading } = useFetch(
        walletApi.getWallet,
        []
      );

      if (loading) return <div>Loading wallet...</div>;

      return (
        <div>
          <h2>Wallet Balance</h2>
          <p>Available: ₦{wallet?.available_balance}</p>
          <p>Locked (in escrow): ₦{wallet?.locked_balance}</p>
          <p>Total: ₦{wallet?.total_balance}</p>
        </div>
      );
    }
  `,

  /**
   * Initiate Deposit
   */
  initiateDeposit: `
    import { walletApi } from '@/lib/api';
    import { useApi } from '@/hooks/useApi';

    export function DepositPage() {
      const { execute: initiateDeposit, loading } = useApi(walletApi.initiateDeposit);

      const handleDeposit = async (amount: string) => {
        try {
          const response = await initiateDeposit(amount);
          // Redirect to Paystack payment URL
          window.location.href = response.payment_url;
        } catch (err) {
          console.error('Deposit failed:', err);
        }
      };

      return (
        // Your deposit form JSX
      );
    }
  `,

  /**
   * Get Transactions
   */
  getTransactions: `
    import { walletApi } from '@/lib/api';
    import { useFetch } from '@/hooks/useApi';

    export function TransactionHistory() {
      const { data: transactions } = useFetch(
        walletApi.getTransactions,
        []
      );

      return (
        <table>
          <thead>
            <tr>
              <th>Type</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {transactions?.map((tx) => (
              <tr key={tx.id}>
                <td>{tx.transaction_type}</td>
                <td>₦{tx.amount}</td>
                <td>{tx.status}</td>
                <td>{new Date(tx.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    }
  `,

  /**
   * Verify OTP (Delivery Confirmation)
   */
  verifyOtp: `
    import { walletApi } from '@/lib/api';
    import { useApi } from '@/hooks/useApi';

    export function DeliveryConfirmation({ escrowId }) {
      const { execute: verifyOtp, loading } = useApi(walletApi.verifyOtp);

      const handleVerifyOtp = async (otp: string) => {
        try {
          const response = await verifyOtp(escrowId, otp);
          alert('Delivery confirmed! Payment released.');
          console.log('Escrow:', response.escrow);
        } catch (err) {
          console.error('OTP verification failed:', err);
        }
      };

      return (
        // Your OTP input form JSX
      );
    }
  `,
};

// ============================================================================
// TRIPS & BOOKINGS EXAMPLES
// ============================================================================

export const tripsExamples = {
  /**
   * List Available Trips
   */
  listTrips: `
    import { tripsApi } from '@/lib/api';
    import { useFetch } from '@/hooks/useApi';

    export function TripsListing() {
      const [filters, setFilters] = useState({
        from_location: 'London',
        to_location: 'Lagos',
      });

      const { data: trips, loading } = useFetch(
        () => tripsApi.listTrips(filters),
        [filters]
      );

      return (
        <div>
          <h2>Available Trips</h2>
          {trips?.results.map((trip) => (
            <div key={trip.id}>
              <h3>{trip.origin_city} → {trip.destination_city}</h3>
              <p>Departure: {new Date(trip.departure_date).toLocaleDateString()}</p>
              <p>Price: ₦{trip.price_per_kg}/kg</p>
              <p>Available: {trip.available_kg}kg</p>
              <button onClick={() => router.push(\`/trips/\${trip.id}\`)}>
                Book Now
              </button>
            </div>
          ))}
        </div>
      );
    }
  `,

  /**
   * Create Trip (Post as Traveler)
   */
  createTrip: `
    import { tripsApi } from '@/lib/api';
    import { useApi } from '@/hooks/useApi';

    export function CreateTripPage() {
      const { execute: createTrip, loading } = useApi(tripsApi.createTrip);

      const handleCreateTrip = async (formData) => {
        try {
          const trip = await createTrip({
            origin_country: formData.originCountry,
            origin_city: formData.originCity,
            destination_country: formData.destCountry,
            destination_city: formData.destCity,
            departure_date: formData.departureDate,
            arrival_date: formData.arrivalDate,
            total_kg: formData.totalKg,
            price_per_kg: formData.pricePerKg,
            booking_cutoff_date: formData.bookingCutoff,
            accepts_fragile: formData.acceptsFragile,
            accepts_food: formData.acceptsFood,
            accepts_electronics: formData.acceptsElectronics,
          });
          router.push(\`/trips/\${trip.id}\`);
        } catch (err) {
          console.error('Failed to create trip:', err);
        }
      };

      return (
        // Your trip creation form JSX
      );
    }
  `,

  /**
   * Book Trip
   */
  bookTrip: `
    import { tripsApi, ItemCategory } from '@/lib/api';
    import { useApi } from '@/hooks/useApi';

    export function BookTripPage({ tripId }) {
      const { execute: bookTrip, loading } = useApi((data) =>
        tripsApi.bookTrip(tripId, data)
      );

      const handleBook = async (formData) => {
        try {
          const booking = await bookTrip({
            weight_kg: formData.weight,
            estimated_value_ngn: formData.value,
            receiver_name: formData.receiverName,
            receiver_phone: formData.receiverPhone,
            receiver_address: formData.receiverAddress,
            item_category: ItemCategory.DOCUMENTS,
            item_description: formData.itemDescription,
            sender_confirmed_legal: true,
          });
          router.push(\`/bookings/\${booking.id}\`);
        } catch (err) {
          console.error('Booking failed:', err);
        }
      };

      return (
        // Your booking form JSX
      );
    }
  `,

  /**
   * Accept Booking (Traveler)
   */
  acceptBooking: `
    import { tripsApi } from '@/lib/api';
    import { useApi } from '@/hooks/useApi';

    export function BookingDetails({ bookingId }) {
      const { execute: acceptBooking, loading } = useApi(() =>
        tripsApi.acceptBooking(bookingId)
      );

      return (
        <button onClick={() => acceptBooking()} disabled={loading}>
          {loading ? 'Accepting...' : 'Accept Booking'}
        </button>
      );
    }
  `,

  /**
   * Confirm Handover
   */
  confirmHandover: `
    import { tripsApi } from '@/lib/api';
    import { useApi } from '@/hooks/useApi';

    export function ConfirmHandover({ bookingId }) {
      const { execute: confirmHandover, loading } = useApi(() =>
        tripsApi.confirmHandover(bookingId)
      );

      return (
        <button onClick={() => confirmHandover()} disabled={loading}>
          Confirm Item Handover
        </button>
      );
    }
  `,

  /**
   * Mark In Transit
   */
  markInTransit: `
    import { tripsApi } from '@/lib/api';
    import { useApi } from '@/hooks/useApi';

    export function MarkInTransit({ bookingId }) {
      const { execute: markInTransit, loading } = useApi(() =>
        tripsApi.markInTransit(bookingId)
      );

      return (
        <button onClick={() => markInTransit()} disabled={loading}>
          Mark as In Transit
        </button>
      );
    }
  `,

  /**
   * Initiate Delivery & Send OTP
   */
  initiateDelivery: `
    import { tripsApi } from '@/lib/api';
    import { useApi } from '@/hooks/useApi';

    export function InitiateDelivery({ bookingId }) {
      const { execute: initiateDelivery, loading } = useApi(() =>
        tripsApi.initiateDelivery(bookingId)
      );

      return (
        <button onClick={() => initiateDelivery()} disabled={loading}>
          Arrive & Send OTP
        </button>
      );
    }
  `,
};

// ============================================================================
// NOTIFICATIONS EXAMPLES
// ============================================================================

export const notificationsExamples = {
  /**
   * Get Notifications Badge Count
   */
  unreadCount: `
    import { notificationsApi } from '@/lib/api';
    import { useFetch } from '@/hooks/useApi';

    export function NotificationBadge() {
      const { data: count } = useFetch(
        notificationsApi.getUnreadCount,
        []
      );

      return (
        <div style={{ position: 'relative' }}>
          <button>Notifications</button>
          {count && count.unread_count > 0 && (
            <span style={{
              position: 'absolute',
              top: 0,
              right: 0,
              background: 'red',
              color: 'white',
              borderRadius: '50%',
              padding: '2px 6px',
              fontSize: '12px',
            }}>
              {count.unread_count}
            </span>
          )}
        </div>
      );
    }
  `,

  /**
   * Get All Notifications
   */
  listNotifications: `
    import { notificationsApi } from '@/lib/api';
    import { useFetch } from '@/hooks/useApi';

    export function NotificationCenter() {
      const { data: notifications, refetch } = useFetch(
        notificationsApi.listNotifications,
        []
      );

      return (
        <div>
          <h2>Notifications</h2>
          {notifications?.map((notif) => (
            <div key={notif.id} style={{
              padding: '10px',
              border: '1px solid #ccc',
              opacity: notif.is_read ? 0.6 : 1,
            }}>
              <h4>{notif.title}</h4>
              <p>{notif.message}</p>
              <small>{new Date(notif.created_at).toLocaleString()}</small>
            </div>
          ))}
          <button onClick={() => notificationsApi.markAllAsRead().then(() => refetch())}>
            Mark All as Read
          </button>
        </div>
      );
    }
  `,
};

// ============================================================================
// SETUP GUIDE
// ============================================================================

export const setupGuide = `
1. CREATE .env.local FILE:
   NEXT_PUBLIC_API_URL=http://localhost:8000

2. IMPORT AND USE IN YOUR COMPONENTS:

   // Authentication
   import { authApi, ApiClient } from '@/lib/api';
   
   // Wallet & Payments
   import { walletApi } from '@/lib/api';
   
   // Trips & Bookings
   import { tripsApi } from '@/lib/api';
   
   // Notifications
   import { notificationsApi } from '@/lib/api';
   
   // Hooks
   import { useApi, useFetch } from '@/hooks/useApi';

3. STORE TOKENS AFTER LOGIN:
   const response = await authApi.login(credentials);
   ApiClient.setTokens(response.access, response.refresh);

4. CLEAR TOKENS ON LOGOUT:
   ApiClient.clearTokens();

5. THE API CLIENT WILL AUTOMATICALLY:
   - Add Authorization header to all requests
   - Handle token refresh on 401 errors
   - Parse JSON responses
   - Throw ApiError on failures
`;
