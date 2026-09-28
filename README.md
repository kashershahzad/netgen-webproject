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

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS  
- Firebase Auth + Firestore  
- Cloudinary (product images)
