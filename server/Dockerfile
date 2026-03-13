FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
RUN node db/seed.js
EXPOSE 3001
CMD ["node", "index.js"]
