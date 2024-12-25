# Stage 1: Install dependencies and build the application
FROM node:20 as builder

# Set the working directory inside the container
WORKDIR /app

# Copy only package.json and pnpm-lock.yaml for efficient caching
COPY package.json pnpm-lock.yaml ./

# Install pnpm globally
RUN npm install -g pnpm

# Install all dependencies
RUN pnpm install

# Copy the rest of the application files
COPY . .

# Build the application
RUN pnpm run build

# Stage 2: Create a lightweight production image
FROM node:20-slim

# Set the working directory inside the container
WORKDIR /app

# Install pnpm globally in the production image
RUN npm install -g pnpm

# Copy only package.json and pnpm-lock.yaml for production installation
COPY package.json pnpm-lock.yaml ./

# Install only production dependencies
RUN pnpm install --prod --frozen-lockfile

# Copy the built application
COPY --from=builder /app/dist ./dist

# Expose the port the app runs on
EXPOSE 3000

# Command to run the application
CMD ["node", "dist/index.js"]
