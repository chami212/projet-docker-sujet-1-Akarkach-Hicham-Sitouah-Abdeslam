FROM node:20-alpine

LABEL maintainer="student" \
      version="0.1.0"

ENV NODE_ENV=production

WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev

COPY src ./src

USER node
EXPOSE 5003

HEALTHCHECK --interval=10s --timeout=3s --retries=5 CMD node -e "fetch('http://localhost:5003/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "src/index.js"]