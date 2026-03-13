FROM nginxinc/nginx-unprivileged:1.25-alpine

LABEL maintainer="student" \
      version="0.1.0"

RUN apk add --no-cache wget

COPY nginx.conf /etc/nginx/nginx.conf

USER nginx
EXPOSE 8080

HEALTHCHECK --interval=10s --timeout=3s --retries=5 CMD wget -q -O - http://localhost:8080/health || exit 1