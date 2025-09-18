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
- **Places Import**: Import verified community resources from OpenStreetMap

**For Organizations:**
- **Easy Submission**: Add new resources or update existing ones
- **Verification Process**: Community-moderated content ensures accuracy
- **Analytics**: Track how your services are discovered

**For Administrators:**
- **Moderation Queue**: Review and approve community submissions
- **Usage Insights**: Monitor popular resources and search patterns
- **Quality Control**: Maintain data accuracy and prevent spam
- **Bulk Import**: Import verified places from OpenStreetMap with one click

### Resource Categories
- **Food Assistance** (food banks, meal programs, SNAP enrollment)
- **Healthcare** (free clinics, mental health services, dental care)
- **Housing** (shelters, transitional housing, rental assistance)
- **Legal Aid** (pro bono services, tenant rights, immigration)
- **Family Services** (childcare, parenting support, youth programs)
- **Employment** (job training, resume help, career counseling)
- **Education** (GED programs, ESL classes, computer literacy)

## Stack
- **Frontend**: React + TypeScript (Vite), React Router, TanStack Query, React Hook Form, Zod, Tailwind CSS
- **Backend**: Spring Boot 3 (Java 21), JPA/Hibernate, Flyway, Actuator
- **Database**: PostgreSQL 16
- **External APIs**: OpenStreetMap Nominatim (places data)
- **Local Dev**: Docker Compose
- **UI Framework**: Tailwind CSS with custom component library

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

**Features:**
- **Modern UI**: Professional design with Tailwind CSS
- **Responsive Layout**: Works on desktop, tablet, and mobile
- **Component Library**: Reusable UI components (Button, Input, Card, etc.)
- **Form Validation**: Client-side validation with Zod and React Hook Form
- **Real-time Search**: Live search with filters and pagination
- **Category Support**: Filter and assign categories to places
- **Places Import**: Import verified community resources from OpenStreetMap
- **Type Safety**: Full TypeScript integration throughout

**File Structure:**
```
app/src/
├── components/
│   ├── ui/           # Reusable UI components
│   └── forms/        # Form components
├── hooks/            # Custom React hooks
├── services/         # API services
├── types/            # TypeScript type definitions
└── pages/            # Page components
```

Vite proxy forwards `/api/*` to `http://localhost:8080`. Configure via `app/vite.config.ts`. Optional: set `VITE_API_URL`.

## Frontend Features

### Modern UI Design
- **Professional Interface**: Clean, modern design with Tailwind CSS
- **Responsive Layout**: Optimized for desktop, tablet, and mobile devices
- **Component Library**: Reusable UI components for consistency
- **Loading States**: Smooth loading indicators and error handling
- **Form Validation**: Real-time validation with helpful error messages

### Advanced Search & Filtering
- **Multi-criteria Search**: Filter by name, city, state, status, and categories
- **Real-time Results**: Instant search with pagination
- **Category Filtering**: Select multiple categories to narrow results
- **Sort Options**: Sort by name, date, or other fields
- **Pagination**: Navigate through large result sets

### Place Management
- **Add Places**: Comprehensive form with validation
- **Edit Places**: Update existing place information
- **Delete Places**: Safe deletion with confirmation
- **Category Assignment**: Assign multiple categories to places
- **Status Management**: Mark places as active or inactive
- **Places Import**: Import verified places from OpenStreetMap with one click

### Category System
- **Category Selection**: Multi-select category picker in forms
- **Category Display**: Visual category badges on place cards
- **Category Filtering**: Filter search results by categories
- **Ready for Backend**: Frontend fully prepared for category CRUD operations

### Developer Experience
- **TypeScript**: Full type safety throughout the application
- **Custom Hooks**: Reusable data fetching and state management
- **Modular Architecture**: Well-organized file structure for maintainability
- **Hot Reload**: Fast development with Vite's hot module replacement

## Application Screens

### Home Page
- Welcome screen with call-to-action
- Navigation to main features
- Clean, professional landing page

### Places Page
- **Search Interface**: Multi-criteria search form with filters
- **Results Display**: Card-based layout showing place details
- **Add Place Form**: Comprehensive form for adding new places
- **Category Management**: Visual category assignment and filtering
- **Pagination**: Navigate through search results
- **Places Import**: Import verified community resources from OpenStreetMap

###  Health Page
- **API Status**: Real-time backend health monitoring
- **Test Interface**: Echo functionality for API testing
- **Service Indicators**: Visual status indicators

