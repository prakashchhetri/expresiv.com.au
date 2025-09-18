# API Configuration

This project uses environment variables to configure API endpoints for different environments.

## Environment Variables

### `VITE_API_BASE_URL`

The base URL for the Django API backend.

**Local Development:**
```bash
VITE_API_BASE_URL=http://localhost:8001
```

**Production:**
```bash
VITE_API_BASE_URL=https://serp-analysis.expresiv.com.au
```

## Setup

### 1. Local Development

Create a `.env` file in the project root:

```bash
# .env
VITE_API_BASE_URL=http://localhost:8001
```

### 2. Production

Set the environment variable in your deployment platform:

```bash
VITE_API_BASE_URL=https://serp-analysis.expresiv.com.au
```

## API Endpoints

The configuration automatically generates these endpoints:

- **SERP Competitors**: `{API_BASE_URL}/api/serp-competitors/`
- **SEO Audit**: `{API_BASE_URL}/api/seo-audit/`
- **Competitor Analysis Page**: `{API_BASE_URL}/api/competitor-analysis/{slug}/`
- **Competitor Analysis Pages**: `{API_BASE_URL}/api/competitor-analysis-pages/`

## Usage

Import the configuration in your Astro components:

```typescript
import { config } from '../lib/api-config.ts';

// Use endpoints
const response = await fetch(config.endpoints.serpCompetitors, {
  method: 'POST',
  // ... other options
});
```

## Files Updated

- `src/lib/api-config.ts` - Configuration file
- `src/pages/competitor-analysis.astro` - Main competitor analysis page
- `src/pages/competitor-analysis/[slug].astro` - Dynamic competitor analysis pages
- `src/pages/competitor-analysis-pages.astro` - Pages listing
- `src/pages/seo-audit.astro` - SEO audit page
- `src/pages/sitemap.xml.ts` - Sitemap generation








