# Google OAuth 2.0 Setup Guide

## Required Environment Variables

### Server (.env in server directory)

Add these variables to your `server/.env` file:

```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# Session Secret (required for passport sessions)
SESSION_SECRET=your_super_secret_session_key_change_in_production

# Existing variables (make sure these are set)
CLIENT_URL=http://localhost:3000
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=7d
MONGODB_URI=mongodb://localhost:27017/filesharing
```

### Client (No additional env variables needed)

The client uses the same base URL configuration as before.

## Google Cloud Console Setup

### 1. Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API (or Google People API)

### 2. Configure OAuth Consent Screen

1. Go to "APIs & Services" > "OAuth consent screen"
2. Choose "External" user type
3. Fill in the required information:
   - App name: FileShare
   - User support email: your email
   - Developer contact information: your email
4. Add scopes: `email`, `profile`
5. Add test users (for development)

### 3. Create OAuth 2.0 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client IDs"
3. Choose "Web application"
4. Configure:
   - Name: FileShare Web Client
   - Authorized JavaScript origins: 
     - `http://localhost:3000` (development)
     - `https://yourdomain.com` (production)
   - Authorized redirect URIs:
     - `http://localhost:5000/api/auth/google/callback` (development)
     - `https://yourapi.com/api/auth/google/callback` (production)

### 4. Copy Credentials

1. Copy the Client ID and Client Secret
2. Add them to your `server/.env` file

## Production Configuration

### Environment Variables for Production

```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_production_google_client_id
GOOGLE_CLIENT_SECRET=your_production_google_client_secret

# Session Secret (use a strong random string)
SESSION_SECRET=your_super_strong_production_session_secret_at_least_32_chars

# Production URLs
CLIENT_URL=https://yourdomain.com
```

### Update OAuth Redirect URIs

Make sure to add your production URLs to the Google Cloud Console:
- Authorized JavaScript origins: `https://yourdomain.com`
- Authorized redirect URIs: `https://yourapi.com/api/auth/google/callback`

## Testing the Implementation

### 1. Start the servers

```bash
# Terminal 1 - Server
cd server
npm run dev

# Terminal 2 - Client  
cd client
npm run dev
```

### 2. Test OAuth Flow

1. Go to `http://localhost:3000/login`
2. Click "Continue with Google"
3. Complete Google OAuth flow
4. Should redirect to `/oauth-success` then to `/folders`
5. User should be logged in with Google account data

### 3. Verify Database

Check your MongoDB to see the user was created with:
- `googleId` field populated
- `isEmailVerified: true`
- `avatar` field with Google profile picture
- No `password` field (or null)

## Security Considerations

1. **Environment Variables**: Never commit `.env` files to version control
2. **Session Secret**: Use a strong, random session secret in production
3. **HTTPS**: Always use HTTPS in production for OAuth callbacks
4. **Domain Verification**: Verify your domain in Google Cloud Console for production

## Troubleshooting

### Common Issues

1. **"redirect_uri_mismatch"**: Check that your redirect URI in Google Console matches exactly
2. **"invalid_client"**: Verify your Client ID and Secret are correct
3. **Session errors**: Make sure SESSION_SECRET is set
4. **CORS errors**: Ensure CLIENT_URL is set correctly

### Debug Mode

Add this to your server for debugging:

```javascript
// In server/index.js (temporary for debugging)
app.use((req, res, next) => {
  console.log('Request URL:', req.url);
  console.log('Request Method:', req.method);
  next();
});
```

## Features Implemented

✅ **Database Updates**: User model supports Google OAuth fields  
✅ **Passport Configuration**: Google OAuth strategy implemented  
✅ **API Routes**: `/api/auth/google` and `/api/auth/google/callback`  
✅ **Frontend Components**: Google login buttons on Login and Register pages  
✅ **OAuth Success Handler**: Handles token extraction and user login  
✅ **Account Linking**: Links existing email accounts with Google OAuth  
✅ **Parallel Authentication**: Works alongside existing email/password login  

## User Experience Flow

1. **New User**: Click Google button → OAuth → Account created → Logged in
2. **Existing User**: Click Google button → OAuth → Account linked → Logged in  
3. **Regular Login**: Still works as before with email/password
4. **Mixed Usage**: Users can use either method to log in to the same account