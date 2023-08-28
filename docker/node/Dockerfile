FROM node:18.16.0-slim

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
