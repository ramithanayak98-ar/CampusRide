# CampusRide – Your Campus, Connected

CampusRide is a campus-based ride-sharing platform designed to help students conveniently share rides to and from campus.

The platform allows students to offer rides, search for available rides, book seats, and manage their bookings through a simple interface.

## Features

### User Authentication
- User registration and login.
- Secure password hashing.
- Session authentication using JWT.
- Logout functionality.

### Offer a Ride
- Drivers can publish rides.
- Enter pickup and destination locations.
- Set departure date and time.
- Add vehicle details and available seats.
- Set the cost per seat.

### Find a Ride
- Search for available rides.
- View ride and driver details.
- Select the number of seats.
- Book available seats.

### Booking Management
- View personal bookings.
- Cancel confirmed bookings.
- Automatically restore seats after cancellation.
- Prevent drivers from booking their own rides.
- Maintain booking and ride availability status.

## Technology Stack

| Component | Technology |
|---|---|
| Frontend | Next.js, React, TypeScript |
| Backend | Next.js API Routes |
| Database | MySQL |
| Database Connection | mysql2 |
| Authentication | JWT (jose) |
| Password Security | bcryptjs |
| Styling | CSS |

## Project Structure

```text
campus-mobility/
├── app/
│   ├── api/
│   │   ├── bookings/
│   │   ├── login/
│   │   ├── logout/
│   │   ├── me/
│   │   ├── register/
│   │   └── rides/
│   ├── bookings/
│   ├── find/
│   ├── login/
│   ├── offer/
│   └── register/
├── lib/
│   └── db.ts
├── public/
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/ramithanayak98-ar/CampusRide.git
cd CampusRide
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env.local` file in the project root.

Add the database configuration and session secret required by the application.

Use `.env.example` as a reference.

**Important:** Never upload `.env.local` or share database passwords and secret keys on GitHub.

### 4. Set up the database

1. Open MySQL Workbench.
2. Create the database named `campus_mobility`.
3. Import the provided `campusride_schema.sql` file.
4. Configure your database credentials in `.env.local`.

### 5. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Running the Production Build

To check whether the project builds successfully:

```bash
npm run build
```

## Team Collaboration

This project is developed collaboratively using Git and GitHub.

- **Ramitha Nayak** – Project development and implementation.
- **Shreya Hegde** – Collaborative development and assigned project modules.

Both team members contribute to the development, testing, and improvement of CampusRide.

## Future Enhancements

- User dashboard.
- Admin dashboard.
- Ride and booking analytics.
- Additional ride management features.
- Improved testing and documentation.

## Project Goal

CampusRide aims to make campus transportation more convenient, affordable, and collaborative by connecting students who are travelling in similar directions.

---

**CampusRide – Your Campus, Connected.**