### Navigation
- **Responsive Menu**: Clean navigation with active page indicators
- **Mobile-Friendly**: Collapsible menu for mobile devices
- **Breadcrumbs**: Clear navigation hierarchy

## Usage Examples

### Adding a New Place
1. Navigate to the Places page
2. Click "Add Place" button
3. Fill in the required information (name is required)
4. Select categories if applicable
5. Add contact information and location details
6. Click "Add Place" to save

### Importing Places from OpenStreetMap
1. Navigate to the Places page
2. Click "Import from Map" button
3. Enter city and state (e.g., "Seattle", "WA")
4. Select resource type (e.g., "Food Banks", "Healthcare")
5. Click "Search for [resource type]"
6. Select places you want to import
7. Click "Import Selected" to add them to your database

### Searching Places
1. Use the search form to filter by:
   - Name (partial match)
   - City and state
   - Status (active/inactive)
   - Categories (multiple selection)
2. Results update in real-time
3. Use pagination to browse through results

### Managing Categories
- **10 Pre-loaded Categories**: Food Assistance, Healthcare, Housing, Legal Aid, Family Services, Employment, Education, Mental Health, Emergency Services, Community Centers
- **Category Display**: Categories shown as colored badges on place cards
- **Search Filtering**: Use category checkboxes in search to filter results
- **Place Assignment**: Assign multiple categories to places during creation/editing
- **Category Management**: Full CRUD operations for categories via API

### Places Import from OpenStreetMap
- **Free API Integration**: No API key required, uses OpenStreetMap Nominatim
- **Resource Types**: Food banks, healthcare facilities, shelters, community centers, libraries
- **Location Search**: Search by city and state to find local resources
- **Bulk Selection**: Select multiple places to import at once
- **Data Enrichment**: Automatically extracts phone numbers, websites, and addresses
- **Category Mapping**: Maps OSM amenity types to your existing categories
- **Rate Limiting**: Respects API guidelines with 1 request per second

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

### Categories
- `GET /api/categories` - List all categories
- `GET /api/categories/{id}` - Get category by ID
- `GET /api/categories/search?name=...` - Search categories by name
- `POST /api/categories` - Create new category
- `PUT /api/categories/{id}` - Update category
- `DELETE /api/categories/{id}` - Delete category

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
- `categoryIds` (array): Filter by category IDs
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

## Category API Examples

```bash
# Get all categories
curl http://localhost:8080/api/categories

# Search categories by name
curl "http://localhost:8080/api/categories/search?name=health"

# Create a new category
curl -X POST http://localhost:8080/api/categories \
  -H 'Content-Type: application/json' \
  -d '{"name":"Transportation", "slug":"transportation"}'

# Update a category
curl -X PUT http://localhost:8080/api/categories/{id} \
  -H 'Content-Type: application/json' \
  -d '{"name":"Updated Name", "slug":"updated-slug"}'

# Delete a category
curl -X DELETE http://localhost:8080/api/categories/{id}
```

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

# test categories API
curl http://localhost:8080/api/categories

# test category search
curl -X POST http://localhost:8080/api/places/search \
  -H 'Content-Type: application/json' \
  -d '{"categoryIds":["1db71ea9-4386-4087-96ba-bf0996136ebb"]}'
```

## Roadmap (MVP → hardening)
1) ✅ **Place CRUD + search** (city/state/name/text), pagination
2) ✅ **Frontend UI/UX** - Modern design with Tailwind CSS, component library, responsive layout
3) ✅ **Categories Support** - Frontend ready for category filtering and assignment
4) ✅ **Categories Backend** - Full category CRUD endpoints and place-category relationships
5) ✅ **Places Import** - OpenStreetMap integration for importing verified community resources
6) **Pre-signed S3 uploads** for images (LocalStack in dev)
7) **Submissions + moderation flow**
8) **Deploy to AWS** (ECS+ALB, RDS, S3+CloudFront)
9) **Perf tests, alerts, and security hardening**

## Current Status
- ✅ **Backend**: Full Place CRUD API with search, pagination, and filtering
- ✅ **Frontend**: Professional UI with search, forms, and category support
- ✅ **Categories**: Complete backend implementation with 10 sample categories
- ✅ **Places Import**: OpenStreetMap integration for importing verified community resources
- ✅ **Database**: PostgreSQL with Flyway migrations
- ✅ **Development**: Docker Compose setup for local development
- 🔄 **Next**: Image uploads and submission workflow

