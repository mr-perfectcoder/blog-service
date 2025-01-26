# Dockerfile
FROM node:18

# Set working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install --production

# Copy the application files
COPY . .

# Accept environment variables as arguments
ARG DATABASE_URL
ARG GOOGLE_OAUTH_CLIENT_ID
ARG GOOGLE_OAUTH_CLIENT_SECRET
ARG GOOGLE_OAUTH_CALLBACK_URL
ARG JWT_SECRET
ARG JWT_EXPIRE_IN
ARG AWS_ACCESS_KEY_ID
ARG AWS_SECRET_ACCESS_KEY
ARG AWS_REGION

# Set environment variables
ENV DATABASE_URL=$DATABASE_URL
ENV GOOGLE_OAUTH_CLIENT_ID=$GOOGLE_OAUTH_CLIENT_ID
ENV GOOGLE_OAUTH_CLIENT_SECRET=$GOOGLE_OAUTH_CLIENT_SECRET
ENV GOOGLE_OAUTH_CALLBACK_URL=$GOOGLE_OAUTH_CALLBACK_URL
ENV JWT_SECRET=$JWT_SECRET
ENV JWT_EXPIRE_IN=$JWT_EXPIRE_IN
ENV AWS_ACCESS_KEY_ID=$AWS_ACCESS_KEY_ID
ENV AWS_SECRET_ACCESS_KEY=$AWS_SECRET_ACCESS_KEY
ENV AWS_REGION=$AWS_REGION

# Expose the application port
EXPOSE 3000

# Build the application
RUN npm run build

# Start the application
CMD ["npm", "run", "start:prod"]
