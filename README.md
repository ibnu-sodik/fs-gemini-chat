# Nuxt Gemini Chatbot

A modern chatbot application built with Nuxt.js and Google's Gemini AI. This application features authentication via Logto, real-time chat interactions with Gemini AI, chat history management, and voice input capabilities.

## Tech Stack

- **Frontend Framework:** Nuxt.js 3
- **UI Framework:** Vue.js 3
- **Styling:** Tailwind CSS
- **Authentication:** Logto
- **Database:** PostgreSQL
- **ORM:** Prisma
- **AI Integration:** Google Gemini AI
- **Voice Processing:** WaveSurfer.js
- **TypeScript** for type safety

## Prerequisites

- Node.js 18 or higher
- PostgreSQL database
- Logto account and application setup
- Google Cloud account with Gemini API access

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/ibnu-sodik/fs-gemini-chat.git
cd fs-gemini-chat
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

1. Copy the example environment file:

```bash
cp .env.example .env
```

2. Fill in your environment variables in `.env`:

```bash
DATABASE_URL=your_postgresql_connection_string
GOOGLE_API_KEY=your_google_gemini_api_key
NUXT_LOGTO_APP_SECRET=your_logto_app_secret
NUXT_LOGTO_COOKIE_ENCRYPTION_KEY=your_logto_cookie_encryption_key
NUXT_LOGTO_ENDPOINT=your_logto_endpoint
NUXT_LOGTO_APP_ID=your_logto_app_id
APP_NAME=Nuxt Gemini Chatbot
```

### 4. Database Setup

Run the database migrations:

```bash
npx prisma migrate dev
```

This will:

- Create the database if it doesn't exist
- Apply all pending migrations
- Generate the Prisma Client

### 5. Run the Application

Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Features

- 🔐 Secure authentication with Logto
- 💬 Real-time chat with Google's Gemini AI
- 🎙️ Voice input support
- 📝 Chat history management
- 🎨 Modern UI with Tailwind CSS
- 📱 Responsive design
- 🔄 Session management

## Development Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run generate` - Generate static site
- `npm run preview` - Preview production build

## Database Management

- Generate Prisma Client: `npx prisma generate`
- Create Migration: `npx prisma migrate dev`
- Reset Database: `npx prisma migrate reset`
- View Database: `npx prisma studio`

## Contributing

Feel free to contribute to this project by creating issues or pull requests.

## License

This project is licensed under the MIT License.
