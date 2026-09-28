# Netgen — Shop Keeper Admin Panel

Next.js admin panel: shop keeper accounts, products, stock, profile.  
Backend: **Firebase Auth + Firestore** · Images: **Cloudinary (free tier)**

## Features

- Shop keeper **Signup / Login**
- **Dashboard**, **Products** (device image upload), **Stock**, **Profile**

## Setup

### 1. Install & env

```bash
cd netgen
npm install
cp .env.local.example .env.local
```

### 2. Firebase

1. [Firebase Console](https://console.firebase.google.com/) → project
2. **Authentication** → Email/Password enable
3. **Firestore** create + publish `firestore.rules`
4. Web app config → `.env.local` mein Firebase keys

### 3. Cloudinary (free image upload)

1. [cloudinary.com](https://cloudinary.com/) pe free account banao
2. Dashboard pe **Cloud name** copy karo
3. **Settings** → **Upload** → **Upload presets** → **Add upload preset**
   - Signing mode: **Unsigned**
   - Folder (optional): `shops`
   - Save → preset **name** copy karo
4. `.env.local` mein dalo:

```
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_unsigned_preset
```

5. Dev server restart: `npm run dev`

### 4. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Notes

- Firebase Storage ki zaroorat nahi (Blaze plan avoid)
- Product images Cloudinary pe `shops/{userId}/` folder mein save hoti hain
- Recommended image: **1200×900** (4:3), max 5 MB
