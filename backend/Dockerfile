# ParkingSystem.API Dockerfile
# Build context: backend/ (thư mục gốc của backend)

# ---------- Build stage ----------
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy project files and restore dependencies (leverages Docker layer caching)
COPY ["src/ParkingSystem.API/ParkingSystem.API.csproj", "src/ParkingSystem.API/"]
COPY ["src/ParkingSystem.Application/ParkingSystem.Application.csproj", "src/ParkingSystem.Application/"]
COPY ["src/ParkingSystem.Domain/ParkingSystem.Domain.csproj", "src/ParkingSystem.Domain/"]
COPY ["src/ParkingSystem.Infrastructure/ParkingSystem.Infrastructure.csproj", "src/ParkingSystem.Infrastructure/"]

RUN dotnet restore "src/ParkingSystem.API/ParkingSystem.API.csproj"

# Copy source code
COPY src/ src/
WORKDIR /src/src/ParkingSystem.API
RUN dotnet build "ParkingSystem.API.csproj" -c Release -o /app/build

# ---------- Publish stage ----------
FROM build AS publish
RUN dotnet publish "ParkingSystem.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

# ---------- Runtime stage ----------
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app

# Copy published app from build stage
COPY --from=publish /app/publish .

# Install curl for health checks
RUN apt-get update \
    && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*

# Create non-root user for security
RUN adduser --disabled-password --gecos "" appuser \
    && chown -R appuser /app
USER appuser

EXPOSE 8080

ENV ASPNETCORE_URLS=http://+:8080
ENV ASPNETCORE_ENVIRONMENT=Production

HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
    CMD curl -f http://localhost:8080/health || exit 1

ENTRYPOINT ["dotnet", "ParkingSystem.API.dll"]
