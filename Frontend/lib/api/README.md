# FreightLink Frontend API Integration

Complete API integration for the FreightLink platform. All endpoints from the OpenAPI schema are available through well-organized TypeScript services.

## 📁 Structure

```
lib/api/
├── types.ts          # All TypeScript types from OpenAPI schema
├── client.ts         # Base API client with auth & error handling
├── auth.ts           # Authentication endpoints
├── wallet.ts         # Wallet & payment endpoints
├── trips.ts          # Trips & bookings endpoints
├── notifications.ts  # Notifications endpoints
├── index.ts          # Main exports
└── EXAMPLES.ts       # Usage examples
```

## 🚀 Quick Start

### 1. Setup Environment

Create `.env.local` in your project root:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 2. Import Services

```typescript
import {
  authApi,
  walletApi,
  tripsApi,
  notificationsApi,
  ApiClient,
  type UserProfile,
  UserRole,
} from '@/lib/api';
import { useApi, useFetch } from '@/hooks/useApi';
```

## 📖 Usage Examples

### Authentication

#### Login

```typescript
import { authApi, ApiClient } from '@/lib/api';
import { useApi } from '@/hooks/useApi';

export function LoginPage() {
  const { execute: login, loading, error } = useApi(authApi.login);

  const handleLogin = async (email: string, password: string) => {
    try {
      const response = await login({ email, password });
      ApiClient.setTokens(response.access, response.refresh);
      router.push('/dashboard');
    } catch (err) {
      console.error('Login failed:', err);
    }
  };

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      handleLogin(
        e.currentTarget.email.value,
        e.currentTarget.password.value
      );
    }}>
      <input type="email" placeholder="Email" required />
      <input type="password" placeholder="Password" required />
      <button disabled={loading}>{loading ? 'Loading...' : 'Login'}</button>
      {error && <p style={{color: 'red'}}>{error.message}</p>}
    </form>
  );
}
```

#### Register

```typescript
import { authApi, UserRole } from '@/lib/api';
import { useApi } from '@/hooks/useApi';

const { execute: register } = useApi(authApi.register);

await register({
  email: 'user@example.com',
  first_name: 'John',
  last_name: 'Doe',
  phone_number: '08012345678',
  role: UserRole.SENDER, // or UserRole.CARRIER
  password: 'password123',
  password_confirm: 'password123',
});
```

#### Get User Profile

```typescript
import { authApi } from '@/lib/api';
import { useFetch } from '@/hooks/useApi';

const { data: profile, loading, error } = useFetch(
  authApi.getProfile,
  []
);

// profile.role === 'sender' | 'carrier' | 'admin'
// profile.kyc_status === 'unverified' | 'pending' | 'verified' | 'rejected'
```

#### Update Profile

```typescript
import { authApi } from '@/lib/api';
import { useApi } from '@/hooks/useApi';

const { execute: updateProfile } = useApi(authApi.updateProfile);

await updateProfile({
  first_name: 'Jane',
  last_name: 'Smith',
  phone_number: '08098765432',
});
```

#### Upload KYC Documents

```typescript
import { authApi, DocumentType } from '@/lib/api';
import { useApi } from '@/hooks/useApi';

const { execute: uploadKyc } = useApi(authApi.uploadKycDocuments);

const fileInput = document.getElementById('kyc-upload') as HTMLInputElement;
const files = fileInput.files!;

await uploadKyc({
  document_type: DocumentType.PASSPORT,
  document_front: files[0],
  document_back: files[1],
  selfie: files[2],
});
```

### Wallet & Payments

#### Get Wallet Balance

```typescript
import { walletApi } from '@/lib/api';
import { useFetch } from '@/hooks/useApi';

const { data: wallet } = useFetch(walletApi.getWallet, []);

console.log(wallet?.available_balance); // "15000.50"
console.log(wallet?.locked_balance);    // "5000.00"
console.log(wallet?.total_balance);     // "20000.50"
```

#### Initiate Deposit (Paystack)

```typescript
import { walletApi } from '@/lib/api';
import { useApi } from '@/hooks/useApi';

const { execute: initiateDeposit } = useApi(walletApi.initiateDeposit);

const response = await initiateDeposit('5000'); // Amount in NGN
window.location.href = response.payment_url;    // Redirect to Paystack
```

#### Get Transaction History

