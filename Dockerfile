FROM node:26.8.1-alpine

ENV NODE_ENV=production

EXPOSE 8000

WORKDIR /app

# Install production dependencies using the locked versions for reproducible builds
# --legacy-peer-deps: koa-xml-body still declares a peer dep on koa@^2, though it
# works fine with koa 3 (no koa-2-specific API surface is used)
COPY package.json package-lock.json ./
RUN set -ex; \
    node --version; \
    npm ci --omit=dev --legacy-peer-deps; \
    npm cache clean --force

# Copy application files
COPY index.js settings.js ./
COPY views ./views

# Ensure the application directory is owned by an unprivileged user and run as that user
RUN chown -R 1000:1000 /app

USER 1000

CMD ["node", "index.js"]