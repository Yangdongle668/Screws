FROM node:24-alpine AS build
WORKDIR /app
COPY package.json package-lock.json .npmrc ./
RUN npm ci --no-audit --no-fund
COPY smtp-bridge/package.json smtp-bridge/package-lock.json ./smtp-bridge/
RUN cd smtp-bridge && npm ci --no-audit --no-fund
COPY . .
ARG PUBLIC_URL
ENV PUBLIC_URL=${PUBLIC_URL}
RUN node docker/build.mjs --configure-only && node scripts/generate-site.mjs && node scripts/verify-content.mjs && node scripts/verify-multilingual.mjs && node scripts/verify-language-preference.mjs && node scripts/verify-images.mjs && node scripts/verify-sector-images.mjs && node scripts/verify-priorities.mjs && node docker/build.mjs

FROM node:24-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production PORT=3000 DATA_DIRECTORY=/data
COPY --from=build --chown=node:node /app/dist/docker ./dist/docker
COPY --from=build --chown=node:node /app/docker ./docker
COPY --from=build --chown=node:node /app/public ./public
COPY --from=build --chown=node:node /app/drizzle ./drizzle
RUN mkdir /data && chown node:node /data
USER node
EXPOSE 3000
HEALTHCHECK --interval=15s --timeout=5s --start-period=30s --retries=4 CMD node -e "fetch('http://127.0.0.1:3000/healthz').then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))"
CMD ["node","docker/server.mjs"]
