# CommunityConnect

A web application that helps people discover and access community resources in their area. Whether you're looking for food assistance, healthcare, housing support, or legal aid, CommunityConnect connects you with verified local organizations and services.

## Product Overview

**Problem**: Finding reliable community resources can be difficult, especially during times of need. Information is often scattered across multiple websites, outdated, or hard to discover.

**Solution**: CommunityConnect provides a centralized, searchable map of community resources with real-time information, user submissions, and community moderation.

### Key Features

**For Community Members:**
- **Interactive Map**: Browse resources by location with visual markers
- **Location-Based Search**: Enter your address to find resources within 10-50 miles
- **Smart Search**: Find resources by name, category, or keywords
- **Category Filtering**: Filter by resource type with color-coded map markers
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
- **External APIs**: OpenStreetMap Nominatim (places data), Google Maps (interactive maps & geocoding)
- **Local Dev**: Docker Compose
- **UI Framework**: Tailwind CSS with custom component library
- **Testing**: Vitest + Testing Library with comprehensive test coverage

## 🚀 Live Application

**Your CommunityConnect application is live at:**
- **Frontend**: https://communitiesresources.com
- **API**: https://communitiesresources.com/api/
- **Health Check**: https://communitiesresources.com/api/health

## 🛠️ Local Development

### Quick start (Docker Compose)
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

## Google Maps Integration

The application features comprehensive Google Maps integration with advanced search capabilities:

### Map Features
- **Auto-Zoom**: Map automatically centers and zooms to your search location
- **City Details**: See actual city names, streets, and landmarks instead of just coordinates
- **Search Markers**: Green marker shows your search location
- **User Location**: Blue marker shows your current location (if available)
- **Radius Circle**: Visual circle showing search area
- **Interactive Controls**: Full zoom, pan, and street view capabilities
- **Category Markers**: Color-coded markers by resource category
- **Popup Details**: Click markers to see place information
- **View Toggle**: Switch between map and list views

### Google Places API Integration
- **Category Mapping**: Automatic mapping of Google Places types to community resource categories
- **Radius-based Search**: Search within 5, 10, 25, or 50 miles
- **Real-time Results**: Live search results with instant updates
- **Place Details**: Comprehensive place information including contact details
- **Category Filtering**: Filter results by specific resource categories

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
- **Location-Based Search**: Find resources near your address with radius controls
- **Interactive Maps**: Full Google Maps integration with auto-zoom, city details, and color-coded category markers
- **Category Support**: Filter and assign categories to places
- **Places Import**: Import verified community resources from OpenStreetMap
- **Type Safety**: Full TypeScript integration throughout
- **Comprehensive Testing**: Vitest + Testing Library with 21 passing tests

