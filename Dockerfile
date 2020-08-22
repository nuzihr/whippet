FROM node:14.8-alpine AS builder
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build

FROM node:14.8-alpine
WORKDIR /app
COPY --from=builder /app/dist .
CMD ["npm", "run", "start"]
