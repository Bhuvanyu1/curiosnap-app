# CurioSnap - Discover Amazing Facts Through Photos

CurioSnap is an AI-powered mobile-first web application that transforms everyday photos into fascinating learning experiences. Simply snap a photo of anything around you, and our advanced AI will analyze it to provide surprising, educational facts.

## Features

### Core Functionality
- **Smart Image Analysis**: AI-powered fact generation using Google Gemini
- **User Authentication**: Secure login and user management
- **Discovery History**: Personal collection of discovered facts
- **Streak Tracking**: Daily discovery streaks and achievements
- **Social Sharing**: Share discoveries across platforms

### User Experience
- **Mobile-First Design**: Optimized for smartphone usage
- **Offline Support**: Cache discoveries for offline viewing
- **Real-time Camera**: Direct photo capture with permissions
- **Category Filtering**: Organize facts by science, history, nature, etc.
- **Search Functionality**: Find specific discoveries quickly

### Gamification
- **Achievement System**: Unlock badges for milestones
- **Streak Counter**: Track consecutive discovery days
- **Statistics Dashboard**: Personal discovery analytics
- **Interest Profiling**: Learn about user preferences

## Technology Stack

### Backend (Encore.dev)
- **Framework**: Encore.dev with TypeScript
- **Database**: PostgreSQL with migrations
- **AI Integration**: Google Gemini API
- **Authentication**: Token-based auth system
- **API Design**: RESTful endpoints with type safety

### Frontend (React + Vite)
- **Framework**: React 19 with TypeScript
- **Styling**: Tailwind CSS + Radix UI components
- **State Management**: React Context + TanStack Query
- **Routing**: React Router DOM
- **Build Tool**: Vite for fast development

### Key Dependencies
```json
{
  "backend": {
    "encore.dev": "^1.48.8",
    "@google/generative-ai": "^0.24.1",
    "typescript": "^5.8.3"
  },
  "frontend": {
    "react": "^19.1.0",
    "tailwindcss": "^4.1.11",
    "@tanstack/react-query": "^5.81.5",
    "react-router-dom": "^7.6.3",
    "lucide-react": "^0.484.0"
  }
}
```

## Getting Started

### Prerequisites
- Node.js 18+ and npm/bun
- Encore CLI installed
- Google Cloud account for Gemini API
- PostgreSQL database (managed by Encore)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/curiosnap-app.git
   cd curiosnap-app
   ```

2. **Install Encore CLI**
   ```bash
   # macOS
   brew install encoredev/tap/encore
   
   # Linux
   curl -L https://encore.dev/install.sh | bash
   
   # Windows
   iwr https://encore.dev/install.ps1 | iex
   ```

3. **Install dependencies**
   ```bash
   # Install bun if not already installed
   npm install -g bun
   
   # Install project dependencies
   bun install
   ```

4. **Set up environment variables**
   ```bash
   # Backend secrets (managed by Encore)
   encore secret set --type dev GeminiApiKey "your-gemini-api-key"
   ```

5. **Run database migrations**
   ```bash
   cd backend
   encore run
   # Migrations run automatically on startup
   ```

6. **Start development servers**
   ```bash
   # Terminal 1: Backend
   cd backend
   encore run
   
   # Terminal 2: Frontend
   cd frontend
   npm run dev
   ```

### API Configuration

#### Google Gemini Setup
1. Create a Google Cloud Project
2. Enable the Vertex AI API
3. Generate an API key
4. Set the secret: `encore secret set GeminiApiKey "your-key"`

#### Environment Variables
```bash
# Production deployment
APP_URL=https://your-domain.com
```

## API Documentation

### Authentication Endpoints
- `POST /auth/login` - Login or register user
- `GET /auth/profile` - Get current user profile
- `PUT /auth/profile` - Update user profile

### Discovery Endpoints
- `POST /analyze` - Analyze uploaded image
- `POST /save` - Save discovery to user collection
- `GET /discoveries` - List user discoveries with pagination
- `POST /share` - Generate shareable content

### Database Schema

#### Users Table
```sql
CREATE TABLE users (
  id BIGSERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(50) UNIQUE NOT NULL,
  avatar TEXT,
  interests TEXT[],
  streak_count INTEGER DEFAULT 0,
  total_facts INTEGER DEFAULT 0,
  is_premium BOOLEAN DEFAULT FALSE,
  last_activity_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Discoveries Table
```sql
CREATE TABLE discoveries (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id),
  image_data TEXT NOT NULL,
  fact TEXT NOT NULL,
  category TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Deployment

### Encore Cloud Platform

1. **Authenticate with Encore**
   ```bash
   encore auth login
   ```

2. **Deploy to staging**
   ```bash
   git add -A .
   git commit -m "Deploy to staging"
   git push encore
   ```

3. **Monitor deployment**
   Visit [Encore Cloud Dashboard](https://app.encore.dev/curiosnap-app-o9m2/deploys)

### Production Deployment

1. **Connect GitHub repository**
   - Link your GitHub account in Encore Cloud
   - Enable automatic deployments

2. **Set production secrets**
   ```bash
   encore secret set --env prod GeminiApiKey "production-api-key"
   ```

3. **Deploy via GitHub**
   ```bash
   git push origin main
   ```

### Self-Hosting with Docker

```bash
# Build Docker image
encore build docker --output curiosnap-app

# Run with Docker Compose
docker-compose up -d
```

## Development Workflow

### Code Structure
```
curiosnap-app/
├── backend/
│   ├── auth/           # Authentication service
│   ├── discovery/      # Core discovery logic
│   │   ├── migrations/ # Database migrations
│   │   ├── analyze.ts  # AI image analysis
│   │   ├── save.ts     # Save discoveries
│   │   ├── list.ts     # List user discoveries
│   │   └── share.ts    # Social sharing
│   └── encore.app      # Encore configuration
├── frontend/
│   ├── components/     # Reusable UI components
│   ├── contexts/       # React contexts
│   ├── lib/           # Utility functions
│   ├── pages/         # Route components
│   └── App.tsx        # Main application
└── package.json       # Workspace configuration
```

### Testing
```bash
# Backend tests
cd backend
encore test

# Frontend tests
cd frontend
npm test

# E2E tests
npm run test:e2e
```

### Code Quality
- TypeScript for type safety
- ESLint for code linting
- Prettier for code formatting
- Husky for pre-commit hooks

## Performance Optimizations

### Frontend
- Image compression and optimization
- Lazy loading for discovery history
- Service worker for offline caching
- Bundle splitting with Vite

### Backend
- Database indexing for queries
- API response caching
- Image processing optimization
- Rate limiting for API endpoints

## Security Considerations

- Secure token-based authentication
- Input validation and sanitization
- SQL injection prevention
- CORS configuration
- Rate limiting on sensitive endpoints
- Secure secret management with Encore

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
- GitHub Issues: [Repository Issues](https://github.com/your-username/curiosnap-app/issues)
- Documentation: [Encore.dev Docs](https://encore.dev/docs)
- Community: [Encore Discord](https://discord.gg/encore-dev)
