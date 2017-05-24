FROM node:6-alpine
MAINTAINER patrykkopycinski

WORKDIR /home/node/onboarding

# Bundle app source by overwriting all WORKDIR content.
COPY . tmp

# Change owner since COPY/ADD assignes UID/GID 0 to all copied content.
RUN apk add --no-cache rsync curl git
RUN chown -Rf node:node tmp; rsync -a tmp/ ./ && rm -rf tmp

# Set the user name or UID to use when running the image and for any RUN, CMD and ENTRYPOINT instructions that follow
USER node

RUN yarn
RUN yarn run build:client

# A container must expose a port if it wants to be registered in Consul by Registrator.
# The port is fed both to node express server and Consul => DRY principle is observed with ENV VAR.
# NOTE: a port can be any, not necessarily different from exposed ports of other containers.
EXPOSE 3002
CMD [ "npm", "start"]
