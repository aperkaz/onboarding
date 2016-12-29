FROM node:6.9.1

MAINTAINER dzhitomirsky

#switching to non-root node user, provided by node-container
RUN su node

#Updating OS packages && install required software
RUN apt-get update && apt-get install -y \
    mysql-client

#create app directory
RUN mkdir -p /campaigns

#make /campaigns work directory
WORKDIR /campaigns

#mount sources to campaigns
ADD . /campaigns

#Marking wait-for-db script as executable
RUN chmod +x ./wait-for-db

#define some variables
ARG APP_PORT=3002

#set environment variables
ENV PORT $APP_PORT
ENV HOST 0.0.0.0
ENV NODE_ENV $NODE_ENV

#install dependencies
RUN npm install

EXPOSE $APP_PORT

CMD [ "npm", "start" ]

ENTRYPOINT [ "./wait-for-db", "mysql" ]