**File Structure:**
```
app/src/
├── components/
│   ├── ui/           # Reusable UI components
│   ├── forms/        # Form components
│   └── __tests__/    # Component tests
├── hooks/            # Custom React hooks
├── services/         # API services
│   └── __tests__/    # Service tests
├── types/            # TypeScript type definitions
├── utils/            # Utility functions and test helpers
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
- **Location-Based Search**: Enter your address to find resources within 10-50 miles
- **Interactive Maps**: Google Maps with auto-zoom to search location, city details, and color-coded markers by category
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

### Enhanced User Experience
- **Current Location**: GPS location detection with automatic geocoding
- **Distance Display**: Shows distance from user location to each place
- **Smart Sorting**: Places automatically sorted by distance from user
- **Loading Skeletons**: Professional loading states for better perceived performance
- **Error Boundaries**: Graceful error handling with user-friendly fallbacks
- **Mobile Navigation**: Responsive mobile menu with hamburger navigation
- **Keyboard Shortcuts**: Power user features (Ctrl+/ for search, Escape, etc.)
- **Print Support**: Print-friendly layout for resource lists
- **Lazy Loading**: Code splitting for faster initial page loads
- **Advanced Address Input**: Separate fields for street, city, state, and zip code
- **Real-time Validation**: Form validation with helpful error messages
- **View Mode Toggle**: Switch between map and list views seamlessly
- **Interactive Map Markers**: Color-coded markers by category with popup details
- **Radius Visualization**: Visual circle showing search area on map

### Testing Infrastructure
- **Vitest Integration**: Fast, modern testing framework with Vite integration
- **Testing Library**: Component testing with user-centric testing utilities
- **Comprehensive Coverage**: 32 passing tests covering components, services, and utilities
- **Mock Support**: Complete mocking setup for external APIs and services
- **Test Utilities**: Custom test helpers with providers and mock data
- **Type Safety**: Full TypeScript support in tests with proper typing
- **Service Testing**: Complete test coverage for API services and geocoding
- **Hook Testing**: Custom React hooks tested with proper query client setup
- **Component Testing**: UI components tested with user interactions and state changes

## Application Screens

### Home Page
- Welcome screen with call-to-action
- Navigation to main features
- Clean, professional landing page

### Find Resources Page
- **Address Input**: Enter your address to find nearby resources
- **Current Location**: GPS location detection with one-click geocoding
- **Radius Selection**: Choose search radius (10, 15, 25, or 50 miles)
- **Category Filtering**: Filter by resource type with visual indicators
- **Interactive Map**: Google Maps with auto-zoom to search location, city details, and color-coded markers by category
- **List View**: Traditional list view as alternative to map
- **Distance Display**: Shows exact distance from your location to each place
- **Smart Sorting**: Results automatically sorted by distance
- **Loading States**: Professional skeleton loading for smooth experience
- **Print Support**: Print-friendly resource lists
- **Real-time Search**: Instant results as you type and filter

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
- **Mobile-Friendly**: Collapsible hamburger menu for mobile devices
- **Keyboard Shortcuts**: Power user navigation (Ctrl+/ to focus search, Escape to clear)
- **Breadcrumbs**: Clear navigation hierarchy

## Usage Examples

### Finding Resources Near You 
1. Navigate to the "Find Resources" page
2. **Option A**: Enter your address (e.g., "123 Main St, City, State")
3. **Option B**: Click the 📍 button to use your current GPS location
4. Click "Find Location" to geocode your address (or auto-geocode with GPS)
5. **Map Auto-Zoom**: The map automatically centers and zooms to your search location
6. Select your search radius (10, 15, 25, or 50 miles)
7. Optionally filter by categories (Food Assistance, Healthcare, etc.)
8. Click "Search Nearby Places" to find resources
9. **Interactive Map**: See city details, streets, and landmarks with color-coded markers
10. Switch between Map View and List View to explore results
11. Results show exact distance from your location
12. Use keyboard shortcuts (Ctrl+/ to focus search, Escape to clear)
13. Print your results using the print button

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

### Places Import System
- **OpenStreetMap Integration**: Free API integration using Nominatim
- **Google Places Integration**: Advanced search using Google Places API
- **Resource Types**: Food banks, healthcare facilities, shelters, community centers, libraries, social services
- **Location Search**: Search by city and state to find local resources
- **Bulk Selection**: Select multiple places to import at once
- **Data Enrichment**: Automatically extracts phone numbers, websites, and addresses
- **Category Mapping**: Maps OSM amenity types and Google Places types to existing categories
- **Rate Limiting**: Respects API guidelines with proper rate limiting
- **Real-time Preview**: See place details before importing
- **Batch Import**: Import multiple places in a single operation
- **Error Handling**: Graceful handling of import failures with detailed feedback

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
- `POST /api/places/search/location` - Location-based search with radius

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

### Location-based Search API
Advanced location-based search with Google Places integration:

```bash
# Search within 10 miles of coordinates
curl -X POST http://localhost:8080/api/places/search/10-miles \
  -H 'Content-Type: application/json' \
  -d '{"latitude":47.6062,"longitude":-122.3321,"categoryIds":["1","2"]}'

# Search within 25 miles
curl -X POST http://localhost:8080/api/places/search/25-miles \
  -H 'Content-Type: application/json' \
  -d '{"latitude":47.6062,"longitude":-122.3321}'
