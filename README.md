# QuizRX Frontend

A modern, responsive web application for AI-powered medical education, built with Next.js and TypeScript.

## 🚀 Overview

QuizRX Frontend is the user interface for the QuizRX platform, providing an intuitive experience for medical professionals and students to interact with AI-generated quizzes and educational content.

## 🛠️ Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 15.x | React framework with SSR/SSG |
| TypeScript | 5.x | Type-safe JavaScript |
| React | 18.x | UI library |
| GraphQL | - | API query language |
| Firebase Auth | - | User authentication |
| Tailwind CSS | 3.x | Utility-first styling |
| pnpm | 10.x | Package manager |

## 📁 Project Structure

```
quizrx-frontend/
├── src/
│   ├── app/                 # Next.js App Router pages
│   │   ├── (auth)/         # Authentication pages
│   │   ├── (dashboard)/    # Dashboard pages
│   │   └── layout.tsx      # Root layout
│   ├── core/               # Core utilities
│   │   ├── configs/        # Configuration files (Firebase, etc.)
│   │   ├── providers/      # React context providers
│   │   ├── hooks/          # Custom React hooks
│   │   └── utils/          # Utility functions
│   └── modules/            # Feature modules
│       ├── quiz/           # Quiz components
│       ├── chat/           # Chat components
│       └── profile/        # User profile components
├── public/                 # Static assets
├── cypress/                # E2E tests
├── package.json
├── next.config.ts
├── tailwind.config.ts
└── tsconfig.json
```

## ⚙️ Prerequisites

- Node.js 18.x or higher
- pnpm 10.x (install with `npm install -g pnpm`)
- Git

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/QuizRx/quizrx-frontend.git
   cd quizrx-frontend
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Edit `.env.local` with your actual values (get from team lead).

4. **Start development server**
   ```bash
   pnpm dev
   ```

5. **Open in browser**
   ```
   http://localhost:3000
   ```

## 📝 Environment Variables

Create a `.env.local` file in the root directory:

```env
# Firebase Configuration (REQUIRED)
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_COGNITIVE_API_URL=http://localhost:8081

# Feature Flags (optional)
NEXT_PUBLIC_ENABLE_AVATAR=false
NEXT_PUBLIC_ENABLE_VOICE=false
```

> ⚠️ **Never commit `.env.local` to version control!**

## 🧪 Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Build for production |
| `pnpm start` | Start production server |
| `pnpm lint` | Run ESLint |
| `pnpm lint:fix` | Fix ESLint errors |
| `pnpm test` | Run unit tests |
| `pnpm test:e2e` | Run Cypress E2E tests |
| `pnpm type-check` | Run TypeScript type checking |

## 🏗️ Building for Production

```bash
# Build the application
pnpm build

# Start production server
pnpm start
```

## 🐳 Docker

```bash
# Build Docker image
docker build -t quizrx-frontend .

# Run container
docker run -p 3000:3000 quizrx-frontend
```

## 🔗 Related Services

| Service | Repository | Local URL |
|---------|------------|-----------|
| Backend API | [quizrx-backend-api](https://github.com/QuizRx/quizrx-backend-api) | http://localhost:3001 |
| Cognitive Service | [quizrx-cognitive-service](https://github.com/QuizRx/quizrx-cognitive-service) | http://localhost:8081 |
| Infrastructure | [quizrx-infra](https://github.com/QuizRx/quizrx-infra) | - |

## 🤝 Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## 📄 License

This project is proprietary software. All rights reserved.

## 📞 Support

- **Product Owner**: Dr. Ramy Alnahhal
- **Application**: https://quizrx.ai/
- **GitHub**: https://github.com/QuizRx
