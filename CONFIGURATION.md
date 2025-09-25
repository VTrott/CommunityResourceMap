# Configuration Setup

This project requires several configuration files to run properly. Follow these steps to set up your local development environment:

## Backend Configuration

1. Copy the template file:
   ```bash
   cp api/src/main/resources/application-local.yml.template api/src/main/resources/application-local.yml
   ```

2. Edit `api/src/main/resources/application-local.yml` and fill in your actual values:
   - `google-maps.api-key`: Your Google Maps API key
   - `google-service-account.path`: Path to your Google Service Account JSON file

## Frontend Configuration

1. Copy the template file:
   ```bash
   cp .env.template .env
   ```

2. Edit `.env` and fill in your actual values:
   - `VITE_GOOGLE_MAPS_API_KEY`: Your Google Maps API key
   - `VITE_API_BASE_URL`: Backend API URL (default: http://localhost:8080/api)

## Google Service Account Setup

1. Download your Google Service Account JSON file from the Google Cloud Console
2. Place it in the project root directory
3. Update the path in `application-local.yml` to point to your JSON file

## Security Note

- Never commit `.env` or `application-local.yml` files to version control
- These files contain sensitive API keys and credentials
- Use the `.template` files as a reference for required configuration

