# AGENTS.md

## Purpose

This file provides instructions for AI assistants and team members when working on this frontend project.

This project is a Frontend Mock Project for the SWD course project: AI-Based Parking Building Management System.

The frontend uses mock data to simulate the main screens and business flows of the parking building management system.

No real backend, database, camera, IoT sensor, AI model, or payment gateway is required in this frontend phase.

## Tech Stack

- React
- JavaScript
- Vite
- React Router DOM
- Axios
- ESLint

Do not add new libraries unless the leader requests it.

## Main Screens

The frontend mock project should simulate these screens:

1. Login
2. Dashboard
3. Parking Structure
4. Pricing
5. Vehicle Entry with AI Recommendation
6. Vehicle Exit and Payment
7. Tickets
8. Sessions
9. Monthly Pass
10. Reservation
11. Lost Ticket
12. System Log

## Main Folder Structure

The project should follow this structure:

src/
├─ app/
├─ routes/
├─ layouts/
├─ components/
├─ pages/
├─ mock-data/
├─ constants/
├─ utils/
├─ styles/
└─ main.jsx

## Coding Rules

- Use JavaScript, not TypeScript.
- Use function components.
- Component and page file names must use PascalCase.
- Service file names must use camelCase.
- Do not put all logic directly inside page components.
- Page-specific logic should be placed in the service file of that page.
- Mock data must be placed in src/mock-data.
- Common reusable components must be placed in src/components/common.
- Layout-related components must be placed in src/components/layout or src/layouts.
- Constants must be placed in src/constants.
- Utility functions must be placed in src/utils.

## Task Scope Rule

The folder structure in the project guide is the expected final structure of the whole project.

When working on one task, only create or edit files related to that task.

Example: If the task is Login, only work with files such as:

- src/pages/Login/LoginPage.jsx
- src/pages/Login/loginService.js
- src/mock-data/users.js

Do not create or edit unrelated screens such as VehicleEntry, VehicleExit, Pricing, Reservation, or LostTicket unless the task requires it.

Do not create empty files for screens that are not being worked on.

## AI Assistant Rules

When an AI assistant is used to generate or modify code, it must:

1. Read AGENTS.md and docs/PROJECT_GUIDE.md first.
2. Follow the folder structure defined in the project guide.
3. Do not rename folders without permission.
4. Do not add new libraries without permission.
5. Do not modify shared files such as App.jsx, AppRoutes.jsx, routePaths.js, package.json, or global styles unless the task requires it.
6. If mock data is needed, place it in src/mock-data.
7. If page logic is needed, create a service file inside that page folder.
8. If reusable UI is needed, place it in src/components/common.
9. Code must run with npm run dev.
10. Keep the code simple, readable, and suitable for a course mock project.

## Git Rule Summary

Main branches:

- main: stable version for demo/submission
- dev: development branch for team work

After the initial setup, do not push directly to main or dev.

Each task should use a separate branch.

Branch format:

type/member-name/task-name

Examples:

- feature/duy/setup-project-structure
- feature/nam/login-page
- feature/minh/dashboard-page
- feature/huy/vehicle-entry-page