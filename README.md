# Simple Token Server

A straightforward solution for securely managing API tokens in frontend JavaScript applications.

## The Problem

Using API tokens directly in frontend JavaScript is problematic because:
1. Tokens stored in client-side code are visible to anyone
2. Compromised tokens can be misused until manually revoked
3. No way to track or limit token usage

## This Solution

This lightweight token server acts as a secure proxy between your frontend and third-party APIs by:

1. Securely storing API tokens server-side
2. Providing temporary access tokens to authenticated clients
3. Managing token revocation and monitoring
4. Tracking token usage and applying rate limits

## Quick Start

1. Clone the repository
2. Install dependencies: `npm install`
3. Start the server: `node index.js`

## API Endpoints

- POST `/register` - Register a new user
- POST `/login` - Login and get a temporary access token
- POST `/revoke-token` - Revoke a specific token
- GET `/verify-token` - Verify if a token is valid

## Security Features

- Tokens are never exposed in frontend code
- All tokens are temporary and automatically expire
- Invalid/revoked tokens are immediately rejected
- Password hashing using bcrypt
- CORS enabled for frontend access