```

### Google Places Integration
- **Category Mapping**: Automatic mapping of Google Places types to community categories
- **Radius Endpoints**: Dedicated endpoints for 5, 10, 25, and 50-mile searches
- **Place Details**: Comprehensive place information including ratings and reviews
- **Category Filtering**: Filter results by specific resource categories
- **Real-time Search**: Live search results with instant updates

**Search Request Parameters:**
- `city` (string): Filter by city (partial match, case-insensitive)
- `state` (string): Filter by state (partial match, case-insensitive)
- `name` (string): Filter by place name (partial match, case-insensitive)
- `status` (string): Filter by status (exact match, default: "active")
- `categoryIds` (array): Filter by category IDs
- `latitude` (number): Center latitude for location-based search
- `longitude` (number): Center longitude for location-based search
- `radiusMiles` (number): Search radius in miles for location-based search
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

# frontend testing
cd app
npm test              # run tests in watch mode
npm run test:run      # run tests once
```

## ☁️ AWS Deployment

This application is deployed on AWS using Terraform with a cost-optimized free tier configuration:

### Infrastructure
- **ECS Fargate**: Containerized Spring Boot API and React frontend
- **RDS PostgreSQL**: Managed database with automatic backups
- **Application Load Balancer**: SSL termination and traffic routing
- **Route 53**: DNS management for custom domain
- **CloudWatch**: Monitoring, logging, and alerts
- **ECR**: Container image registry

### Cost Optimization
- **Free Tier Eligible**: Designed to stay within AWS Free Tier limits
- **Estimated Cost**: $0-15/month
- **Auto Scaling**: Single instance configuration for cost efficiency
- **Monitoring**: CloudWatch dashboard and alerts included

### Deployment
See [DEPLOY_FREE.md](DEPLOY_FREE.md) for complete deployment instructions.

## Roadmap (MVP → hardening)
1) ✅ **Place CRUD + search** (city/state/name/text), pagination
2) ✅ **Frontend UI/UX** - Modern design with Tailwind CSS, component library, responsive layout
3) ✅ **Categories Support** - Frontend ready for category filtering and assignment
4) ✅ **Categories Backend** - Full category CRUD endpoints and place-category relationships
5) ✅ **Places Import** - OpenStreetMap integration for importing verified community resources
6) ✅ **Location-Based Search** - Address geocoding, radius search, Google Maps with auto-zoom
7) ✅ **AWS Deployment** - Production deployment with SSL, monitoring, and cost optimization
8) **Pre-signed S3 uploads** for images (LocalStack in dev)
9) **Submissions + moderation flow**
10) **Perf tests, alerts, and security hardening**

## Current Status
- ✅ **Backend**: Full Place CRUD API with search, pagination, and filtering
- ✅ **Frontend**: Professional UI with search, forms, and category support
- ✅ **Categories**: Complete backend implementation with 10 sample categories
- ✅ **Places Import**: OpenStreetMap integration for importing verified community resources
- ✅ **Location Search**: Address geocoding, radius-based search, Google Maps with auto-zoom
- ✅ **Enhanced UX**: GPS location, distance display, smart sorting, loading states
- ✅ **Mobile Support**: Responsive design with mobile navigation
- ✅ **Performance**: Lazy loading, error boundaries, and optimized rendering
- ✅ **Testing**: Comprehensive test suite with Vitest 
- ✅ **Database**: PostgreSQL with Flyway migrations
- ✅ **Development**: Docker Compose setup for local development
- ✅ **Google Maps Integration**: Full Google Places API integration with category mapping
- ✅ **Advanced Search**: Multi-criteria search with real-time filtering
- ✅ **Import System**: Bulk import from OpenStreetMap with category mapping
- ✅ **Keyboard Shortcuts**: Power user features for enhanced productivity
- ✅ **Print Support**: Print-friendly resource lists
- ✅ **AWS Deployment**: Production deployment with SSL, monitoring, and cost optimization
- ✅ **Live Application**: https://communitiesresources.com
- 🔄 **Next**: Image uploads and submission workflow

