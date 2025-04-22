FROM node:18 as development

WORKDIR /usr/app/frontend

COPY package.json ./
COPY package-lock.json ./

RUN npm install

COPY . .

RUN npm run build

EXPOSE 5173