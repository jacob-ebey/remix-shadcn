# base node image
FROM node:20-bullseye-slim as base

# set for base and all layer that inherit from it
ENV NODE_ENV production

# Install all node_modules, including dev
FROM base as deps

WORKDIR /remixapp

ADD package.json package-lock.json ./
RUN npm install --include=dev

# Setup production node_modules
FROM base as production-deps

WORKDIR /remixapp

COPY --from=deps /remixapp/node_modules /remixapp/node_modules
ADD package.json package-lock.json ./
RUN npm prune --omit=dev

# Build the app
FROM base as build

WORKDIR /remixapp

COPY --from=deps /remixapp/node_modules /remixapp/node_modules
ADD package.json package-lock.json postcss.config.js tailwind.config.cjs tsconfig.json vite.config.ts ./
ADD app/ app/
ADD public/ public/

RUN npm run build

# Finally, build the production image with minimal footprint
FROM base

WORKDIR /remixapp

COPY --from=production-deps /remixapp/node_modules /remixapp/node_modules
COPY --from=build /remixapp/build /remixapp/build
COPY --from=build /remixapp/package.json /remixapp/package.json

ADD server.js ./
ADD migrations/ migrations/

CMD ["npm", "start"]
