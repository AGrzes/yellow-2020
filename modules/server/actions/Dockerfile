FROM node:12 as build
ADD package.json package-lock.json tsconfig.json /actions/
WORKDIR /actions
RUN npm ci 
ADD src /actions/src/
RUN npm run build 
EXPOSE 3000
CMD DEBUG=* npm start
