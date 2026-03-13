FROM nginxinc/nginx-unprivileged:1.25-alpine

USER root
RUN apk add --no-cache wget

COPY nginx.conf /etc/nginx/nginx.conf

USER nginx

EXPOSE 80