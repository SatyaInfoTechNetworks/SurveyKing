FROM node:20-alpine

WORKDIR /app

# Copy root and package manifests
COPY package.json ./
COPY Frontend/package*.json ./Frontend/
COPY Backend/package*.json ./Backend/

# Install dependencies
RUN npm --prefix Frontend install
RUN npm --prefix Backend install

# Copy application source
COPY . .

# Build Frontend production assets
RUN npm --prefix Frontend run build

# Expose port 5000 / process.env.PORT
EXPOSE 5000

ENV PORT=5000
ENV NODE_ENV=production

# Run backend server
CMD ["node", "Backend/server.js"]
