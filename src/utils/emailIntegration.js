const RedisEvents = require('ocbesbn-redis-events');
const config = require('ocbesbn-config');
const Promise = require('bluebird');

const events = new RedisEvents({ consul : { host : 'consul', redisServiceName: 'redis', redisPasswordKey: 'redis-auth' } });

const sendEmail = (data) => events.emit(data, 'email');

const sendInvitation = (customer, recipient, updateTransitionState, callback) => {

  Promise
    .all([
      config.get("ext-url/scheme"),
      config.get("ext-url/host"),
      config.get("ext-url/port")
    ])
    .spread((scheme, host, port) => {
      const URL = `${scheme}://${host}:${port}/onboarding`;
      const BLOB_URL = `${scheme}://${host}:${port}/blob`;

      const emailOpenTrack = `${URL}/public/transition/c_${recipient.tenantId}/${recipient.campaignName}/${recipient.id}?transition=read`;
      let data = {
        to: recipient.email,
        subject: `${customer.customerName} asking you to connect eInvoicing`,
        html: `<!DOCTYPE html>
            <html>
              <head>
                <title>Email Template</title>
              </head>
              <body style="border: 1px solid #ddd; font-family: avenir;">
                <a target="_blank" href="${URL}/public/landingpage/c_${recipient.tenantId}/${recipient.campaignName}/${recipient.id}?transition=loaded">
                  <img src="${BLOB_URL}/public/api/c_${recipient.tenantId}/files/public/onboarding/eInvoiceSupplierOnboarding/emailTemplates/generic/header.png" alt="header image" width="100%">
                </a>
                <a target="_blank" href="${URL}/public/landingpage/c_${recipient.tenantId}/${recipient.campaignName}/${recipient.id}?transition=loaded">
                  <img src="${BLOB_URL}/public/api/c_${recipient.tenantId}/files/public/onboarding/eInvoiceSupplierOnboarding/emailTemplates/generic/logo.png" alt="image with logo" width="200px" style="margin: 15px">
                </a>
                <section class="container-fluid">
                  <article style="background: #f9f9f9; padding: 15px; margin:15px;">
                    <h2>Dear ${recipient.contactFirstName} ${recipient.contactLastName} at ${recipient.companyName}</h2>
                    <p style="text-align: justify;">
                      <i>As part of strenghtening cooperation with you as one of our most important contract partners and to reach our goal of increased internal efficiency such as the development of our purchasing and supplier management ${customer.customerName} will manage all supplier invoices electronically, which will lead to a more efficient invoicing both for the benefit of ${customer.customerName} as for you as our partner.</i>
                    </p>
                    <br>
                    <p style="text-align: justify;"><b>
                      This is a priority project of ${customer.customerName} where we hope you will develop together with us and see it as an equally important project.
                    </b></p>
                    <br>
                    <p style="text-align: justify;">
                      ${customer.customerName} in cooperation with <a target="_blank" href="http://www.opuscapita.com/">OpusCapita</a> will handle ${customer.customerName} electronic messeging such as supplier invoices and customer invoices. The first step for ${customer.customerName} is the introduction of electronic supplier invoices. When this is implemented fully, other electronic feeds will be revised as customer invoice. ${customer.customerName} will carry out connection work with the help of an intuitive and streamlined process. The process steps and associated description, validation and support can be found after registration on our <a target="_blank" href="${URL}/public/landingpage/c_${recipient.tenantId}/${recipient.campaignName}/${recipient.id}?transition=loaded">Supplier Onboarding</a> site.
                    </p>
    
                    <hr>
    
                    <h2>1. Registration</h2>
                    <p style="text-align: justify;">
                      ${customer.customerName} uses OpusCapita's cloud-based supplier onboarding service to establish an electronic invoice flow with you as a preferred supplier. The access process is initialized by ${customer.customerName} and requires no effort from you as a supplier other than engaging in a dialogue and registration process with OpusCapita on behalf of ${customer.customerName}.
                    </p>
    
                    <br>
    
                    <h2>2. Choose your channel of invoice sending</h2>
                    <p style="text-align: justify;">
                      The easiest way to submit an invoice is as an eInvoice! Always 100% correct data transferred around the clock, all working days - Globally! Connect with us using your existing service provider for e-invoicing by simply choose your operator from our list operators and we will set up your connection in no time. In case of your operator is new to us, OpusCapita takes care of the technical setup with the new operator. We have a global reach as you will be connected to the global and open OpusCapita Business Network. Other channels of submitting of submitting invoice to ${customer.customerName} are "Invoices as PDF via e-mail", "Supplier Portal" - all available on our <a target="_blank" href="${URL}/public/landingpage/c_${recipient.tenantId}/${recipient.campaignName}/${recipient.id}?transition=loaded">Supplier Onboarding site</a> - Where you also find more information associated to service and support.
                    </p>
    
                    By participating in our <a target="_blank" href="${URL}/public/landingpage/c_${recipient.tenantId}/${recipient.campaignName}/${recipient.id}?transition=loaded">Supplier Onboarding program</a> you as a Supplier will benefit of the following:
                    <ul>
                      <li>Fast and guaranteed delivery of invoices to ${customer.customerName} within a day and you get paid faster since there is no delay to the paper version.</li>
                      <li>Fewer mistakes - OpusCapita validates your invoices to detect miscalculations and other common errors.</li>
                      <li>Reduce administrative cost - Send your invoice data to NCC instantly and with 100% accuracy.</li>
                      <li>Reducee material cost(e.g., labor, paper, envelopes, printer ink, and postage.)</li>
                      <li>Choose the invoice sending channel that is the most convinient for you - Value of choice!</li>
                    </ul>
    
                    <br>
    
                    <h4><i>Thanks for your participation!</i></h4>
                  </article>
                </section>
                <section>
                  <div style="margin-top: -10px; float: right; padding-right: 50px; display: inline-block;">
                    <div>
                      <!--<p style="text-align: justify;">If you have questions regarding this Mail please contact:<br>
                      <b>onboarding contact name</b> Onboardig Manager at ${customer.customerName}<br>
                      <b>onboarding contact phone</b><br>
                      <b><a href="#">onboarding contact email</a></b>-->
                    </div>
                  </div>
                  <div style="visibility: hidden; display: block; font-size: 0;content: ' '; clear: both; height: 0;">
                          <img style="display:none" src="${emailOpenTrack}" />
                                                            </div>
                </section>
              </body>
            </html>`
      };

    sendEmail(data)
      .then(() => {
        updateTransitionState(recipient.campaignName, recipient.id, 'sent');
        callback();
      }).catch(error => {
        console.log('----Not able to send mail', error);
        updateTransitionState(recipient.campaignName, recipient.id, 'bounced');
        callback();
      });
    });
};

module.exports = sendInvitation;

