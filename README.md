# Netgen

Single Next.js app: customer storefront + shop-keeper admin panel.

## Routes

| URL | Who | What |
|-----|-----|------|
| `/` | Customers | Storefront — browse products |
| `/login`, `/signup`, `/account` | Customers | Customer auth & profile |
| `/admin` | Shop keepers | Admin panel (redirects to dashboard or login) |
| `/admin/login`, `/admin/signup` | Shop keepers | Shop keeper auth |
| `/admin/dashboard/*` | Shop keepers | Products, stock, profile |

Roles are set by **where you sign up**, not by choosing a role in the UI.

- Sign up on the website → `user` (customer)
- Sign up at `/admin/signup` → `shopKeeper`

## Setup

1. Copy env and fill in Firebase + Cloudinary keys:

```bash
cp .env.local.example .env.local
```

2. Install & run:

```bash
npm install
npm run dev
```

- Website: http://localhost:3000  
- Admin: http://localhost:3000/admin  

3. Deploy Firestore rules so products are publicly readable and orders work:

```bash
npx firebase-tools login
npx firebase-tools deploy --only firestore:rules
```

Or paste `firestore.rules` in Firebase Console → Firestore → Rules → Publish.

## Deploy on Vercel

1. Vercel → Project → **Settings → Environment Variables** — add all keys from `.env.local`:

```
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
```

2. **Redeploy** after saving env vars (Deployments → … → Redeploy). Env vars only apply on new builds.

3. Firebase Console → **Authentication → Settings → Authorized domains** → add your Vercel domain, e.g. `netgen-webproject.vercel.app`

4. Firebase Console → **Firestore → Rules** → paste `firestore.rules` → **Publish**

If `PROJECT_ID` is missing, the site shows empty products and navbar Sign in stays hidden.
