FROM node:24-alpine
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && mkdir /data && chown node:node /data
COPY core.mjs server.mjs ./
USER node
ENV HOST=0.0.0.0 PORT=3001 STATE_DIRECTORY=/data
EXPOSE 3001
CMD ["node","server.mjs"]
