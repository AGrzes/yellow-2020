FROM node:10 as build
ADD . /yellow-2020
WORKDIR /yellow-2020
RUN npm ci 
RUN npx lerna bootstrap --ci
WORKDIR /yellow-2020/modules/web/vue/action-dashboard
EXPOSE 9000
CMD npx webpack serve --host 0.0.0.0
