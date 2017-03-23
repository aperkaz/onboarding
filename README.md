# Campaign microservice
Functionality related to campaigns, its contacts and workflows.

##Requirements
- bios virtualization enabled
- linux or virtual machine
- installed [docker and docker-compose](https://www.docker.com/)
- dev/test environment docesnt support window

##Launching
- clone the repo
- sure that port 3305, 3001, 8400, 8500, 8600 are free and open
```bash
$ docker-compose up
```
It will clone mysql, [consul](https://www.consul.io/),  [registrator](http://gliderlabs.com/registrator/latest/) images from [docker-hub](https://hub.docker.com/), than it will build image of campaigns mycroservice. Then all images will be launched. For the first time it will take some time to download and build everything.

If everything is ok, navigate to _http://localhost:3001_ - you will see campaigns search page.

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
###Development
* run `create database onboarding;` on mysql server
* setup consul config 
  * TBD currently using environment for config only
docker service ls
docker service create --publish mode=host,target=3002,published=3002 --env MYSQL_HOST=$(curl swarmMaster0:8500/v1/catalog/service/mysql | grep -o -e "\"Address\":\"[^,]*" | grep -o "[^\"]*" | grep -v "Address"| grep -v ":") --env MYSQL_PORT=3306 --env SERVICE_NAME=campaigns --env MYSQL_DATABASE=onboarding --env MYSQL_USER=root --env MYSQL_DIALECT=mysql --env MYSQL_PASSWORD=notSecureP455w0rd --env EXTERNAL_HOST=52.233.155.169 --env EXTERNAL_PORT=80 --env NGINX_PORT=8080 --env SERVICE_3002_CHECK_HTTP=/ --env SERVICE_3002_CHECK_INTERVAL=15s --env SERVICE_3002_CHECK_TIMEOUT=3s opuscapita/onboarding:latest


