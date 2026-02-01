FROM node:20-slim

# Install OpenSSL for Prisma
RUN apt-get update -y && apt-get install -y openssl

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build application
RUN npm run build

# Expose port
EXPOSE 3000

# Start application
# We run migrate deploy to ensure schema is applied to the volume-mounted DB
CMD ["sh", "-c", "npx prisma migrate deploy && npm start"]
