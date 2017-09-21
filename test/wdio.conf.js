exports.config = {

  //
  // ==================
  // Specify Test Files
  // ==================
  // Define which test specs should run. The pattern is relative to the directory
  // from which `wdio` was called. Notice that, if you are calling `wdio` from an
  // NPM script (see https://docs.npmjs.com/cli/run-script) then the current working
  // directory is where your package.json resides, so `wdio` will be called from there.
  //
  specs: [
    '/test/*/**.js'
  ],
  // Patterns to exclude.
  exclude: [
    // 'path/to/excluded/files'
  ],
  host: 'localhost',
  port: 4444,
  path: '/wd/hub',
  //
  // ============
  // Capabilities
  // ============
  // Define your capabilities here. WebdriverIO can run multiple capabilities at the same
  // time. Depending on the number of capabilities, WebdriverIO launches several test
  // sessions. Within your capabilities you can overwrite the spec and exclude options in
  // order to group specific specs to a specific capability.
  //
  // First, you can define how many instances should be started at the same time. Let's
  // say you have 3 different capabilities (Chrome, Firefox, and Safari) and you have
  // set maxInstances to 1; wdio will spawn 3 processes. Therefore, if you have 10 spec
  // files and you set maxInstances to 10, all spec files will get tested at the same time
  // and 30 processes will get spawned. The property handles how many capabilities
  // from the same test should run tests.
  //
  maxInstances: 1,
  //
  // If you have trouble getting all important capabilities together, check out the
  // Sauce Labs platform configurator - a great tool to configure your capabilities:
  // https://docs.saucelabs.com/reference/platforms-configurator
  //
  // capabilities: [{
  //   // maxInstances can get overwritten per capability. So if you have an in-house Selenium
  //   // grid with only 5 firefox instances available you can make sure that not more than
  //   // 5 instances get started at a time.
  //   maxInstances: 5,
  //   //
  //   browserName: 'chrome'
  // }],
  capabilities: [{ browserName: 'firefox' }],
  //
  // ===================
  // Test Configurations
  // ===================
  // Define all options that are relevant for the WebdriverIO instance here
  //
  // By default WebdriverIO commands are executed in a synchronous way using
  // the wdio-sync package. If you still want to run your tests in an async way
  // e.g. using promises you can set the sync option to false.
  sync: true,
  //
  // Level of logging verbosity: silent | verbose | command | data | result | error
  logLevel: 'silent',
  //
  // Enables colors for log output.
  coloredLogs: true,
  //
  // If you only want to run your tests until a specific amount of tests have failed use
  // bail (default is 0 - don't bail, run all tests).
  bail: 0,
  //
  // Saves a screenshot to a given path if a command fails.
  screenshotPath: '/home/seluser/result/errorShots/',
  //
  // Set a base URL in order to shorten url command calls. If your url parameter starts
  // with "/", then the base url gets prepended.
  baseUrl: 'http://'+process.env.EXTERNAL_HOST+':'+process.env.EXTERNAL_PORT+"/"+process.env.APPLICATION_NAME,
  //
  // Default timeout for all waitFor* commands.
  waitforTimeout: 20000,
  //
  // Default timeout in milliseconds for request
  // if Selenium Grid doesn't send response
  connectionRetryTimeout: 90000,
  //
  // Default request retries count
  connectionRetryCount: 3,
  //
  // Framework you want to run your specs with.
  // The following are supported: Mocha, Jasmine, and Cucumber
  // see also: http://webdriver.io/guide/testrunner/frameworks.html
  //
  // Make sure you have the wdio adapter package for the specific framework installed
  // before running any tests.
  framework: 'mocha',
  //
  // Test reporter for stdout.
  // The only one supported by default is 'dot'
  // see also: http://webdriver.io/guide/testrunner/reporters.html
   reporters: ['spec', 'junit'],
  //
  // Options to be passed to Mocha.
  // See the full list at http://mochajs.org/
  mochaOpts: {
    ui: 'bdd',
    timeout: 60000
  },
  reporterOptions: {
    junit: {
      outputDir: './result/',
      outputFileFormat: function(opts) { // optional
        return `results-${opts.cid}.${opts.capabilities}.xml`
      }
    }
  },
  before: function (capabilities, specs) {
    let ServiceClient = require('ocbesbn-service-client');
    let serviceClient = new ServiceClient({ consul : { host : 'consul' } });

    browser.addCommand('request', function (method, url, _data, _service) {
      if (method.toLowerCase() == 'get') {
        _service = _data;
        _data = undefined;
      }

      let service = _service || process.env.APPLICATION_NAME;
      return serviceClient[method.toLowerCase()](service, url, _data);
    });

    //do browser authorization if needed

    browser.url('/dashboard/');
    if ((browser.getUrl().indexOf('interaction') !== -1) || (browser.getUrl().indexOf('authorize') !== -1)) {
      browser.setValue('[name=login]', 'john.doe@ncc.com');
      browser.setValue('[name=password]', 'test');
      browser.click('input[name=submit]');
    }
    browser.waitForExist('section.sidebar');
  }
};
