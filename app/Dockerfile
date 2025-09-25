FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ENV VITE_API_BASE_URL=https://communitiesresources.com/api
RUN npm run build
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
