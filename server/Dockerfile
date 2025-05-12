FROM node:24-alpine

WORKDIR /app

COPY package.json pnpm-lock.yaml* ./

# Install pnpm and dependencies
RUN npm install -g pnpm && pnpm install

# Copy the source files
COPY . .

# Expose backend port
EXPOSE 8000

# Start server
CMD ["node", "index.js"]
