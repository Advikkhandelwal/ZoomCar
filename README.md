# ZoomCar - The Airbnb for Cars 

ZoomCar is a full-stack car-sharing marketplace that connects car owners with renters. Owners can list their vehicles to earn extra income, while renters can browse and book a wide variety of cars nearby for their travel needs.

## Key Features

### For Renters
- **Smart Search**: Filter cars by location, brand, price, fuel type, and availability. (Case-insensitive search).
- **Interactive Maps**: View car locations on a map via Leaflet integration.
- **Identity Verification**: Secure person-to-person sharing with Aadhaar and Driving License verification.
- **Safe Bookings**: Book cars with specific start/end dates and track status (Pending, Approved, Active, Completed).
- **Reviews & Ratings**: Share your experience and browse ratings from other travelers.

### For Owners
- **Easy Listing**: List your car with photos, pricing, and specific features.
- **Owner Dashboard**: Manage booking requests, track earnings, and view renter identity details for confirmed trips.
- **Revenue Tracking**: Automated calculation of total booking prices and historical earnings data.
- **Verification Badges**: Get verified to increase trust and booking rates.

## Tech Stack

- **Frontend**: React.js, Vite, CSS (Vanilla), Leaflet Maps.
- **Backend**: Node.js, Express.js.
- **Database**: PostgreSQL (via Supabase).
- **ORM**: Prisma.
- **Storage**: Supabase Storage (for car images and verification docs).
- **Authentication**: JWT (JSON Web Tokens) & Bcrypt for secure password hashing.

## Getting Started

### Prerequisites
- Node.js (v16+)
- npm or yarn
- A Supabase account (for database and storage)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/zoomcar.git
   cd zoomcar
   ```

2. **Backend Setup**:
   ```bash
   cd backend
   npm install
   ```
   Create a `.env` file in the `backend` directory:
   ```env
   DATABASE_URL="your_postgresql_connection_string"
   DIRECT_URL="your_direct_postgresql_connection_string"
   SUPABASE_URL="your_supabase_project_url"
   SUPABASE_ANON_KEY="your_supabase_anon_key"
   JWT_SECRET="your_secure_jwt_secret"
   ```
   Initialize the database:
   ```bash
   npx prisma migrate dev
   ```
   Start the server:
   ```bash
   npm run dev
   ```

3. **Frontend Setup**:
   ```bash
   cd ../frontend
   npm install
   ```
   Create a `.env` file in the `frontend` directory:
   ```env
   VITE_API_URL="http://localhost:5000/api"
   VITE_SUPABASE_URL="your_supabase_project_url"
   VITE_SUPABASE_ANON_KEY="your_supabase_anon_key"
   ```
   Start the application:
   ```bash
   npm run dev
   ```

## Database Maintenance
To ensure stability on platforms like Render or Supabase:
- **Connection Pooling**: The project uses a centralized Prisma client to manage database connections efficiently and prevent "Max Clients" errors.
- **Migrations**: Always run `npx prisma migrate dev` after updating the `schema.prisma`.

## License
Internal Project - Not for redistribution.
