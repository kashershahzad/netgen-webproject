# Netgen

Monorepo for the Netgen shop platform: shop-keeper admin panel + customer storefront.

## Apps

| App | Folder | Port | Role on signup |
|-----|--------|------|----------------|
| **Admin** (shop keeper panel) | `admin/` | **3000** | `shopKeeper` (hardcoded in admin code) |
| **Website** (customer storefront) | `website/` | **3001** | `user` (hardcoded in website code) |

Roles are set by **which app you sign up on**, not by choosing a role in the UI.

- Shop keepers manage products, stock, and shop profile in the admin panel.
- Customers browse all products and manage their profile on the public website.
- Login is role-gated: a `shopKeeper` cannot sign in on the website (and vice versa).

## Setup

1. Copy env files (Firebase + Cloudinary):

```bash
cp admin/.env.local.example admin/.env.local
cp website/.env.local.example website/.env.local
# fill in the same keys in both
```

2. Install dependencies:

```bash
cd admin && npm install
cd ../website && npm install
```

3. Deploy Firestore rules from the repo root (`firestore.rules`) so products are publicly readable.

## Run locally

```bash
# Terminal 1 — admin (port 3000)
cd admin && npm run dev

# Terminal 2 — storefront (port 3001)
cd website && npm run dev -- -p 3001
```

- Admin: http://localhost:3000  
- Website: http://localhost:3001  

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS  
- Firebase Auth + Firestore  
- Cloudinary (product images, admin upload)
