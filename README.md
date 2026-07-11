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
dotnet build ParkingSystem.sln
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

## Roadmap

1. ✅ Solution structure + Docker Compose
2. ⏭ Domain entities + enums
3. ⏭ `AppDbContext` + EF Core migrations + seed data
4. ⏭ Auth (JWT)
5. ⏭ Parking structure CRUD
6. ⏭ AI Slot Recommendation (scoring formula)
7. ⏭ Vehicle check-in / check-out flow
8. ⏭ Pricing & payment
9. ⏭ SystemLog action filter
10. ⏭ End-to-end Swagger testing
