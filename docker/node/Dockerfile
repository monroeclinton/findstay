FROM node:18.18.1-slim

# Install requirements
RUN apt-get update && apt-get install -y ca-certificates && update-ca-certificates

WORKDIR /home/node/web

COPY ./package*.json ./
# Prisma is needed for postinstall script
COPY ./prisma ./prisma
COPY ./.env ./.env

RUN chown -R node ../
USER node

RUN npm i
