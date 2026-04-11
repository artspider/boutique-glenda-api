# Boutique Glenda - Ejecución con Docker

## Servicios incluidos

- PostgreSQL
- FastAPI backend
- Frontend React/Vite

## Requisitos

- Docker
- Docker Compose

## Archivos principales

- `Dockerfile` → backend
- `frontend/Dockerfile` → frontend
- `.env.docker` → variables de entorno para contenedores
- `docker-compose.yml` → orquestación del stack completo

## Levantar la aplicación

Desde la raíz del proyecto:

```bash
docker compose up --build

Accesos
Frontend: http://localhost:5173
Backend: http://localhost:8000
Swagger: http://localhost:8000/docs
PostgreSQL: localhost:5433

Detener servicios
docker compose down

Reconstruir solo backend
docker compose build backend
docker compose up -d --force-recreate backend

Reconstruir solo frontend
docker compose build frontend
docker compose up -d --force-recreate frontend

Restaurar respaldo SQL en la BD dockerizada

En PowerShell:
Get-Content "C:\respaldos\boutique_glenda_backup_2026-04-10.sql" | docker exec -i boutique_glenda_postgres psql -U postgres -d boutique_glenda

Notas
.env se usa para entorno local fuera de Docker.
.env.docker se usa para comunicación interna entre contenedores.
El backend usa el host db dentro de Docker Compose.