# Nuxt Gemini Chatbot# Nuxt Minimal Starter



A modern chatbot application built with Nuxt.js and Google's Gemini AI. This application features authentication via Logto, real-time chat interactions with Gemini AI, chat history management, and voice input capabilities.Look at the [Nuxt documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.



## Tech Stack## Setup



- **Frontend Framework:** Nuxt.js 3Make sure to install dependencies:

- **UI Framework:** Vue.js 3

- **Styling:** Tailwind CSS```bash

- **Authentication:** Logto# npm

- **Database:** PostgreSQLnpm install

- **ORM:** Prisma

- **AI Integration:** Google Gemini AI# pnpm

- **Voice Processing:** WaveSurfer.jspnpm install

- **TypeScript** for type safety

# yarn

## Prerequisitesyarn install



- Node.js 18 or higher# bun

- PostgreSQL databasebun install

- Logto account and application setup```

- Google Cloud account with Gemini API access

## Development Server

## Getting Started

Start the development server on `http://localhost:3000`:

### 1. Clone the Repository

```bash

```bash# npm

git clone https://github.com/ibnu-sodik/fs-gemini-chat.gitnpm run dev

cd fs-gemini-chat

```# pnpm

pnpm dev

### 2. Install Dependencies

# yarn

```bashyarn dev

npm install

```# bun

bun run dev

### 3. Environment Setup```



1. Copy the example environment file:## Production

```bash

cp .env.example .envBuild the application for production:

```

```bash

2. Fill in your environment variables in `.env`:# npm

```bashnpm run build

DATABASE_URL=your_postgresql_connection_string

GOOGLE_API_KEY=your_google_gemini_api_key# pnpm

NUXT_LOGTO_APP_SECRET=your_logto_app_secretpnpm build

NUXT_LOGTO_COOKIE_ENCRYPTION_KEY=your_logto_cookie_encryption_key

NUXT_LOGTO_ENDPOINT=your_logto_endpoint# yarn

NUXT_LOGTO_APP_ID=your_logto_app_idyarn build

APP_NAME=Nuxt Gemini Chatbot

```# bun

bun run build

### 4. Database Setup```



Run the database migrations:Locally preview production build:



```bash```bash

npx prisma migrate dev# npm

```npm run preview



This will:# pnpm

- Create the database if it doesn't existpnpm preview

- Apply all pending migrations

- Generate the Prisma Client# yarn

yarn preview

### 5. Run the Application

# bun

Start the development server:bun run preview

```

```bash

npm run devCheck out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.

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