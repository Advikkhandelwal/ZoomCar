# ZoomCar Frontend

A modern, responsive car-rental marketplace frontend inspired by Airbnb, built with React.

## Features

### Renter Flow
- **Landing Page** - Hero section with search and featured cars
- **Browse Cars** - Grid view with filters (location, price, fuel type)
- **Car Details** - Detailed view with image gallery, specs, and booking
- **Authentication** - Login/Signup with Google OAuth UI

### Owner Flow
- **Owner Dashboard** - Manage cars, bookings, and earnings
- **Add Car** - List new cars for rent
- **Edit/Delete Cars** - Manage your listings

### Design
- Airbnb-inspired clean, minimal UI
- Mobile-first responsive design
- Smooth transitions and hover effects
- Modern typography (Inter font)
- Premium color scheme

## Tech Stack

- **React** (JavaScript)
- **React Router** - Client-side routing
- **Context API** - State management
- **Vanilla CSS** - Styling with design tokens
- **Vite** - Build tool

## Getting Started

### Prerequisites
- Node.js 16+ and npm

### Installation

1. Install dependencies:
```bash
cd frontend
npm install
```

2. Configure API URL:
Create a `.env` file in the frontend directory:
```
VITE_API_URL=http://localhost:5000/api
```

3. Start development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
npm run preview
```

## Project Structure

```
frontend/
├── src/
│   ├── components/      # Reusable components
│   │   ├── Navbar.jsx
│   │   ├── Footer.jsx
│   │   ├── CarCard.jsx
│   │   ├── SearchBar.jsx
│   │   └── ProtectedRoute.jsx
│   ├── pages/          # Page components
│   │   ├── LandingPage.jsx
│   │   ├── LoginPage.jsx
│   │   ├── SignupPage.jsx
│   │   ├── BrowseCarsPage.jsx
│   │   ├── CarDetailsPage.jsx
│   │   ├── OwnerDashboard.jsx
│   │   └── AddCarPage.jsx
│   ├── context/        # React Context
│   │   └── AuthContext.jsx
│   ├── services/       # API services
│   │   └── api.js
│   ├── index.css       # Global styles & design system
│   ├── App.jsx         # Main app component
│   └── main.jsx        # Entry point
└── package.json
```

## Design System

The app uses a comprehensive design system with:
- **Color Palette** - Primary (pink/red), neutrals, semantic colors
- **Typography** - Inter font family with 8 size scales
- **Spacing** - Consistent spacing scale (4px to 64px)
- **Shadows** - 4 levels of elevation
- **Border Radius** - 4 sizes for different components
- **Transitions** - Smooth animations (150ms to 350ms)

## API Integration

The frontend expects a REST API with the following endpoints:

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/signup` - User registration
- `POST /api/auth/google` - Google OAuth
- `GET /api/auth/me` - Get current user

### Cars
- `GET /api/cars` - Get all cars (with filters)
- `GET /api/cars/:id` - Get car details
- `POST /api/cars` - Create new car
- `PUT /api/cars/:id` - Update car
- `DELETE /api/cars/:id` - Delete car
- `GET /api/cars/owner/my-cars` - Get owner's cars

### Bookings
- `POST /api/bookings` - Create booking
- `GET /api/bookings/user` - Get user bookings
- `GET /api/bookings/owner` - Get owner bookings
- `PATCH /api/bookings/:id/status` - Update booking status

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile

## Privacy Features

- Phone numbers are NOT visible publicly
- Phone numbers shown only after booking confirmation
- Owner and renter details shown via booking relationship

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

MIT
