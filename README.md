# SkillEarnApp

Professional Freelance Marketplace for Students and Clients.

## Deployment to Vercel

This app is configured for full-stack deployment on Vercel.

1. **Export to GitHub**: Use the **Settings -> Export to GitHub** button in AI Studio to push this code to your repository.
2. **Connect to Vercel**: Go to [Vercel](https://vercel.com/) and import your new GitHub repository.
3. **Environment Variables**: In your Vercel project settings, add the following environment variables:
   - `MONGODB_URI`: Your MongoDB connection string.
   - `JWT_SECRET`: A secure random string for tokens.
   - `GEMINI_API_KEY`: Your Google Gemini API key.
   - `NODE_ENV`: Set this to `production` (Note: Vercel normally sets this automatically).

## Technical Setup
- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: Express.js + Mongoose
- **AI**: Google Gemini API

## Local Setup & Development in VS Code

Follow these steps to run this application locally on your computer using Visual Studio Code.

### 1. Prerequisites
Ensure you have the following installed on your machine:
- **Node.js** (v18 or higher recommended) -> [Download here](https://nodejs.org/)
- **VS Code** (Visual Studio Code) -> [Download here](https://code.visualstudio.com/)
- **MongoDB**: Access to a MongoDB database. You can either use a free cloud cluster on **MongoDB Atlas** or run a local instance of MongoDB Community Server.

---

### 2. Export & Download the Project
1. In the Google AI Studio project workspace, click on the **Settings** menu gear icon in the upper-right corner.
2. Select **Export to GitHub** (to push to a repository) or select **Download ZIP** to save the project directly onto your computer.
3. If downloaded as a ZIP file, extract it to a directory on your machine.

---

### 3. Open in VS Code
1. Launch **Visual Studio Code**.
2. Go to **File > Open Folder...** (on Windows/Linux) or **File > Open...** (on macOS).
3. Select the folder where you extracted the project and click **Open**.

---

### 4. Setup Environment Variables
You need to create a config file to store your credentials:
1. In the sidebar file explorer of VS Code, find `.env.example`.
2. Duplicate or rename a copy of it to exactly `.env` (using no suffix).
3. Open the `.env` file and fill in your values:

   ```env
   # Database (Get this from MongoDB Atlas or use: mongodb://localhost:27017/skillearn)
   MONGODB_URI=your_mongodb_connection_string

   # Security (A strong custom phrase of your choice to hash passwords/tokens)
   JWT_SECRET=any_custom_secure_secret_hash_key

   # AI (Get a free key from https://aistudio.google.com/)
   GEMINI_API_KEY=your_gemini_api_key

   # Environment (Set to 'development' for local coding)
   NODE_ENV=development
   ```

---

### 5. Install Dependencies
Open the built-in terminal in VS Code to install the necessary modules:
1. In the top command menu of VS Code, click **Terminal > New Terminal** (or use the backtick shortcut ``Ctrl + ` ``).
2. Run the package installations command:
   ```bash
   npm install
   ```

---

### 6. Run the Application
Start the development environment locally:
1. In the terminal, run the following command:
   ```bash
   npm run dev
   ```
2. Once the server launches successfully, you will see a console message indicating it is running.
3. Open your browser and navigate to:
   **`http://localhost:3000`**

---

### 7. Core Node Scripts (Optional)
- `npm run dev` — Starts the combined frontend/backend dev server.
- `npm run build` — Compiles the static build for production.
- `npm run clean` — Cleans up build artifacts.
- `npm run start` — Boots the application in production mode.
