FROM node:20-alpine

LABEL maintainer="student" \
      version="0.1.0"

ENV NODE_ENV=production

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY pages ./pages
COPY next.config.js ./

RUN npm run build
RUN chown -R node:node /app

USER node
EXPOSE 3000

HEALTHCHECK --interval=10s --timeout=3s --retries=5 CMD node -e "fetch('http://localhost:3000').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["npm", "run", "start"]