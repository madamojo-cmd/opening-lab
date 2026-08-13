# syntax=docker/dockerfile:1.7

FROM debian:12.13-slim AS lc0-builder

ARG LC0_COMMIT=fd71a2d921b689c5f479d3227c3806c8e272d9c5
RUN apt-get update \
  && apt-get install -y --no-install-recommends \
    build-essential ca-certificates git libopenblas-dev libprotobuf-dev \
    meson ninja-build pkg-config protobuf-compiler zlib1g-dev \
  && rm -rf /var/lib/apt/lists/*
RUN git init /src/lc0 \
  && git -C /src/lc0 remote add origin https://github.com/LeelaChessZero/lc0.git \
  && git -C /src/lc0 fetch --depth=1 origin "${LC0_COMMIT}" \
  && git -C /src/lc0 checkout --detach "${LC0_COMMIT}" \
  && git -C /src/lc0 submodule update --init --recursive --depth=1
WORKDIR /src/lc0
RUN test "$(git rev-parse HEAD)" = "${LC0_COMMIT}" \
  && INSTALL_PREFIX=/opt/lc0 ./build.sh release \
    -Dgtest=false \
    -Dnative_arch=false \
    -Dispc=false \
    -Dblas=true \
    -Dopenblas=true \
    -Dplain_cuda=false \
    -Dcudnn=false \
    -Dopencl=false \
    -Donnx=false \
    -Ddag_classic=false \
    -Ddefault_search=classic \
  && /opt/lc0/bin/lc0 --help 2>&1 | grep -Fq '0.32.1+git.fd71a2d'

FROM node:24.14.0-bookworm-slim AS model-fetcher
WORKDIR /service
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts
COPY model-manifest.json ./
COPY src/contracts.mjs src/manifest.mjs ./src/
COPY scripts/fetch-models.mjs ./scripts/
RUN node scripts/fetch-models.mjs /models /licenses

FROM node:24.14.0-bookworm-slim AS runtime
RUN apt-get update \
  && apt-get install -y --no-install-recommends \
    ca-certificates libopenblas0-pthread libprotobuf32 tini \
  && rm -rf /var/lib/apt/lists/* \
  && groupadd --system --gid 10001 maia \
  && useradd --system --uid 10001 --gid maia --home-dir /service --shell /usr/sbin/nologin maia
WORKDIR /service
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts && npm cache clean --force
COPY model-manifest.json ./
COPY src ./src
COPY --from=lc0-builder /opt/lc0/bin/lc0 /usr/local/bin/lc0
COPY --from=lc0-builder /src/lc0/COPYING /usr/share/licenses/lc0/COPYING
COPY --from=model-fetcher /models /opt/maia/models
COPY --from=model-fetcher /licenses /usr/share/licenses/maia-chess
RUN chown -R maia:maia /service /opt/maia \
  && chmod 0555 /usr/local/bin/lc0 \
  && find /opt/maia/models -type f -exec chmod 0444 {} +

ENV NODE_ENV=production \
  HOST=0.0.0.0 \
  PORT=8080 \
  MAIA_LC0_PATH=/usr/local/bin/lc0 \
  MAIA_MODEL_DIR=/opt/maia/models \
  MAIA_BACKEND=blas \
  MAIA_REQUEST_TIMEOUT_MS=2500 \
  MAIA_STARTUP_TIMEOUT_MS=30000 \
  MAIA_QUEUE_LIMIT=32 \
  MAIA_MAX_WARM_WORKERS=3 \
  MAIA_PREWARM_SKILLS=maia-1100,maia-1500,maia-1900
USER maia
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s --start-period=45s --retries=3 \
  CMD ["node", "src/healthcheck.mjs"]
ENTRYPOINT ["/usr/bin/tini", "--"]
CMD ["node", "src/index.mjs"]
