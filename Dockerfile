# Use Node.js as the base image
FROM node:18 as builder

# Set the working directory
WORKDIR /app

# Copy package.json and yarn-lock.json
COPY package*.json ./

COPY yarn.lock ./

ARG VITE_KEYCLOAK_URL
ARG VITE_KEYCLOAK_REALM
ARG VITE_KEYCLOAK_CLIENT
ARG VITE_API_BASE_URL

ENV VITE_KEYCLOAK_URL=$VITE_KEYCLOAK_URL
ENV VITE_KEYCLOAK_REALM=$VITE_KEYCLOAK_REALM
ENV VITE_KEYCLOAK_CLIENT=$VITE_KEYCLOAK_CLIENT
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

# Install dependencies
RUN yarn install

# Copy the rest of the source code
COPY . .

# Build the React app
RUN yarn build

FROM nginx:1.19.6-alpine

ARG VITE_KEYCLOAK_URL
ARG VITE_KEYCLOAK_REALM
ARG VITE_KEYCLOAK_CLIENT
ARG VITE_API_BASE_URL
ARG VITE_AUTH_SECRET

ENV VITE_KEYCLOAK_URL=$VITE_KEYCLOAK_URL
ENV VITE_KEYCLOAK_REALM=$VITE_KEYCLOAK_REALM
ENV VITE_KEYCLOAK_CLIENT=$VITE_KEYCLOAK_CLIENT
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

# Copy the nginx configuration
COPY nginx.conf.1.template /etc/nginx/nginx.conf.1.template

RUN envsubst '${VITE_API_BASE_URL}, ${VITE_KEYCLOAK_URL}' < /etc/nginx/nginx.conf.1.template > /etc/nginx/nginx.conf

WORKDIR /usr/share/nginx/html

RUN rm -rf ./*

COPY --from=builder /app/dist .

# Expose the port
EXPOSE 5173
