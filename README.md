# CampusRide – Your Campus, Connected

CampusRide is a campus-based ride-sharing platform designed to help students conveniently share rides to and from campus.

The platform allows students to offer rides, search for available rides, book seats, manage their bookings, and track their ride-sharing activities through a simple interface.

CampusRide uses **MySQL** to manage structured ride and booking information and **MongoDB** to store user activity data and generate activity analytics.

## Features

### User Authentication
- User registration and login.
- Secure password hashing using bcryptjs.
- Session authentication using JWT.
- Logout functionality.
- Role-based access for Admin and Student users.

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
- Maintain booking and ride availability status using database triggers.

### Student Dashboard and Ride Analytics
- View total rides offered.
- View total bookings.
- Track confirmed and cancelled bookings.
- View monthly booking trends.
- Identify popular routes.

### Activity History and MongoDB Analytics
- Record user login activities.
- Track rides offered.
- Track successful ride bookings.
- Record booking cancellations.
- Display recent activities with timestamps.
- Generate activity statistics using MongoDB aggregation pipelines.

### Admin Dashboard
- Admin-only dashboard.
- View registered users.
- Manage and monitor rides.
- View and monitor bookings.
- Search and filter administrative records.
- Restrict administrative access using role-based authorization.

## Technology Stack

| Component | Technology |
|---|---|
| Frontend | Next.js, React, TypeScript |
| Backend | Next.js API Routes |
| SQL Database | MySQL |
| NoSQL Database | MongoDB Atlas |
| MySQL Connection | mysql2 |
| MongoDB Connection | MongoDB Node.js Driver |
| Authentication | JWT (jose) |
| Password Security | bcryptjs |
| Styling | CSS |
| Version Control | Git and GitHub |

## Database Implementation

### MySQL
MySQL is used to store structured and relational application data.

The database contains:
- Users
- Vehicles
- Rides
- Bookings

Database concepts implemented:
- Primary keys and foreign keys.
- Constraints and data integrity.
- Indexes.
- Views.
- Stored procedures and functions.
- Triggers.
- Transactions and rollback.
- SQL joins and aggregate queries.

### MongoDB
MongoDB Atlas is used to store user activity information.

- Database: `campusride`
- Collection: `activities`

Activity records include user ID, activity type, description, metadata and timestamp.

MongoDB aggregation operators used:
- `$match`
- `$facet`
- `$group`
- `$sum`
- `$sort`
- `$project`

## Project Structure

```text
CampusRide/
├── app/
│   ├── admin/
│   │   ├── bookings/
│   │   ├── rides/
│   │   └── users/
│   ├── api/
│   │   ├── admin/
│   │   ├── activity/
│   │   ├── bookings/
│   │   ├── login/
│   │   ├── logout/
│   │   ├── register/
│   │   └── rides/
│   ├── activity/
│   ├── dashboard/
│   ├── bookings/
│   ├── find/
│   ├── login/
│   ├── offer/
│   └── register/
├── lib/
│   ├── db.ts
│   └── mongodb.ts
├── public/
├── CampusRide_Demo.sql
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

*Note: This shows the main project directories and files. Additional routes and components may be present.*

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

Add the required configuration for:
- MySQL database connection.
- MongoDB Atlas connection URI.
- JWT/session secret.

Use `.env.example` as a reference.

**Important:** Never upload `.env.local`, database passwords or secret keys to GitHub.

### 4. Set up the databases

**MySQL**

1. Open MySQL Workbench.
2. Create the database named `campus_mobility`.
3. Set up the required tables and relationships.
4. Use `CampusRide_Demo.sql` to demonstrate the SQL implementation.
5. Configure the MySQL credentials in `.env.local`.

**MongoDB**

1. Create or access a MongoDB Atlas cluster.
2. Configure the MongoDB connection URI.
3. The application uses the `campusride` database and `activities` collection for user activity records.

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

## Testing

The application and database functionality were tested through actual application operations.

Testing included:

- User registration and login.
- Admin and student role-based access.
- Offering and searching for rides.
- Booking and cancellation.
- Automatic seat updates through database triggers.
- MySQL views, stored procedures and functions.
- Transaction and rollback operations.
- MongoDB activity logging.
- Activity History and analytics.
- Admin dashboard access and data retrieval.

## Team Collaboration

This project is developed collaboratively using Git and GitHub.

- **Ramitha Nayak** – MySQL database implementation, including indexing, views, triggers and query optimization, along with assigned application modules.
- **Shreya Hegde** – MongoDB integration, activity history, ride analytics, aggregation pipelines, testing and assigned application modules.

Both team members contribute to the development, integration and testing of CampusRide.

## Future Enhancements

- Real-time ride updates.
- Improved ride recommendations.
- Notifications for booking updates.
- Enhanced analytics and reporting.
- Additional security and testing improvements.

## Project Goal

CampusRide aims to make campus transportation more convenient, affordable and collaborative by connecting students who are travelling in similar directions.

---

**CampusRide – Your Campus, Connected.**
