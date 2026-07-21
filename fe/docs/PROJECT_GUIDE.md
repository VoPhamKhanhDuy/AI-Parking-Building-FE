# Project Guide

## 1. Project Goal

This is the frontend mock project for:

**AI-Based Parking Building Management System**

The project uses mock data to simulate the main screens and business flows of the parking building system.

No real backend, database, AI model, camera, IoT, or payment gateway is required in this frontend phase.

---

## 2. Tech Stack

- React
- JavaScript
- Vite
- React Router DOM
- Axios
- ESLint

Do not add new libraries unless the leader approves.

---

## 3. Main Screens

The project should include these screens:

- Login
- Dashboard
- Parking Structure
- Pricing
- Vehicle Entry with AI Recommendation
- Vehicle Exit and Payment
- Tickets
- Sessions
- Monthly Pass
- Reservation
- Lost Ticket
- System Log

---

## 4. Folder Structure

Use this structure:

```txt
src/
├─ app/
│  └─ App.jsx
│
├─ routes/
│  ├─ AppRoutes.jsx
│  └─ routePaths.js
│
├─ layouts/
│  ├─ AuthLayout.jsx
│  └─ MainLayout.jsx
│
├─ components/
│  ├─ common/
│  └─ layout/
│
├─ pages/
│  ├─ Login/
│  ├─ Dashboard/
│  ├─ ParkingStructure/
│  ├─ Pricing/
│  ├─ VehicleEntry/
│  ├─ VehicleExit/
│  ├─ Tickets/
│  ├─ Sessions/
│  ├─ MonthlyPass/
│  ├─ Reservation/
│  ├─ LostTicket/
│  └─ SystemLog/
│
├─ mock-data/
├─ constants/
├─ utils/
├─ styles/
└─ main.jsx
```

---

## 5. Page Folder Rule

Each screen has its own folder inside `src/pages`.

Example:

```txt
src/pages/Login/
├─ LoginPage.jsx
└─ loginService.js
```

Example:

```txt
src/pages/VehicleEntry/
├─ VehicleEntryPage.jsx
├─ AIRecommendationCard.jsx
└─ vehicleEntryService.js
```

Each member only creates or edits files related to their assigned task.

Do not create empty files for screens that are not being worked on.

Do not create random folders such as:

```txt
src/test/
src/my-code/
src/pages2/
src/abc/
```

---

## 6. Mock Data Rule

All mock data must be placed in:

```txt
src/mock-data/
```

Data flow:

```txt
Page → Service → Mock Data
```

Example:

```txt
LoginPage.jsx
→ loginService.js
→ src/mock-data/users.js
```

Example:

```txt
VehicleEntryPage.jsx
→ vehicleEntryService.js
→ src/mock-data/slots.js
→ src/mock-data/aiRecommendations.js
```

Mock data can be created gradually when each task is implemented.

---

## 7. Naming Rules

### Page folders

Use PascalCase:

```txt
Login/
Dashboard/
VehicleEntry/
VehicleExit/
MonthlyPass/
LostTicket/
SystemLog/
```

### Page files

Use PascalCase and end with `Page.jsx`:

```txt
LoginPage.jsx
DashboardPage.jsx
VehicleEntryPage.jsx
VehicleExitPage.jsx
```

### Component files

Use PascalCase:

```txt
DashboardCard.jsx
SlotCard.jsx
AIRecommendationCard.jsx
PaymentSummary.jsx
```

### Service files

Use camelCase:

```txt
loginService.js
dashboardService.js
vehicleEntryService.js
vehicleExitService.js
```

---

## 8. Environment Variables

Create `.env.example` and commit it to GitHub.

Example:

```env
VITE_APP_NAME=AI Parking Building
VITE_API_URL=http://localhost:5000/api
VITE_USE_MOCK_DATA=true
```

Each developer can create their own local `.env` file.

`.env` must not be committed.

Make sure `.gitignore` contains:

```txt
.env
node_modules
dist
```

Remember:

```txt
.env.example = sample file, push to GitHub
.env = local file, do not push
```

---

## 9. Git Branches

Main branches:

```txt
main = stable version for demo/submission
dev = development branch for team work
```

Rules:

- Do not code directly on `main`.
- After initial setup, do not code directly on `dev`.
- Each task must use a separate branch from `dev`.

---

## 10. Git Workflow

Start a task:

```bash
git checkout dev
git pull origin dev
git checkout -b feature/member-name/task-name
```

Example:

```bash
git checkout -b feature/nam/login-page
```

After finishing the task:

```bash
git add .
git commit -m "feat: build login page"
git push -u origin feature/nam/login-page
```

Then create a Pull Request:

```txt
feature/nam/login-page → dev
```

The leader reviews and merges into `dev`.

---

## 11. Branch Naming Rule

Use this format:

```txt
type/member-name/task-name
```

Examples:

```txt
feature/duy/setup-project-structure
feature/nam/login-page
feature/minh/dashboard-page
feature/huy/vehicle-entry-page
fix/nam/login-validation
style/minh/dashboard-ui
```

Common types:

```txt
feature = new feature
fix     = bug fix
style   = UI/style update
docs    = documentation update
chore   = setup/configuration
```

Do not use unclear branch names:

```txt
test
abc
task1
duycode
code-moi
```

---

## 12. Commit Message Rule

Use this format:

```txt
type: short message
```

Examples:

```txt
feat: build login page
feat: add vehicle entry page
fix: correct fee calculation
style: improve dashboard cards
docs: update project guide
chore: setup folder structure
```

Do not use unclear commit messages:

```txt
update
fix
done
abc
code
```

---

## 13. Pull Request Checklist

Before creating a Pull Request, check:

- The project runs with `npm run dev`
- No serious console errors
- No `node_modules` is pushed
- No `.env` is pushed
- Branch name follows the rule
- Commit message is clear
- UI is not broken
- Only files related to the assigned task are changed
- Mock data is placed in `src/mock-data`
- Page logic is placed in the page service file

---

## 14. Local Development

Install dependencies:

```bash
npm install
```

Run project:

```bash
npm run dev
```

Default local URL:

```txt
http://localhost:5173/
```

---

## 15. AI Usage Rule

When using AI to generate code, use this prompt style:

```txt
Read AGENTS.md and docs/PROJECT_GUIDE.md first.
Create the Login page following the project structure.
Only work inside src/pages/Login and src/mock-data/users.js if needed.
Do not add new libraries.
Do not edit unrelated screens.
```

---

## 16. Important Reminder

The folder structure is the final expected structure of the whole project.

A member does not need to create all folders and files.

Whoever works on a task only creates or edits files for that task.