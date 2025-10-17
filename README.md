# Anstruct AI Proxy

Secure Cloudflare Workers proxy for Gemini AI API. This proxy protects your API key and provides rate limiting, CORS support, and error handling.

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- Cloudflare account (free tier works)
- Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)

### Installation

```bash
# 1. Install dependencies
npm install

# 2. Install Wrangler CLI globally
npm install -g wrangler

# 3. Login to Cloudflare
wrangler login
```

### Setup Gemini API Key (CRITICAL)

**Never commit API keys to Git!** Use Wrangler secrets:

```bash
# For production
wrangler secret put GEMINI_API_KEY
# Then paste your Gemini API key when prompted

# For development environment
wrangler secret put GEMINI_API_KEY --env dev

# For staging environment
wrangler secret put GEMINI_API_KEY --env staging
```

### Local Development

```bash
# Option 1: Using .dev.vars (local only, not committed)
echo 'GEMINI_API_KEY=your_key_here' > .dev.vars
wrangler dev

# Option 2: Using secrets (recommended)
wrangler secret put GEMINI_API_KEY --env dev
wrangler dev --env dev
```

### Deployment

```bash
# Deploy to production
npm run deploy
# or
wrangler deploy

# Deploy to staging
wrangler deploy --env staging

# Deploy using script
chmod +x deploy.sh
./deploy.sh production
```

## Security Best Practices

### DO:

- Use `wrangler secret put` for API keys
- Keep `.dev.vars` in `.gitignore`
- Use different keys for dev/staging/prod
- Monitor usage in Cloudflare dashboard
- Set up rate limiting (paid plan)

### DON'T:

- Commit API keys to Git
- Put keys in `wrangler.jsonc`
- Share keys in documentation
- Log keys to console
- Expose keys in error messages

## API Usage

### Endpoint

```
POST https://anstruct-ai-proxy.anstruct.workers.dev
```

### Request

```bash
curl -X POST "https://anstruct-ai-proxy.anstruct.workers.dev" \
  -H "Content-Type: application/json" \
  -d '{"prompt":"Create a Go project structure with REST API"}'
```

### Response

```json
{
  "blueprint": "myproject/\n\tsrc/\n\t\tmain.go\n\t..."
}
```

### Error Response

```json
{
  "error": "Error description",
  "status": 400
}
```

## Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

## Configuration

### Environment Variables

Set in `wrangler.jsonc`:

```json
{
  "vars": {
    "ENVIRONMENT": "production",
    "MAX_PROMPT_LENGTH": 10000
  }
}
```

### Secrets (Sensitive Data)

Set via CLI only:

```bash
wrangler secret put GEMINI_API_KEY
wrangler secret put OTHER_SECRET_KEY
```

### List Secrets

```bash
wrangler secret list
wrangler secret list --env dev
```

### Delete Secrets

```bash
wrangler secret delete GEMINI_API_KEY
```

## Monitoring

### View Logs

```bash
# Tail logs in real-time
wrangler tail

# Filter by status code
wrangler tail --status error

# Filter by method
wrangler tail --method POST
```

### Cloudflare Dashboard

View analytics at:
https://dash.cloudflare.com → Workers & Pages → anstruct-ai-proxy

## Multiple Environments

### Setup Environments

```bash
# Development
wrangler secret put GEMINI_API_KEY --env dev
wrangler deploy --env dev

# Staging
wrangler secret put GEMINI_API_KEY --env staging
wrangler deploy --env staging

# Production
wrangler secret put GEMINI_API_KEY
wrangler deploy
```

### URLs

- **Production**: `https://anstruct-ai-proxy.anstruct.workers.dev`
- **Staging**: `https://staging.anstruct-ai-proxy.anstruct.workers.dev`
- **Dev**: `https://dev.anstruct-ai-proxy.anstruct.workers.dev`

## Troubleshooting

### Error: "GEMINI_API_KEY not configured"

```bash
# Set the secret
wrangler secret put GEMINI_API_KEY

# Verify deployment
wrangler deployments list
```

### Error: "Not logged in"

```bash
wrangler login
```

### Error: "Account not found"

Make sure you're logged in to the correct Cloudflare account:

```bash
wrangler whoami
```

### Testing Locally

```bash
# Create .dev.vars (not committed)
echo 'GEMINI_API_KEY=your_key' > .dev.vars

# Start dev server
wrangler dev

# Test
curl -X POST http://localhost:8787 \
  -H "Content-Type: application/json" \
  -d '{"prompt":"test"}'
```

## Links

- **Cloudflare Workers**: https://workers.cloudflare.com
- **Wrangler Docs**: https://developers.cloudflare.com/workers/wrangler/
- **Gemini API**: https://ai.google.dev
- **Anstruct CLI**: https://github.com/alberdjuniawan/anstruct

---

**Security Notice**: This proxy is for development use. For production, consider:

- Rate limiting (Cloudflare paid plans)
- Request validation
- IP whitelisting
- Custom domain with SSL
- Monitoring and alerting
- DDoS protection

Made for [Anstruct](https://github.com/alberdjuniawan/anstruct)