FROM node:6.9.1

MAINTAINER dzhitomirsky

#switching to non-root node user, provided by node-container
RUN su node

#Updating OS packages && install required software
RUN apt-get update && apt-get install -y \
    mysql-client

#create app directory
RUN mkdir -p /campings

#mount sources to campaigns
ADD . /campings

#make /campaigns work directory
WORKDIR /campings

#Marking wait-for-db script as executable
RUN chmod +x ./wait-for-db

#define some variables
ARG APP_PORT=3001

#set environment variables
ENV PORT $APP_PORT
ENV HOST 0.0.0.0
ENV NODE_ENV development

#install dependencies
RUN npm install

EXPOSE $APP_PORT

CMD [ "npm", "start" ]

ENTRYPOINT [ "./wait-for-db", "mysql" ]
