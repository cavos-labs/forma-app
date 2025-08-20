# CORS Configuration for Forma App

## Development Setup (Localhost)

The forma-app uses Next.js rewrites to proxy API calls to avoid CORS issues during development.

### Current Configuration:

1. **Next.js Proxy** (`next.config.js`):
   - Rewrites `/api/*` to `https://formacr.com/api/*`
   - Adds necessary CORS headers

2. **Environment-based URLs** (`lib/api.ts`):
   - Development: Uses empty string (proxied through Next.js)
   - Production: Uses `NEXT_PUBLIC_API_URL`

## Production CORS (forma-web server)

If you need to configure CORS on the forma-web server for direct client access, add this to forma-web:

### Option 1: Next.js API Route Middleware

Create `forma-web/middleware.ts`:

```typescript
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Handle CORS for API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const response = NextResponse.next()
    
    // Add CORS headers
    response.headers.set('Access-Control-Allow-Origin', '*')
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-api-key')
    
    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 200, headers: response.headers })
    }
    
    return response
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: '/api/:path*'
}
```

### Option 2: Add CORS to individual API routes

In each API route file (e.g., `forma-web/app/api/auth/signin/route.ts`):

```typescript
import { NextRequest, NextResponse } from "next/server";

// Add this function at the top
function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-api-key',
  };
}

// Add this OPTIONS handler
export async function OPTIONS(request: NextRequest) {
  return NextResponse.json({}, { headers: corsHeaders() });
}

// Update existing POST function
export async function POST(request: NextRequest) {
  // ... existing code ...
  
  // Return with CORS headers
  return NextResponse.json(
    { /* response data */ },
    { 
      status: 200,
      headers: corsHeaders()
    }
  );
}
```

## Testing

### Development:
```bash
cd forma-app
npm run dev
# App will use proxy at http://localhost:3000
```

### Production:
Make sure `NEXT_PUBLIC_API_URL` points to the correct forma-web URL.

## Troubleshooting

1. **CORS errors in development**: Restart Next.js dev server after changing `next.config.js`
2. **API key issues**: Check that `NEXT_PUBLIC_API_KEY` matches forma-web's expected key
3. **Production CORS**: Implement one of the server-side solutions above in forma-web