FROM node:20-bookworm

WORKDIR /app
COPY package*.json ./
RUN npm install --registry=https://registry.npmjs.org/

COPY . .

# NOTE: lc0 installation is environment/platform dependent.
# Provide lc0 binary via image customization or mounted volume.

ENV NEXT_PUBLIC_MAIA_API_ENABLED=true
ENV MAIA_ENABLED=true
ENV MAIA_TIMEOUT_MS=1500
ENV MAIA_NODES=1

EXPOSE 3000
CMD ["npm", "run", "start"]
