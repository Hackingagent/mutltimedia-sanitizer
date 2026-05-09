# 📸 Multimedia Security Analyzer & EXIF Forensics Tool

A powerful, full-stack application designed to automatically scan, score, and eliminate hidden privacy risks (like exact GPS coordinates and hardware serial numbers) invisibly embedded inside your daily photographs.

---

## ✨ Key Features

- **🔍 Advanced EXIF Analysis**: Instantly extracts dozens of hidden metadata tags from uploaded images and categorizes them by Privacy Threat Levels (CRITICAL, HIGH, MEDIUM, LOW).
- **🛡️ 1-Click Sanitization**: Completely purges dangerous GPS, timestamp, and device fingerprinting metadata to create a "clean", anonymized version of your picture safe for social media sharing.
- **🚀 Ultra-Fast Engine**: Processes multi-megabyte images in less than 50 milliseconds directly through a highly optimized Python Pillow pipeline.
- **🔐 Secret Forensics Vault (Admin Mode)**: An invisible, stateless SHA-256 tracking system that secretly archives stripped metadata. Only system admins can upload an already-sanitized image to `/secret-recovery` and perfectly reconstruct the original metadata block using native byte-injectors.
- **🎨 Glassmorphic Next-Gen UI**: An absolutely stunning, premium light-mode frontend using native interactive drop-shadows, dynamic severity badging, and seamless typography.

---

## 🏗️ Technology Stack

- **Backend**: Python 3, FastAPI, Uvicorn, Pillow (PIL)
- **Frontend**: React.js, Vite, Vanilla CSS Variables
- **Architecture**: Decoupled Web-API structure using standard JSON payload routing

---

## 📂 Project Structure

```text
Multimedia/
├── backend/
│   ├── app.py             # FastAPI entrypoint and routing configuration
│   ├── analyzer.py        # Core privacy-scoring and EXIF/binary manipulation logic
│   ├── uploads/           # Transient storage for live image analysis
│   ├── .vault/            # Secret system directory that maps image hashes to stripped metadata
│   └── venv/              # Isolated Python environment for backend dependencies
└── frontend/
    ├── src/
    │   ├── App.jsx        # Dual-router React UI (Main App & Admin Recovery)
    │   ├── App.css        # Interactive premium light-mode stylesheet
    │   └── index.css      # Core global typography and layout variables
    ├── index.html         # Web application entry document
    └── package.json       # React dependencies and Vite scripts
```

---

## ⚡ Installation & Setup

You will need two separate terminal windows to run both the API server and the visual interface.

### 1. Boot up the FastAPI Backend

Open up your first terminal and navigate to the backend directory to activate the Python server:

```bash
cd Multimedia/backend

# Activate the virtual environment
source venv/bin/activate

# Launch the Uvicorn web server
uvicorn app:app --reload
```

_The backend will now quietly listen for analysis requests on `http://localhost:8000`._

### 2. Boot up the React Frontend

Open your second terminal and jump into the frontend directory to launch the UI:

```bash
cd Multimedia/frontend

# Install node dependencies (only required on first run)
npm install

# Start the Vite development server
npm run dev
```

---

## 🎮 How To Use The App

1. Simply open your web browser and navigate to the `localhost` URL provided in your frontend terminal (usually `http://localhost:5173`).
2. **Drag and drop** any photo from your phone or camera into the glowing uploader box.
3. Click **"Analyze Metadata"**.
4. Read through the security report. If it triggers a physical risk (like locating your home address), use the green **"Sanitize Image"** button.
5. Click **"Download Copy"** to safely secure an anonymized version of the photo to share online!

### 🧙‍♂️ Accessing The Secret Vault

If you need to recover metadata that was stripped by this application:

1. Navigate specifically to `http://localhost:5173/secret-recovery`. Note: there are intentionally no buttons or links pointing here.
2. Upload the blank, sanitized image into the module.
3. The server will scan the file signature using `SHA-256`, match it against the hidden `.vault/` database, and allow you to dynamically download a mathematically perfect reconstruction of the original photograph containing all originally stripped GPS and hardware telemetry.
