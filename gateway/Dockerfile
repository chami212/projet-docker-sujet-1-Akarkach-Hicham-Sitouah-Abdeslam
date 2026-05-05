FROM nginxinc/nginx-unprivileged:1.25-alpine

LABEL maintainer="student" \
      version="0.1.0"

COPY nginx.conf /etc/nginx/nginx.conf

USER nginx
EXPOSE 8080

HEALTHCHECK --interval=10s --timeout=3s --retries=5 CMD /bin/busybox wget -q -O - http://127.0.0.1:8080/health || exit 1
