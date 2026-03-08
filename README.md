# SyncSheet – Collaborative Real-Time Spreadsheet

SyncSheet is a **collaborative real-time spreadsheet web application** that allows multiple users to interact with spreadsheet-like data through a modern web interface. The application provides a clean UI, real-time updates, and cloud-based data synchronization using Firebase.

This project was developed using **React, Vite, TypeScript, Tailwind CSS, and Firebase** to demonstrate modern full-stack web development and real-time collaborative systems.

---

## 🚀 Live Demo

Access the deployed application here:

**https://syncsheet-eta.vercel.app**

---

## 📌 Features

* Real-time spreadsheet-style interface
* Collaborative data synchronization using Firebase
* Modern responsive UI using Tailwind CSS
* Authentication support via Firebase
* Component-based architecture with React
* Fast build and development using Vite
* Clean and reusable UI components

---

## 🛠 Tech Stack

**Frontend**

* React
* TypeScript
* Vite

**UI & Styling**

* Tailwind CSS
* shadcn/ui components
* Radix UI primitives

**Backend / Services**

* Firebase Authentication
* Firebase Firestore / Realtime Database

**Deployment**

* Vercel

---

## 📂 Project Structure

```
newsyncsheet
│
├── src
│   ├── components
│   │   ├── ui
│   │   └── grid
│   │
│   ├── firebase
│   │   └── firebaseConfig.ts
│   │
│   ├── pages
│   │
│   ├── App.tsx
│   └── main.tsx
│
├── public
├── index.html
├── package.json
├── vite.config.ts
├── tailwind.config.ts
└── tsconfig.json
```

---

## ⚙️ Installation & Setup

Clone the repository:

```bash
git clone https://github.com/himanshu-ydv07/newsyncsheet.git
```

Navigate into the project folder:

```bash
cd newsyncsheet
```

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

The project will start at:

```
http://localhost:5173
```

---

## 🔑 Environment Variables

Create a `.env` file in the project root and add your Firebase credentials:

```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_DATABASE_URL=
```

These variables are required for Firebase services.

---

## ☁️ Deployment

The project is deployed using **Vercel**.

Steps for deployment:

1. Push the project to GitHub
2. Connect the repository to Vercel
3. Add Firebase environment variables in Vercel
4. Deploy the project

Vercel automatically builds using:

```
npm run build
```

and serves the `dist` folder.

---

## 🔐 Firebase Configuration

Make sure to:

1. Enable **Authentication Providers** (Google / Email)
2. Add your deployed domain in **Authorized Domains**
3. Configure Firestore or Realtime Database rules

Example authorized domain:

```
syncsheet-eta.vercel.app
```

---

## 📈 Future Improvements

* Multi-user cursor tracking
* Formula support
* Role-based access control
* File export (CSV / Excel)
* Improved collaboration features
* Offline support

---

## 👨‍💻 Author

**Himanshu Yadav**

GitHub:
https://github.com/himanshu-ydv07

---

## 📜 License

This project is open-source and available under the **MIT License**.

---
