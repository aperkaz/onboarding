FROM opuscapita/onboarding:base
MAINTAINER patrykkopycinski

WORKDIR /home/node/onboarding

COPY package.json .
RUN yarn

ARG CI="false"

# Bundle app source by overwriting all WORKDIR content.
COPY ./src tmp

# Change owner since COPY/ADD assignes UID/GID 0 to all copied content.
RUN chown -Rf node:node tmp; rsync -a tmp/ ./src && rm -rf tmp

#RUN chown -R $USER:$(id -gn $USER) /home/node/onboarding
RUN if $CI -eq "true"; then npm run build:client ; fi

# Set the user name or UID to use when running the image and for any RUN, CMD and ENTRYPOINT instructions that follow
USER node

# A container must expose a port if it wants to be registered in Consul by Registrator.
# The port is fed both to node express server and Consul => DRY principle is observed with ENV VAR.
# NOTE: a port can be any, not necessarily different from exposed ports of other containers.

HEALTHCHECK --interval=15s --timeout=3s --retries=40 \
  CMD curl --silent --fail http://localhost:3002/api/health/check || exit 1

EXPOSE 3002
CMD [ "npm", "start" ]
