# TeamGG - Gaming Team Finder

TeamGG is a modern web application that helps gamers find teammates for their favorite games. Whether you're looking for a competitive team or just some casual players to game with, TeamGG connects you with like-minded gamers.

## Features

- 🔐 Secure authentication with NextAuth
- 🎮 Browse and search for games
- 👥 Create and manage team applications
- 💬 Real-time chat and notifications
- 📱 Responsive design for all devices

## Tech Stack

- **Frontend**: Next.js 14 with React 19
- **Backend**: Next.js API Routes
- **Database**: MongoDB with Prisma ORM
- **Authentication**: NextAuth.js
- **Styling**: CSS Modules
- **Type Safety**: TypeScript
- **State Management**: React Context

## Getting Started

### Prerequisites

- Node.js 18.0.0 or later
- MongoDB database
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Volodymyr-Bauzi/teamggv2.git
   cd teamggv2
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn
   ```

3. Set up environment variables:
   - Copy `.env.example` to `.env.local`
   - Update the environment variables with your configuration

4. Set up the database:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```
DATABASE_URL="mongodb://your-mongodb-connection-string"
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000
```

## Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the application for production
- `npm start` - Start the production server
- `npm run lint` - Run ESLint

## Project Structure

```
/
├── app/                    # App router pages and routes
├── components/             # Reusable UI components
├── lib/                    # Utility functions and configurations
├── prisma/                 # Prisma schema and migrations
├── public/                 # Static files
└── styles/                 # Global styles and CSS modules
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
