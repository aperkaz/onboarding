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
$ docer-compose up
```
It will clone mysql, [consul](https://www.consul.io/),  [registrator](http://gliderlabs.com/registrator/latest/) images from [docker-hub](https://hub.docker.com/), than it will build image of campaigns mycroservice. Then all images will be launched. For the first time it will take some time to download and build everything.

If everything is ok, navigate to _http://localhost:3001_ - you will see campaigns search page.

##Development
You can open source code inside your favaourite IDE and start changing it - code inside the container will be rebuilt on fly and would see changes without container rebuilding/restartinh.

##Testing
TBD
