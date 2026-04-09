# Manual Setup Guide - Gym Logger

Follow these steps to finish setting up your Gym Logger application and deploy it to the web.

## Phase 1: Firebase Configuration

### 1. Enable Google Authentication
1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Select your project.
3. In the left sidebar, click **Authentication**.
4. Click the **Sign-in method** tab.
5. Click **Add new provider** and select **Google**.
6. Toggle **Enable** to ON.
7. Enter a support email and click **Save**.

### 2. Configure Authorized Domains
1. Still in **Authentication**, stay on the **Settings** tab.
2. Click **Authorized domains** in the left sub-sidebar.
3. Click **Add domain**.
4. Add `localhost` (if not already there).
5. Add your Vercel deployment domain (e.g., `gym-logger.vercel.app`) once you have it from Phase 2.

### 3. Deploy Security Rules
1. In the left sidebar, click **Firestore Database**.
2. Click the **Rules** tab.
3. Copy the contents of your local `firestore.rules` file and paste them into the editor.
4. Click **Publish**.

## Phase 2: Vercel Deployment

### 1. Push to GitHub
If you haven't already:
1. `git add .`
2. `git commit -m "Complete Gym Logger implementation"`
3. `git push origin main`

### 2. Connect to Vercel
1. Log in to [Vercel](https://vercel.com/).
2. Click **Add New** > **Project**.
3. Import your `gym_app` repository.
4. **IMPORTANT**: In the "Environment Variables" section, add all keys from your local `.env.local` file:
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `NEXT_PUBLIC_FIREBASE_APP_ID`
5. Click **Deploy**.

## Phase 3: PWA & Testing

### 1. Verify Deployment
1. Visit your new Vercel URL.
2. Log in with Google.
3. Check if the "Aesthetic" theme loads correctly and your movements are seeded.

### 2. Install as PWA
1. **iOS**: Open in Safari > Share Button > Add to Home Screen.
2. **Android**: Open in Chrome > Tap Three Dots > Install App.
3. **Desktop**: Open in Chrome > Click the "Install" icon in the address bar.
