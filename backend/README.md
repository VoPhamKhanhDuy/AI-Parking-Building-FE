# ParkingSystem Backend (.NET 8 + PostgreSQL)

AI-Based Parking Building Management System — backend built with ASP.NET Core 8, Clean Architecture, EF Core (Npgsql) and JWT auth.

## Tech Stack

- ASP.NET Core 8 Web API (Controllers)
- Entity Framework Core 8 + `Npgsql.EntityFrameworkCore.PostgreSQL`
- PostgreSQL 16 (via Docker Compose)
- JWT authentication + Role-based authorization (Admin / Manager / Staff / Driver)
- BCrypt.Net for password hashing
- AutoMapper for DTO mapping
- FluentValidation for request validation
- Swagger / Swashbuckle for API documentation
- xUnit + FluentAssertions for unit testing (esp. AI scoring)

## Project Layout

```
backend/
├── ParkingSystem.sln
├── docker-compose.yml          # PostgreSQL 16 + pgAdmin
├── .env.example                # copy to .env and adjust if needed
├── global.json                 # pins SDK behaviour
├── src/
│   ├── ParkingSystem.Domain           # Entities, Enums (no dependencies)
│   ├── ParkingSystem.Application      # Services, DTOs, Interfaces, Validators
│   ├── ParkingSystem.Infrastructure   # DbContext, Repositories, EF Core, JWT
│   └── ParkingSystem.API              # Controllers, Program.cs, Middleware
└── tests/
    └── ParkingSystem.Tests            # xUnit tests (AI scoring etc.)
```

Clean Architecture dependency direction:
`API → Infrastructure → Application → Domain`
`Tests → Application + Domain + Infrastructure`

## Quick Start (Local Dev)

### 1. Start PostgreSQL

```bash
cp .env.example .env       # optional — defaults already wired in docker-compose.yml
docker compose up -d postgres
```

PostgreSQL will be exposed on `localhost:5432`.
pgAdmin (optional) on `http://localhost:5050` (login: `admin@parking.local` / `adminpass`).

### 2. Build the solution

```bash
dotnet build src/ParkingSystem.API/ParkingSystem.API.csproj
```

### 3. Run the API

```bash
dotnet run --project src/ParkingSystem.API/ParkingSystem.API.csproj
```

Swagger UI: `https://localhost:5001/swagger` (or the port printed in console).

## Connection String

`src/ParkingSystem.API/appsettings.Development.json` reads:

```
Host=localhost;Port=5432;Database=parkingdb;Username=parkinguser;Password=parkingpass
```

Override via user-secrets, environment variable `ConnectionStrings__DefaultConnection`, or your own `appsettings.Local.json` (gitignored).

## Seed Data

On first startup (or whenever the relevant tables are empty), `DbSeeder` populates:

| Resource                | Seed                                                                                                  |
|-------------------------|-------------------------------------------------------------------------------------------------------|
| Roles                   | `Admin`, `Manager`, `Staff`, `Driver`                                                                 |
| Vehicle types           | `Car` (10 000 / hr), `Motorbike` (5 000 / hr), `ElectricVehicle` (12 000 / hr)                         |
| Default admin user      | `admin@parking.local` / `Admin@123` (Admin role) — **rotate this immediately for any non-dev env**     |
| Sample building         | `Main Parking Building` — 3 floors, 5 zones, 114 slots (Motorbike / Car / EV split)                    |
| Pricing rules           | Hourly / Daily / MonthlyPass rows per vehicle type (effective from server boot)                        |

The seeder is idempotent — re-running it on an already-seeded DB is a no-op. The smoke-test scripts below rely on it.

## Smoke Test (E2E happy path)

A PowerShell script that exercises the entire flow (`login → vehicle → ticket → session → payment → check-out → end`) end-to-end against the running API and a live Postgres:

```powershell
# 1. Make sure Postgres + API are up (the API auto-migrates on start)
docker compose up -d postgres
dotnet run --project src/ParkingSystem.API/ParkingSystem.API.csproj

# 2. In a second shell (assumes the API is listening on http://127.0.0.1:5169):
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/smoke-test.ps1
```

Override `-BaseUrl`, `-AdminEmail`, or `-AdminPassword` to target a remote environment.

Expected output ends with `== ALL SMOKE STEPS PASSED ==` and exits 0.

## Roadmap

1. ✅ Solution structure + Docker Compose
2. ✅ Domain entities + enums
3. ✅ `AppDbContext` + EF Core migrations + seed data
4. ✅ Auth (JWT)
5. ✅ Parking structure CRUD (buildings / floors / zones / slots)
6. ✅ AI Slot Recommendation (scoring formula)
7. ✅ Vehicle check-in / check-out flow
8. ✅ Pricing & payment
9. ✅ SystemLog action filter (audit trail: per-request `SystemLogs` row with `UserId`, `IpAddress`, `Action`, `Description`, latency, exception)
10. ✅ Smoke test for the full happy path (`scripts/smoke-test.ps1`)

