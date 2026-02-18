# QuizRX Frontend

Next.js 15 medical education platform - AI-powered quizzes, Q&A, and PubMed citations for endocrinology.

**Version:** v11.3 | **Status:** Production Ready 🚀

## Features

- 🎓 **Quiz Interface** - Multiple choice questions with explanations
- 💬 **Chat Q&A** - Real-time streaming medical Q&A
- 📚 **PubMed Citations** - Display and fetch research citations
- 🔘 **Get PubMed Sources Button** - Fetch citations for Pinecone responses (v11.3)
- 🎭 **AI Avatar** - HeyGen streaming avatar for explanations
- 📊 **Performance Tracking** - Quiz history and analytics
- 💳 **Subscriptions** - Stripe payment integration

---

## Quick Start

```bash
# Install dependencies
pnpm install

# Setup environment
cp .env.example .env.local
# Edit .env.local with your API keys

# Run development server
pnpm dev
# Server runs on http://localhost:3000
```

---

## Prerequisites

| Requirement | Version | Purpose |
|-------------|---------|---------|
| Node.js | v18.x+ | Runtime |
| pnpm | v8.x+ | Package manager |
| Docker | Latest | Containerization |
| gcloud CLI | Latest | Cloud Run deployment |

```bash
# Install pnpm globally
npm install -g pnpm

# Verify versions
node --version   # v18.x+
pnpm --version   # v8.x+
```

---

## Environment Variables

### Development (`.env.local`)

```env
# Backend API
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_GRAPHQL_URL=http://localhost:3001/graphql

# Firebase Authentication
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Stripe (optional)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx

# HeyGen Avatar (optional)
NEXT_PUBLIC_HEYGEN_API_KEY=your_heygen_key
```

### Production (`.env.production`)

```env
NEXT_PUBLIC_API_URL=https://quizrx-platform-backend-356295304767.us-central1.run.app
NEXT_PUBLIC_GRAPHQL_URL=https://quizrx-platform-backend-356295304767.us-central1.run.app/graphql
```

---

## Get PubMed Sources Button (v11.3)

A button that allows users to fetch PubMed citations for responses that don't have them.

### Behavior

| Response Type | Data Source | Citations | Button |
|---------------|-------------|-----------|--------|
| Q&A | Pinecone | `[]` | ✅ Show |
| Q&A | PubMed | `[...]` | ❌ Hide |
| Quiz | Pinecone | `[]` | ✅ Show |
| Quiz | PubMed | `[...]` | ❌ Hide |
| Follow-up | Context | `[]` | ✅ Show |
| Follow-up | PubMed | `[...]` | ❌ Hide |

### Implementation

**File:** `src/modules/chat/layouts/chat/chat.tsx`

```tsx
{(!message.citations || message.citations.length === 0) && (
  <button
    onClick={() => handleSubmit("give me sources for this")}
    className="flex items-center gap-1 text-primary hover:text-primary/80 
               transition-colors p-1.5 sm:p-2 border border-primary 
               rounded-md text-xs sm:text-sm"
    title="Get PubMed citations for this response"
  >
    <Search size={14} />
    <span>Get PubMed Sources</span>
  </button>
)}
```

### ⚠️ Important: Two Render Functions

The button must be in **BOTH** render functions:

| Function | Line | Used When |
|----------|------|-----------|
| `renderAllMessages()` | ~269 | Fresh/new chats |
| `renderReviewConceptContent()` | ~440 | Existing chats, Review mode |

---

## Project Structure

```
quizrx-frontend/
├── src/
│   ├── app/
│   │   ├── (core)/                    # Protected routes (dashboard)
│   │   ├── (landing)/                 # Public landing pages
│   │   ├── api/                       # API routes
│   │   ├── layout.tsx                 # Root layout
│   │   ├── providers.tsx              # App providers
│   │   └── globals.css                # Global styles
│   │
│   ├── modules/
│   │   ├── chat/                      # 💬 Chat & Q&A module
│   │   │   ├── layouts/
│   │   │   │   └── chat/
│   │   │   │       ├── chat.tsx       # ⭐ Main chat + PubMed button
│   │   │   │       ├── quiz-accordion.tsx
│   │   │   │       └── question-accoridion.tsx
│   │   │   ├── store/
│   │   │   │   └── chat-store.ts      # Zustand state
│   │   │   ├── types/
│   │   │   │   └── api/
│   │   │   │       └── messages.ts    # Message types
│   │   │   └── apollo/                # GraphQL queries
│   │   │
│   │   ├── avatars/                   # 🎭 HeyGen Avatar
│   │   ├── concepts/                  # 📚 Medical concepts
│   │   ├── graph/                     # 📊 Knowledge graphs
│   │   ├── landing/                   # 🏠 Landing pages
│   │   └── subscription/              # 💳 Stripe payments
│   │
│   └── components/                    # Shared UI components
│
├── .env.local                         # Development env
├── .env.production                    # Production env
├── Dockerfile
├── package.json
└── pnpm-lock.yaml
```

---

## Development

### Available Scripts

```bash
# Install dependencies
pnpm install

# Run development server (http://localhost:3000)
pnpm dev

# Build for production
pnpm build

# Start production server locally
pnpm start

# Lint code
pnpm lint

# Type check
pnpm type-check
```

