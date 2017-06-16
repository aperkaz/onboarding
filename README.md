# Campaign microservice
Functionality related to campaigns, its contacts and workflows.

##Requirements
- bios virtualization enabled
- linux or virtual machine
- installed [docker and docker-compose](https://www.docker.com/)
- dev/test environment docesnt support window

##Launching
- clone the repo
- sure that port 3305, 3002, 8400, 8500, 8600 are free and open
```bash
$ docker-compose up
```
It will clone mysql, [consul](https://www.consul.io/), [redis](https://redis.io/), [registrator](http://gliderlabs.com/registrator/latest/) images from [docker-hub](https://hub.docker.com/), than it will build image of campaigns mycroservice. Then all images will be launched. For the first time it will take some time to download and build everything.

If everything is ok, navigate to _http://localhost:3002_ - you will see campaigns search page.

##Development
You can open source code inside your favaourite IDE and start changing it - code inside
the container will be rebuilt on fly and would see changes without container rebuilding/restartinh.

##Data population
- set 'POPULATE_DATA' environment variable to 'true'  
```bash
$ export POPULATE_DATA=true
```
- start aplication
```bash
$ npm start //data will be populated automatically
```
- if starting with docker compose - data will populated automatically

##Testing
```bash
$ npm test //runs tests with coverage
```

## Deployment
###Development (Swarm)
* run `create database onboarding;` on mysql server
* create db user and add db-init key/values to config, see [[gr4per/azureswarm]]
```
docker service create --name onboarding --log-driver gelf --log-opt gelf-address=udp://10.0.0.12:12201 --log-opt tag="onboarding" --publish mode=host,target=3002,published=3002 --env CONSUL_HOST=172.17.0.1 --env SERVICE_NAME=onboarding --env EXTERNAL_HOST=52.233.155.169 --env EXTERNAL_PORT=80 --env NGINX_PORT=8080 --env SERVICE_3002_CHECK_HTTP=/api/health/check --env SERVICE_3002_CHECK_INTERVAL=15s --env SERVICE_3002_CHECK_TIMEOUT=3s --env SCOPE=email,userInfo,roles --env CLIENT_SECRET=91c0fabd17a9db3cfe53f28a10728e39b7724e234ecd78dba1fb05b909fb4ed98c476afc50a634d52808ad3cb2ea744bc8c3b45b7149ec459b5c416a6e8db242 --env CLIENT_KEY=oidcCLIENT --env USER_NAME=onboarding --env PASSWORD=svc_onboarding opuscapita/onboarding:dev
```
