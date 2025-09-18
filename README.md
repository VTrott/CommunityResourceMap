# Community Resource Map

A web application that helps people discover and access community resources in their area. Whether you're looking for food assistance, healthcare, housing support, or legal aid, this map connects you with verified local organizations and services.

## Product Overview

**Problem**: Finding reliable community resources can be difficult, especially during times of need. Information is often scattered across multiple websites, outdated, or hard to discover.

**Solution**: A centralized, searchable map of community resources with real-time information, user submissions, and community moderation.

### Key Features

**For Community Members:**
- **Interactive Map**: Browse resources by location with visual markers
- **Smart Search**: Find resources by name, category, or keywords
- **Location-Based**: Filter by distance, neighborhood, or city
- **Mobile-Friendly**: Access from any device
- **Real-Time Info**: Up-to-date hours, contact info, and availability

**For Organizations:**
- **Easy Submission**: Add new resources or update existing ones
- **Verification Process**: Community-moderated content ensures accuracy
- **Analytics**: Track how your services are discovered

**For Administrators:**
- **Moderation Queue**: Review and approve community submissions
- **Usage Insights**: Monitor popular resources and search patterns
- **Quality Control**: Maintain data accuracy and prevent spam

### Resource Categories
- **Food Assistance** (food banks, meal programs, SNAP enrollment)
- **Healthcare** (free clinics, mental health services, dental care)
- **Housing** (shelters, transitional housing, rental assistance)
- **Legal Aid** (pro bono services, tenant rights, immigration)
- **Family Services** (childcare, parenting support, youth programs)
- **Employment** (job training, resume help, career counseling)
- **Education** (GED programs, ESL classes, computer literacy)

## Stack
- Frontend: React + TypeScript (Vite), React Router, TanStack Query, React Hook Form, Zod
- Backend: Spring Boot 3 (Java 21), JPA/Hibernate, Flyway, Actuator
- DB: PostgreSQL 16
- Local Dev: Docker Compose

## Quick start (Docker Compose)
Prereqs: Docker Desktop installed and running.

```bash
docker compose up --build -d
# API health
curl http://localhost:8080/api/health
# Web app (dev server, if running): http://localhost:5173/health
```

Services:
- api: http://localhost:8080
- postgres: localhost:5432 (db: crm, user: crm, pwd: crm)

## Frontend (Vite dev server)
```bash
cd app
npm i
npm run dev
# open http://localhost:5173
```
Vite proxy forwards `/api/*` to `http://localhost:8080`. Configure via `app/vite.config.ts`. Optional: set `VITE_API_URL`.

## Backend (Spring Boot)
Run with Docker Compose (recommended), or locally without DB using the `local` profile:
```bash
cd api
mvn spring-boot:run -Dspring-boot.run.profiles=local
# http://localhost:8080/api/health
```

## Database & migrations (Flyway)
- Flyway runs on app startup and applies SQL files in `api/src/main/resources/db/migration/` (e.g., `V1__init.sql`).
- Migration history is tracked in `flyway_schema_history`.

MVP ERD:
- Place(id, name, description, website, phone, email, address_line1/2, city, state, postal_code, latitude, longitude, status, created_at, updated_at, deleted_at)
- Category(id, name, slug)
- PlaceCategory(place_id, category_id)
- Submission(id, place_id?, payload jsonb, status, submitted_by_email, created_at, reviewed_at)

Key indexes:
- name trigram search, (latitude, longitude) for map bounds, (city, state)

## API Endpoints

### Places
- `GET /api/places` - List all places
- `GET /api/places/{id}` - Get place by ID
- `POST /api/places` - Create new place
- `PUT /api/places/{id}` - Update place
- `DELETE /api/places/{id}` - Delete place
- `POST /api/places/search` - Search places with filters and pagination

### Search API
The search endpoint supports filtering by city, state, name, status, and categories with pagination:

```bash
# Search by city
curl -X POST http://localhost:8080/api/places/search \
  -H 'Content-Type: application/json' \
  -d '{"city":"Seattle","page":0,"size":10}'

# Search by name with pagination
curl -X POST http://localhost:8080/api/places/search \
  -H 'Content-Type: application/json' \
  -d '{"name":"Clinic","page":0,"size":5,"sortBy":"name","sortDirection":"asc"}'

# Get all active places
curl -X POST http://localhost:8080/api/places/search \
  -H 'Content-Type: application/json' \
  -d '{"status":"active","page":0,"size":20}'
```

**Search Request Parameters:**
- `city` (string): Filter by city (partial match, case-insensitive)
- `state` (string): Filter by state (partial match, case-insensitive)
- `name` (string): Filter by place name (partial match, case-insensitive)
- `status` (string): Filter by status (exact match, default: "active")
- `categoryIds` (array): Filter by category IDs (when categories are implemented)
- `page` (number): Page number (default: 0)
- `size` (number): Page size (default: 20)
- `sortBy` (string): Sort field (default: "name")
- `sortDirection` (string): Sort direction - "asc" or "desc" (default: "asc")

**Search Response:**
```json
{
  "content": [...places...],
  "page": 0,
  "size": 10,
  "totalElements": 1,
  "totalPages": 1,
  "first": true,
  "last": true
}
```

### Health
- `GET /api/health` - API health check

## Common commands
```bash
# start/stop
docker compose up -d
docker compose down

# rebuild API image
docker compose build api

# view logs
docker compose logs -f api

# psql into db
docker exec -it crm-postgres psql -U crm -d crm

# test search API
curl -X POST http://localhost:8080/api/places/search \
  -H 'Content-Type: application/json' \
  -d '{"city":"Seattle"}'
```

## Roadmap (MVP → hardening)
1) Place CRUD + search (city/state/name/text), pagination
2) Categories + place-category relationships
3) Pre-signed S3 uploads for images (LocalStack in dev)
4) Submissions + moderation flow
5) Deploy to AWS (ECS+ALB, RDS, S3+CloudFront)
6) Perf tests, alerts, and security hardening