### Run Full Stack Locally

```bash
# Terminal 1: Frontend
cd quizrx-frontend
pnpm dev

# Terminal 2: Backend API (NestJS)
cd quizrx-backend-api
pnpm start:dev

# Terminal 3: Cognitive Service (Python)
cd quizrx-cognitive-service
source QuizRx/bin/activate
python main.py
```

---

## Docker Deployment

### Build & Run Locally

```bash
# Build
docker build -t quizrx-frontend:local .

# Run
docker run -p 3000:8080 quizrx-frontend:local

# Access at http://localhost:3000
```

### Deploy to Google Cloud Run

**⚠️ CRITICAL: Deploy to `quizrx-platform-frontend`, NOT `quizrx-frontend`!**

```bash
# Build
docker build --no-cache -t gcr.io/quizrx-prod/quizrx-frontend:v11.3 .

# Push to GCR
docker push gcr.io/quizrx-prod/quizrx-frontend:v11.3

# Deploy to CORRECT service
gcloud run deploy quizrx-platform-frontend \
  --image=gcr.io/quizrx-prod/quizrx-frontend:v11.3 \
  --region=us-central1 \
  --project=quizrx-prod \
  --allow-unauthenticated
```

### Verify Deployment

```bash
# Check deployed revision
gcloud run services describe quizrx-platform-frontend \
  --region=us-central1 \
  --project=quizrx-prod \
  --format="value(status.latestReadyRevisionName)"

# Check deployed image
gcloud run services describe quizrx-platform-frontend \
  --region=us-central1 \
  --project=quizrx-prod \
  --format="value(spec.template.spec.containers[0].image)"

# List all services
gcloud run services list --region=us-central1 --project=quizrx-prod
```

### Production URL

```
https://quizrx-platform-frontend-356295304767.us-central1.run.app
```

---

## Message Types

```typescript
enum MessageType {
  FORM_TOPIC = "FORM_TOPIC",
  QUIZ = "QUIZ",
  ANSWER = "ANSWER",
  QUERY = "QUERY",
}

enum SenderType {
  USER = "USER",
  AI = "AI",
}
```

---

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 15.2.4 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS 4.0 |
| State | Zustand |
| API | GraphQL + Apollo Client |
| Auth | Firebase Auth |
| Payments | Stripe |
| UI | Radix UI, shadcn/ui |
| Avatar | HeyGen Streaming Avatar |

### Key Dependencies

| Package | Purpose |
|---------|---------|
| `@apollo/client` | GraphQL client |
| `@microsoft/fetch-event-source` | SSE streaming |
| `@heygen/streaming-avatar` | AI avatar |
| `@stripe/react-stripe-js` | Payments |
| `@radix-ui/*` | UI primitives |
| `zustand` | State management |

---

## Testing

### Verify Button in Code

```bash
# Should return 4 lines (2 comments + 2 buttons)
grep -n "Get PubMed Sources" src/modules/chat/layouts/chat/chat.tsx
```

### Browser Console Check

```javascript
// Should return true
document.body.innerHTML.includes("Get PubMed Sources")
```

### Manual Test Flow

1. **New Chat** → Type `what is DKA`
2. **Wait for response** (Pinecone)
3. **Button should show** ✅
4. **Click button** → "give me sources for this"
5. **Wait for response** (PubMed with citations)
6. **Button should hide** ❌

---

## Troubleshooting

### Button Not Appearing

1. **Check both render functions:**
   ```bash
   grep -n "Get PubMed Sources" src/modules/chat/layouts/chat/chat.tsx
   # Should return 4 lines
   ```

2. **Verify correct service deployed:**
   ```bash
   # You should access:
   https://quizrx-platform-frontend-356295304767.us-central1.run.app
   
   # NOT:
   https://quizrx-frontend-356295304767.us-central1.run.app
   ```

3. **Clear browser cache:** `Ctrl + Shift + R` or use Incognito

4. **Force new build:**
   ```bash
   docker rmi gcr.io/quizrx-prod/quizrx-frontend:v11.3
   docker build --no-cache -t gcr.io/quizrx-prod/quizrx-frontend:v11.3 .
   ```

### Wrong Service Deployed

There are TWO frontend services:
- `quizrx-frontend` ❌ (old/unused)
- `quizrx-platform-frontend` ✅ (production)

Always deploy to `quizrx-platform-frontend`!

```bash
gcloud run services list --region=us-central1 --project=quizrx-prod
```

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| **v11.3** | 2026-02-15 | Added "Get PubMed Sources" button to both render functions |
| **v11.2** | 2026-02-12 | Pinecone metadata display fix |
| **v11.1** | 2026-01-27 | Streaming fixes, follow-up routing |
| **v11.0** | 2026-01-22 | Initial v11 release |

---

## Related Services

| Service | Tech | Cloud Run Service Name | Purpose |
|---------|------|------------------------|---------|
| Frontend | Next.js 15 | `quizrx-platform-frontend` | Web UI |
| Backend | NestJS | `quizrx-platform-backend` | GraphQL API, MongoDB |
| Cognitive | Python/FastAPI | `quizrx-cognitive-service` | AI agents, Pinecone |

---

## License

Proprietary - QuizRx

---

*Last Updated: February 15, 2026 (v11.3) - Production Ready 🚀*
