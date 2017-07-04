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
####Unit tests
```bash
$ npm test //runs tests with coverage
```
####Selenium tests
Selenium service is present in docker-compose.yml. It is run be default with `docker-compose up -d`
but has no affect on other service (they are not aware of tests running). It usually takes ~10 minutes to run
so be patient, it does not mean it freeze. When tests are done container stops and can be restarted any time
in Kitematic or by running `docker-compose start test`. Test results output is configurable and right now it is set 
as `spec` (human readable command line output to be read in docker logs) and `junit` which output can be found in
/tmp (locally mounted directory). Every `*.js` file from onboarding `test` directory will be run in separate
session (no need to reference it anywhere, it just needs to exist).
#####Running test on local browser
Docker image has some cons. For example you cannot see what is really running and it is very slow in virtual X11. When
you are working on tests it is highly recommended to run selenium localy. To do it you need to download `selenium-server`
, `geckodriver` and Firefox browser. When it is installed you run `selenium-server -port 4444`. After that you change
`host` parameter in wdio.conf.js from `localhost` to you local IP and thats it! Every time you run test service now
it will use your local Firefox browser to run tests and you can see it in realtime.
#####Test results
Every run spec file has its own junit xml file which can be found in /tmp directory.
Every time a test fails screenshot is done and saved in /tmp/errorShots.

#####Known issues
- Tests are run too soon using `docker-compose up -d` so they will fail as onboarding is not running yet
- When some tests fail it usually ends with hundreds of messages from notification service what causes onbaording to
dramatically slow down and need to be restarted.
- Docker log merges stdout with stderr what makes it hard to read when tests fail
- Running tests using selenium docker builtin browser is very slow (X11 is emulated)
- As we are using React many views are not available when webdriver gets `pageLoaded` event so we need to
wait for React separately using `browser.waitUntil`

## Deployment
### Swarm
Fully auto deployed

*Deprecated*
* run `create database onboarding;` on mysql server
* create db user and add db-init key/values to config, see [[gr4per/azureswarm]]
```
docker service create --name onboarding --log-driver gelf --log-opt gelf-address=udp://10.0.0.12:12201 --log-opt tag="onboarding" --publish mode=host,target=3002,published=3002 --env CONSUL_HOST=172.17.0.1 --env SERVICE_NAME=onboarding --env SERVICE_3002_CHECK_HTTP=/api/health/check --env SERVICE_3002_CHECK_INTERVAL=15s --env SERVICE_3002_CHECK_TIMEOUT=3s --env SCOPE=email,userInfo,roles --env CLIENT_SECRET=91c0fabd17a9db3cfe53f28a10728e39b7724e234ecd78dba1fb05b909fb4ed98c476afc50a634d52808ad3cb2ea744bc8c3b45b7149ec459b5c416a6e8db242 --env CLIENT_KEY=oidcCLIENT --env USER_NAME=onboarding --env PASSWORD=svc_onboarding opuscapita/onboarding:dev
```

## Scaling

Workflow auto pickups synchronize on db
Incoming supplier / user events are processed by every instance and hence need
to be idempotent until we move to RabbitMQ

# Campaign workflows

Onboarding supports defining multiple Campaign Workflows.
These are associated to a Campaign via campaign.type

Currently we have one workflow implemented for onboarding suppliers
to the eInvoice sending product.

## eInvoiceSupplierOnboarding

This workflow does invitation email sending to all contacts.
Emails contain link to landing page - this is the advert page for the product
where suppliers can opt to Register with our platform and the campaigning company's offer.

After successful registration, the supplier users will receive a notification
that reminds them to setup the eInvoice-sending product via a configuration workflow.
In scope of that, terms and agreements between supplier and OpusCapita as well as between supplier and customer will be accepted and any required config added by supplier.
After that is done, the supplier is registered to the eInvoice sending product and connected to the customer.

### Contact workflow steps
* new – initial state for each contact
* queued (auto pickup) – once campaign is live, we queue contacts for auto execution
* generatingInvitation – while generating the invitation code for the contact
* invitationGenerated (auto pickup) – after we generated the invitation code
* sending – while sending email
* sent|bounced – after email is sent
* read – once email pictures were loaded by email client
* loaded – once onboarding landing page was loaded by user
* registered – once user has registered to business network portal
* needsVoucher (auto pickup) - once supplier has been created and associated to user
* generatingVoucher - while generating the voucher
* serviceConfig – as soon as voucher is generated and supplier users can configure product
* … - we might be interested about specific steps in the service config workflow on campaign level, e.g. bank approved, contract signed in case of SCF
* onboarded – once supplier has configured the service for usage
* connected – once the supplier has created business link to onboarding customer

#### Grouping statuses for end user (e.g. on dashbaords):
* preparing (new, queued, generatingInvitation, invitationGenerated)
* sent
* error (bounced, …)
* loaded
* registered (registered, needsVoucher, generatingVoucher)
* serviceConfig
* onboarded
* connected