```typescript
import { walletApi } from '@/lib/api';
import { useFetch } from '@/hooks/useApi';

const { data: transactions } = useFetch(walletApi.getTransactions, []);

transactions?.forEach((tx) => {
  console.log(`${tx.transaction_type}: ₦${tx.amount} (${tx.status})`);
});
```

#### Verify OTP (Confirm Delivery)

```typescript
import { walletApi } from '@/lib/api';
import { useApi } from '@/hooks/useApi';

const { execute: verifyOtp } = useApi(walletApi.verifyOtp);

const response = await verifyOtp(escrowId, '123456');
console.log('Escrow released:', response.escrow);
```

### Trips & Bookings

#### Search Available Trips

```typescript
import { tripsApi, type TripsListParams } from '@/lib/api';
import { useFetch } from '@/hooks/useApi';

const filters: TripsListParams = {
  from_location: 'London',
  to_location: 'Lagos',
  travel_month: '2026-05',
  min_kg_needed: 10,
  max_price_per_kg: 500,
  page: 1,
};

const { data: trips } = useFetch(
  () => tripsApi.listTrips(filters),
  [JSON.stringify(filters)]
);

trips?.results.forEach((trip) => {
  console.log(`${trip.origin_city} → ${trip.destination_city}`);
  console.log(`₦${trip.price_per_kg}/kg, ${trip.available_kg}kg available`);
});
```

#### Get Trip Details

```typescript
import { tripsApi } from '@/lib/api';
import { useFetch } from '@/hooks/useApi';

const { data: trip } = useFetch(
  () => tripsApi.getTrip(tripId),
  [tripId]
);
```

#### Create Trip (as Traveler/Carrier)

```typescript
import { tripsApi } from '@/lib/api';
import { useApi } from '@/hooks/useApi';

const { execute: createTrip } = useApi(tripsApi.createTrip);

const newTrip = await createTrip({
  origin_country: 'United Kingdom',
  origin_city: 'London',
  destination_country: 'Nigeria',
  destination_city: 'Lagos',
  departure_date: '2026-05-15T10:00:00Z',
  arrival_date: '2026-05-20T15:30:00Z',
  total_kg: '100',
  price_per_kg: '450',
  booking_cutoff_date: '2026-05-10T23:59:59Z',
  notes: 'No fragile items',
  accepts_fragile: false,
  accepts_food: true,
  accepts_electronics: true,
});
```

#### Book a Trip (Send Item)

```typescript
import { tripsApi, ItemCategory } from '@/lib/api';
import { useApi } from '@/hooks/useApi';

const { execute: bookTrip } = useApi((data) => tripsApi.bookTrip(tripId, data));

const booking = await bookTrip({
  weight_kg: '5',
  estimated_value_ngn: '50000',
  receiver_name: 'Chukwu Okafor',
  receiver_phone: '08098765432',
  receiver_address: '123 Lagos Street, Lagos',
  item_category: ItemCategory.ELECTRONICS,
  item_description: 'Laptop computer',
  sender_confirmed_legal: true,
});
```

#### Accept Booking (as Traveler)

```typescript
import { tripsApi } from '@/lib/api';
import { useApi } from '@/hooks/useApi';

const { execute: acceptBooking } = useApi(() =>
  tripsApi.acceptBooking(bookingId)
);

const updated = await acceptBooking();
```

#### Reject Booking (as Traveler)

```typescript
import { tripsApi } from '@/lib/api';
import { useApi } from '@/hooks/useApi';

const { execute: rejectBooking } = useApi((reason) =>
  tripsApi.rejectBooking(bookingId, reason)
);

await rejectBooking('Item too heavy for my luggage');
```

#### Confirm Item Handover

```typescript
import { tripsApi } from '@/lib/api';
import { useApi } from '@/hooks/useApi';

const { execute: confirmHandover } = useApi(() =>
  tripsApi.confirmHandover(bookingId)
);

await confirmHandover();
```

#### Mark as In Transit

```typescript
import { tripsApi } from '@/lib/api';
import { useApi } from '@/hooks/useApi';

const { execute: markInTransit } = useApi(() =>
  tripsApi.markInTransit(bookingId)
);

const updated = await markInTransit();
```

#### Initiate Delivery (Send OTP to Receiver)

```typescript
import { tripsApi } from '@/lib/api';
import { useApi } from '@/hooks/useApi';

const { execute: initiateDelivery } = useApi(() =>
  tripsApi.initiateDelivery(bookingId)
);

await initiateDelivery(); // Sends OTP to receiver
```

