# Ha-Design Setup Instructions

Welcome to the premium **Ha-Design** e-commerce platform. Follow these steps to get the application running locally.

## 🚀 Getting Started

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configuration**
   - Create a `.env` file in the root directory.
   - Use the structure from `.env.example` and fill in your unique credentials.
   
   ### Firebase Setup
   - Create a project on [Firebase Console](https://console.firebase.google.com/).
   - Enable **Authentication** (Email/Password).
   - Create a **Firestore Database**.
   - Create a Web App and copy the config values to your `.env`.

   ### Cloudinary Setup
   - Create an account on [Cloudinary](https://cloudinary.com/).
   - Go to Settings > Upload > Upload Presets and create an **Unsigned** preset.
   - Add your `Cloud Name` and `Upload Preset` to your `.env`.

3. **Run Locally**
   ```bash
   npm run dev
   ```

## 🔐 Admin Access
To access the Admin Dashboard:
1. Navigate to `/admin/login`.
2. Create an admin user in your Firebase Auth console.
3. Login and start managing your "Ha-Design" collection!

## 🎨 Theme Palette
- Primary Pink: `#ff5d8f`
- Soft Pink: `#fadde1`
- Accent: `#ffcad4`

## 🧱 Key Features
- **Public**: Home, Product Gallery (with filters), Product Details.
- **Admin**: Full CRUD for products, Cloudinary image upload, Analytics mock.
- **Tech**: Framer Motion for premium animations, Lucide for icons, Tailwind v4.
