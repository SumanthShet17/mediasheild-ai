# 🚀 MediaShield AI Git & CI/CD Workflow Guide

Welcome team! The CI/CD pipeline is fully built and operational. Please follow this guide to start writing and merging code.

---

## 🏠 Step 1: Initial Setup (Every Member Does This Once)

Open your terminal and run these exact commands to download the project and create your personal workspace:

```bash
# 1. Download the code
git clone https://github.com/SumanthShet17/mediasheild-ai.git
cd mediasheild-ai

# 2. Install the missing packages locally
npm install

# 3. Switch to the development branch to get the latest code
git checkout develop

# 4. START YOUR OWN BRANCH! (See the table below for which command to run)
```

### Which branch command should you run?

| Team Member | Role | Command to Run |
|-------------|------|----------------|
| **Member 1** | Frontend | `git checkout -b feature/frontend` |
| **Member 2** | AI / ML | `git checkout -b feature/ai-engine` |
| **Member 3** | Cloud Infra | `git checkout -b feature/cloud-infra` |
| **Member 4** | Visualization | `git checkout -b feature/visualization` |

---

## 💻 Step 2: The Daily Workflow (How to write code)

Whenever you finish writing a piece of code (like a new component or function), run these three simple commands inside your `mediasheild-ai` folder:

```bash
# 1. Add all your changes
git add .

# 2. Save it with a descriptive message
git commit -m "feat: added new sidebar navigation component"

# 3. Push it to GitHub
git push origin feature/YOUR-BRANCH-NAME
```
*(Make sure you replace `YOUR-BRANCH-NAME` with your actual branch from the table above!)*

---

## 🔄 Step 3: Triggering the CI/CD Pipeline (How Code merges)

When you are done with a major feature and want to share it with the rest of the team:

1. Go to the GitHub website: `https://github.com/SumanthShet17/mediasheild-ai`
2. Click the green **"Compare & pull request"** button.
3. Change the base branch to **`develop`** (Do NOT merge directly to `main` yet!).
4. Click **Create pull request**.
5. **The Magic Happens:** The CI/CD pipeline will automatically spin up and test your code (`✅ Lint & Validate` and `🏗️ Build`). If it passes, the rest of the team can review it and click "Merge pull request".

---

## 👑 Special Task: Member 3 (The Cloud Engineer)

Member 3 manages the Google Cloud account. They have one extra job that **must** be done before the end of the hackathon to allow the pipeline to deploy to Google Cloud Run automatically.

1. Go to Google Cloud Console.
2. Generate a **Service Account JSON Key** (Grant it `Cloud Run Admin`, `Storage Admin`, and `Service Account User` roles).
3. Open the project's **GitHub Settings → Secrets and variables → Actions**.
4. Click **New repository secret** and add these:
   - `GCP_SA_KEY` *(Paste the entire JSON key payload here)*
   - `GCP_PROJECT_ID` *(Your GCP project ID, e.g., `mediashield-ai`)*
5. Once your API keys are registered, add them here as well:
   - `VITE_GEMINI_API_KEY`
   - `VITE_GOOGLE_CLOUD_API_KEY`
   - `VITE_MAPS_API_KEY`

When we are fully finished, we will create one final Pull Request from `develop` into `main`, and the pipeline will automatically push the app live to the internet!