### Notifications

#### Get Notifications

```typescript
import { notificationsApi } from '@/lib/api';
import { useFetch } from '@/hooks/useApi';

const { data: notifications } = useFetch(
  notificationsApi.listNotifications,
  []
);

notifications?.forEach((notif) => {
  console.log(`${notif.title}: ${notif.message}`);
});
```

#### Get Unread Count (Badge)

```typescript
import { notificationsApi } from '@/lib/api';
import { useFetch } from '@/hooks/useApi';

const { data: count } = useFetch(
  notificationsApi.getUnreadCount,
  []
);

return <span className="badge">{count?.unread_count}</span>;
```

#### Mark All as Read

```typescript
import { notificationsApi } from '@/lib/api';

await notificationsApi.markAllAsRead();
```

## 🔑 Authentication

### Token Management

Tokens are automatically stored and managed by the API client:

```typescript
import { ApiClient } from '@/lib/api';

// Manually set tokens (after login)
ApiClient.setTokens(accessToken, refreshToken);

// Clear tokens (on logout)
ApiClient.clearTokens();
```

### Auto Token Refresh

When a request returns 401 (Unauthorized), the API client automatically:
1. Attempts to refresh the token using the refresh token
2. Retries the original request
3. If refresh fails, clears tokens and redirects to login

No additional setup needed!

## 🛠️ Custom Hooks

### `useApi<T, Args>(fn, options?)`

For executing one-off API calls:

```typescript
const { data, loading, error, execute } = useApi(authApi.login);

await execute({ email: 'user@example.com', password: 'pass' });
```

Options:
- `onSuccess?: (data) => void` - Called on successful response
- `onError?: (error) => void` - Called on error

### `useFetch<T>(fn, deps?)`

For fetching data on component mount:

```typescript
const { data, loading, error, refetch } = useFetch(
  authApi.getProfile,
  [] // re-runs when dependencies change
);
```

Returns `refetch()` to manually trigger a refresh.

## 📝 Types

All response types are TypeScript-first:

```typescript
import type {
  UserProfile,
  Trip,
  Booking,
  Wallet,
  Notification,
  KYCStatusResponse,
  Escrow,
} from '@/lib/api';
```

### Enums

```typescript
import {
  UserRole,      // 'sender' | 'carrier' | 'admin'
  KycStatus,     // 'unverified' | 'pending' | 'verified' | 'rejected'
  BookingStatus, // 'pending' | 'confirmed' | 'in_transit' | ...
  TripStatus,    // 'open' | 'fully_booked' | 'in_transit' | ...
  ItemCategory,  // 'food' | 'electronics' | 'documents' | ...
  DocumentType,  // 'passport' | 'national_id' | 'drivers_license'
} from '@/lib/api';
```

## ❌ Error Handling

All errors are `ApiError` instances with:

```typescript
try {
  await tripsApi.getTrip(invalidId);
} catch (err) {
  if (err instanceof ApiErrorClass) {
    console.log(err.status);      // HTTP status code
    console.log(err.message);     // Error message
    console.log(err.details);     // Response body
  }
}
```

Common status codes:
- `400` - Bad Request (validation error)
- `401` - Unauthorized (invalid/expired token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Server Error

## 🧪 Testing

Example with mock API:

```typescript
const mockApi = {
  login: jest.fn().mockResolvedValue({
    access: 'token',
    refresh: 'refresh',
  }),
};

// Pass mock to useApi
const { execute } = useApi(mockApi.login);
```

## 📚 Full API Reference

See [EXAMPLES.ts](./EXAMPLES.ts) for more examples of every endpoint.

## ⚙️ Configuration

Default configuration can be overridden:

```typescript
import { ApiClient } from '@/lib/api';

const client = new ApiClient('https://api.production.com');
// Use client for requests
```

## 🔒 Security

- Tokens stored in localStorage (client-side only)
- For production, consider httpOnly cookies
- Authorization header automatically added to all requests
- CSRF protection via backend

## 📖 Next Steps

1. Import services in your pages/components
2. Use `useApi` for mutations (login, register, create)
3. Use `useFetch` for queries (list, get)
4. Handle errors with try/catch
5. Store tokens after login with `ApiClient.setTokens()`

Happy coding! 🚀
