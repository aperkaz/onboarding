FROM node:7-alpine
MAINTAINER patrykkopycinski

WORKDIR /home/node/onboarding

RUN apk add --no-cache rsync curl git

# use changes to package.json to force Docker not to use the cache
# when we change our application's nodejs dependencies:
ADD package.json yarn.lock /tmp/
RUN cd /tmp && yarn
RUN mkdir -p /home/node/onboarding && cp -a /tmp/node_modules /home/node/onboarding/

# From here we load our application's code in, therefore the previous docker
# "layer" thats been cached will be used if possible
ADD . /home/node/onboarding

RUN yarn run build:client

# A container must expose a port if it wants to be registered in Consul by Registrator.
# The port is fed both to node express server and Consul => DRY principle is observed with ENV VAR.
# NOTE: a port can be any, not necessarily different from exposed ports of other containers.
EXPOSE 3002

CMD [ "npm", "start" ]
