# QuizRX - Complete Setup Guide for New Developers

## Overview

QuizRX is a medical AI tutoring platform with 3 services:

| Service | Port | Description |
|---------|------|-------------|
| Frontend | 3000 | Next.js web app |
| Backend API | 3001 | NestJS REST/GraphQL API |
| Cognitive Service | 8081 | Python AI/LLM service |

## Prerequisites

### Required Software

1. **Node.js** (v18+)
```bash
   # Check version
   node --version
   
   # Install via nvm (recommended)
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
   nvm install 18
   nvm use 18
```

2. **Python** (3.10+)
```bash
   # Check version
   python3 --version
   
   # Install on Ubuntu
   sudo apt install python3 python3-pip python3-venv
```

3. **pnpm** (for frontend)
```bash
   npm install -g pnpm
```

4. **Docker** (for MongoDB)
```bash
   # Install Docker
   sudo apt install docker.io docker-compose
   sudo usermod -aG docker $USER
   # Log out and back in
```

---

## Step 1: Clone All Repositories
```bash
mkdir ~/QuizRx && cd ~/QuizRx

git clone https://github.com/QuizRx/quizrx-frontend.git
git clone https://github.com/QuizRx/quizrx-backend-api.git
git clone https://github.com/QuizRx/quizrx-cognitive-service.git
```

---

## Step 2: Get API Keys (All FREE!)

### 2.1 Groq API (Required - FREE LLM)
1. Go to https://console.groq.com/
2. Sign up with Google/GitHub
3. Click "API Keys" → "Create API Key"
4. Copy the key: `gsk_xxxxxxxxxxxx`

### 2.2 Pinecone (Required - Vector Database)
1. Go to https://app.pinecone.io/
2. Sign up (free tier: 1 index, 100K vectors)
3. Create an index:
   - Name: `main-index`
   - Dimensions: `1536`
   - Metric: `cosine`
   - Region: `us-east-1`
4. Go to "API Keys" → Copy your key

### 2.3 Firebase (Required - Authentication)
1. Go to https://console.firebase.google.com/
2. Create a new project (name: `quizrx-dev`)
3. Enable Authentication:
   - Click "Authentication" → "Get Started"
   - Enable "Email/Password" provider
   - Enable "Google" provider
4. Get Web Config:
   - Click gear icon → "Project Settings"
   - Scroll to "Your apps" → Click web icon
   - Register app, copy the config values
5. Get Admin SDK (for backend):
   - "Project Settings" → "Service Accounts"
   - Click "Generate new private key"
   - Save the JSON file

---

## Step 3: Start MongoDB
```bash
mkdir -p ~/mongodb-data

docker run -d \
  --name mongodb \
  -p 27017:27017 \
  -v ~/mongodb-data:/data/db \
  mongo:latest

# Verify
docker ps | grep mongodb
```

---

## Step 4: Setup Each Service

### 4.1 Cognitive Service
```bash
cd ~/QuizRx/quizrx-cognitive-service
python3 -m venv QuizRx
source QuizRx/bin/activate
pip install -r requirements.txt
pip install langchain-groq
cp .env.example .env
# Edit .env with your GROQ_API_KEY and PINECONE_API_KEY
```

### 4.2 Backend API
```bash
cd ~/QuizRx/quizrx-backend-api
npm install
cp .env.example .env
# Edit .env with your Firebase credentials
```

### 4.3 Frontend
```bash
cd ~/QuizRx/quizrx-frontend
pnpm install
cp .env.example .env.local
# Edit .env.local with your Firebase web config
```

---

## Step 5: Run All Services (3 Terminals)

**Terminal 1 - Cognitive Service:**
```bash
cd ~/QuizRx/quizrx-cognitive-service
source QuizRx/bin/activate
python main.py
```

**Terminal 2 - Backend:**
```bash
cd ~/QuizRx/quizrx-backend-api
npx ts-node -r tsconfig-paths/register --transpile-only src/main.ts
```

**Terminal 3 - Frontend:**
```bash
cd ~/QuizRx/quizrx-frontend
pnpm run dev
```

**Open:** http://localhost:3000

---

## Step 6: Create Account & Activate

1. Sign up at http://localhost:3000
2. Activate subscription in MongoDB:
```bash
docker exec -it mongodb mongosh
use quizrx
db.users.find({email: "your-email@example.com"})
# Copy the _id value

db.usersubscriptions.insertOne({
  userId: 'YOUR_USER_ID',
  planType: 'FREE_TRIAL',
  status: 'ACTIVE',
  startDate: new Date(),
  endDate: new Date(Date.now() + 30*24*60*60*1000),
  createdAt: new Date(),
  updatedAt: new Date()
});
exit
```

---

## Architecture
```
Frontend (3000) → Backend (3001) → Cognitive Service (8081)
     ↓                 ↓                    ↓
  Firebase         MongoDB              Pinecone + Groq
```

## Cost: $0/month (All Free Tiers)
