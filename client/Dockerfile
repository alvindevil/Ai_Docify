# Use Node 18 / slim base image
FROM node:slim

# Set working directory
WORKDIR /app

# Copy dependencies
COPY package.json package-lock.json* ./  

# Install deps
RUN npm install

# Copy full app
COPY . .

# Build Next.js app
RUN npm run build

# Expose port for next start (defaults to 3000)
EXPOSE 3000

# Start the app
CMD ["npm", "start"]
