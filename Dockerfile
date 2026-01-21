# Base image
FROM node:18-bullseye

# Install ffmpeg (includes ffprobe)
RUN apt-get update && apt-get install -y ffmpeg \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy dependency files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build Next.js
RUN npm run build

# Generate Prisma client with correct binary targets
RUN npx prisma generate

# Expose port
EXPOSE 3000

# Start production server
CMD ["npm", "start"]
