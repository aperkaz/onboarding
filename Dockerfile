FROM node:6.9.1

MAINTAINER dzhitomirsky

#switching to non-root node user, provided by node-container
RUN su node

#create app directory
RUN mkdir -p /campaigns

#make /campaigns work directory
WORKDIR /campaigns

#mount sources to campaigns
ADD . /campaigns

#define some variables
ARG APP_PORT=3002

#set environment variables
ENV HOST 0.0.0.0
ENV NODE_ENV $NODE_ENV

#install dependencies
RUN npm install

CMD [ "npm", "start" ]
