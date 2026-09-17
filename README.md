# Digital Heroes MVP

This is the Digital Heroes MVP application. It allows users to register, subscribe, enter golf scores, and select charities to contribute to. Administrators can manage the platform and run automated draws to distribute prizes based on users' golf scores.

## Requirements

- Node.js (v18 or newer recommended)
- MongoDB (running locally or remote URI)

## How to Run

1. **Database Setup**
   Ensure MongoDB is running on your machine. The default connection string is `mongodb://localhost:27017/digital-heroes`.

2. **Backend Setup**
   Open a terminal and navigate to the backend directory:
   ```bash
   cd backend
   npm install
   ```
   Start the backend development server:
   ```bash
   npm run dev
   ```
   The backend will run on `http://localhost:5000`.

3. **Frontend Setup**
   Open a second terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   npm install
   ```
   Start the frontend development server:
   ```bash
   npm run dev
   ```
   The frontend will run on `http://localhost:5173` (or the next available port).

4. **Access the Application**
   Open your browser and navigate to the URL provided by the frontend terminal (typically `http://localhost:5173`).
