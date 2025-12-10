# Admin Authentication System

This document describes the custom database authentication system used for the admin dashboard.

## Overview

The admin authentication system is completely self-contained in the database and does not require access to Supabase Auth dashboard. This allows the client to manage the application without needing Supabase dashboard access.

## Default Credentials

```
Email: marius@hairhypejunior.lt
Password: KietasBarberis1,1
```

## How It Works

### 1. Database Tables

#### `admin_users`
Stores admin user accounts with bcrypt-hashed passwords:
```sql
id uuid PRIMARY KEY
email text UNIQUE
password_hash text (bcrypt)
full_name text
is_active boolean
```

#### `admin_sessions`
Stores active login sessions:
```sql
id uuid PRIMARY KEY
user_id uuid (references admin_users)
token text UNIQUE (64-char hex)
expires_at timestamptz (24 hours)
```

#### `login_attempts`
Tracks login attempts for rate limiting:
```sql
id uuid PRIMARY KEY
email text
attempt_time timestamptz
success boolean
ip_address text
```

### 2. Authentication Functions

#### `admin_login(p_email, p_password)`
Handles login with these steps:
1. Checks rate limiting (5 failed attempts = 1 minute block)
2. Verifies email and password against `admin_users`
3. Checks if account is active
4. Records login attempt (success or failure)
5. Generates secure session token
6. Creates session with 24-hour expiry
7. Returns session info (token, user_id, email, expires_at)

**Rate Limiting Logic:**
- Counts failed attempts in the last 1 minute
- If 5 or more failed attempts, blocks login for 1 minute
- Timer resets after successful login

#### `verify_admin_session(p_token)`
Validates existing sessions:
1. Looks up session by token
2. Checks if session is expired
3. Verifies user account is still active
4. Updates session expiry (sliding window)
5. Returns user info or null if invalid

#### `admin_logout(p_token)`
Invalidates a session:
1. Deletes session record from database
2. Forces re-authentication on next request

### 3. Frontend Implementation

#### Login Flow (`LoginPage.tsx`)
```typescript
1. User enters email and password
2. Calls login(email, password) function
3. Function calls admin_login RPC
4. On success: stores token in localStorage
5. Redirects to /admin/calendar
6. On failure: displays error message
```

#### Session Management (`useAuth.ts`)
```typescript
1. On mount: reads token from localStorage
2. Calls verify_admin_session RPC
3. If valid: sets user state
4. If invalid: clears localStorage
5. Renders auth state to components
```

#### Protected Routes (`AdminGuard.tsx`)
```typescript
1. Uses useAuth hook to check authentication
2. Shows loading spinner while verifying
3. If authenticated: renders children
4. If not authenticated: redirects to /admin/login
```

### 4. Session Lifecycle

```
Login → Token Generated → Stored in localStorage
                              ↓
                    Verified on Each Request
                              ↓
                    Updated (Sliding Window)
                              ↓
          Expires after 24 hours of inactivity
                              ↓
                        User Logged Out
```

### 5. Security Features

**Password Hashing:**
- Uses PostgreSQL `crypt()` function with bcrypt
- Salt automatically generated with `gen_salt('bf')`
- Industry-standard security

**Rate Limiting:**
- Prevents brute force attacks
- 5 attempts per minute per email
- Automatic timeout after 1 minute

**Session Security:**
- 64-character random hex tokens
- Stored in database, not JWT
- Can be invalidated server-side
- Automatic expiry after 24 hours

**Sliding Window:**
- Each request extends session by 24 hours
- Prevents timeout during active use
- Logs out inactive users automatically

## Adding New Admin Users

To add a new admin user, run this SQL in Supabase SQL Editor:

```sql
INSERT INTO admin_users (email, password_hash, full_name, is_active)
VALUES (
  'newemail@example.com',
  crypt('YourPasswordHere', gen_salt('bf')),
  'User Full Name',
  true
);
```

## Changing Password

To change a password:

```sql
UPDATE admin_users
SET password_hash = crypt('NewPasswordHere', gen_salt('bf')),
    updated_at = now()
WHERE email = 'user@example.com';
```

## Disabling an Account

To disable an admin account without deleting it:

```sql
UPDATE admin_users
SET is_active = false,
    updated_at = now()
WHERE email = 'user@example.com';
```

## Viewing Active Sessions

To see all active sessions:

```sql
SELECT
  s.id,
  s.token,
  s.expires_at,
  u.email,
  u.full_name
FROM admin_sessions s
JOIN admin_users u ON s.user_id = u.id
WHERE s.expires_at > now()
ORDER BY s.created_at DESC;
```

## Clearing All Sessions (Force Logout)

To log out all admins:

```sql
DELETE FROM admin_sessions;
```

## Viewing Login Attempts

To check recent login attempts:

```sql
SELECT
  email,
  attempt_time,
  success,
  ip_address
FROM login_attempts
ORDER BY attempt_time DESC
LIMIT 50;
```

## Troubleshooting

### Can't Log In
1. Check if account exists: `SELECT * FROM admin_users WHERE email = 'your@email.com'`
2. Verify account is active: `is_active = true`
3. Check for rate limiting: Look at recent failed attempts
4. Wait 1 minute if rate limited

### Session Expired
- Sessions expire after 24 hours of inactivity
- Just log in again with email/password
- Session will be automatically renewed

### Password Reset
- No automatic password reset (by design)
- Admin must manually update password in database
- Use SQL command above to change password

## Client Benefits

1. **No Supabase Dashboard Access Required**
   - Client can't accidentally break Supabase configuration
   - All user management via SQL queries
   - Reduced security risk

2. **Simple Management**
   - Add users with simple SQL query
   - Change passwords with SQL
   - No complex auth configuration

3. **Full Control**
   - Can add/remove users anytime
   - Can force logout all sessions
   - Can view all login attempts

4. **Secure by Default**
   - Rate limiting built-in
   - Bcrypt password hashing
   - Session-based authentication
   - No JWT vulnerabilities
