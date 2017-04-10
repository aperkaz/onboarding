const PORT = process.env.EXTERNAL_PORT;
const HOST = process.env.EXTERNAL_HOST;
// const API_KEY = process.env.API_KEY;
// const DOMAIN = process.env.DOMAIN;
// const mailgun = require('mailgun-js')({apiKey: API_KEY, domain: DOMAIN});
const URL = `http://${HOST}:${PORT}/onboarding`;
let config = require('../../app.config.json');
let nodemailer = require('nodemailer');

let smtpTransport = nodemailer.createTransport(config.mail.options);

function sendMail(mailProps) {
  return new Promise((resolve, reject) => smtpTransport.sendMail(
    mailProps,
    err => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    }
  ));
}


let sendInvitation = (from, recipient, subject, updateTransitionState, callback) => {
  let emailOpenTrack = `${URL}/public/transition/${recipient.campaignId}/${recipient.id}?transition=read`;
  let data = {
	  from: config.mail.defaultFromAddress,
	  to: recipient.email,
	  subject: subject,
	  html: `<!DOCTYPE html>
				<html>
					<head>
						<title>Email Template</title>
					</head>
					<body style="border: 1px solid #ddd; font-family: avenir;">
						<a target="_blank" href="${URL}/public/transition/${recipient.campaignId}/${recipient.id}?transition=loaded">
							<img src="${URL}/images/header.jpg" alt="header image" width="100%">
						</a>
                        <a target="_blank" href="${URL}/public/transition/${recipient.campaignId}/${recipient.id}?transition=loaded">
							<img src="${URL}/images/logo.jpg" alt="image with logo" width="100%">
						</a>
						<section class="container-fluid">
							<article style="background: #f9f9f9; padding: 15px; margin:15px;">
								<h2>Dear ${recipient.contactFirstName} ${recipient.contactLastName} at ${recipient.companyName}</h2>
								<p style="text-align: justify;">
									<i>As part of strenghtening cooperation with you as one of our most important contract partners and to reach our goal of increased internal efficiency such as the development of our purchasing and supplier management NCC Svenska AB will manage all supplier invoices electronically, which will lead to a more efficient invoicing both for the benefit of NCC Svenska AB as for you as our partner.</i>
								</p>
								<br>
								<p style="text-align: justify;"><b>
									This is a priority project of NCC Svenska AB (hereinafter named NCC) and an important part in the development of the entire NCC Group where we hope you will develop together with us and see it as an equally important project.
								</b></p>
								<br>
								<p style="text-align: justify;">
									NCC in cooperation with <a target="_blank" href="http://www.opuscapita.com/">OpusCapita</a> will handle NCC electronic messeging such as supplier invoices and customer invoices. The first step for NCC is the introduction of electronic supplier invoices. When this is implemented fully, other electronic feeds will be revised as customer invoice. NCC will carry out connection work with the help of an intuitive and streamlined process. The process steps and associated description, validation and support can be found after registration on our <a target="_blank" href="${URL}/public/transition/${recipient.campaignId}/${recipient.id}?transition=loaded">Supplier Onboarding</a> site.
								</p>

								<hr>

								<h2>1. Registration</h2>
								<p style="text-align: justify;">
									NCC uses OpusCapita's cloud-based supplier onboarding service to establish an electronic invoice flow with you as a preferred supplier. The accession process is initialized by NCC and requires no effort from you as a supplier other than engaging in a dialogue and registration process with OpusCapita on behalf of NCC.
								</p>

								<br>

								<h2>2. Choose your channel of invoice sending</h2>
								<p style="text-align: justify;">
									The easiest way to submit an invoice is as an eInvoice! Always 100% correct data transferred around the clock, all working days - Globally! Connect with us using your existing service provider for e-invoicing by simply choose your operator from our list operators and we will set up your connection in no time. In case of your operator is new to us, OpusCapita takes care of the technical setup with the new operator. We have a global reach as you will be connected to the global and open OpusCapita Business Network. Other channels of submitting of submitting invoice to NCC are "Invoices as PDF via e-mail", "Supplier Portal" - all available on our <a target="_blank" href="${URL}/public/transition/${recipient.campaignId}/${recipient.id}?transition=loaded">Supplier Onboarding site</a> - Where you also find more information associated to service and support.
								</p>

								By participating in our <a target="_blank" href="${URL}/public/transition/${recipient.campaignId}/${recipient.id}?transition=loaded">Supplier Onboarding program</a> you as a Supplier will benefit of the following:
								<ul>
									<li>Fast and guaranteed delivery of invoices to NCC within a day and you get paid faster since there is no delay to the paper version.</li>
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
									<p style="text-align: justify;">If you have questions regarding this Mail please contact:<br>
									<b>Matts Ek.</b> Manager at NCC Svenska AB Holding<br>
									<b>+46 761 26 99 79</b><br>
									<b><a href="#">matts.ek@ncc.se</a></b>
								</div>
							</div>
							<div style="visibility: hidden; display: block; font-size: 0;content: ' '; clear: both; height: 0;">
							        <img style="display:none" src="${emailOpenTrack}" />
                                                        </div>
						</section>
					</body>
				</html>`
  };

  sendMail(data).then(() => {
    updateTransitionState(recipient.campaignId, recipient.id, 'sent');
		  callback();
  }).catch(err => {
    console.log('----Not able to send mail', error);
		  updateTransitionState(recipient.campaignId, recipient.id, 'bounced');
		  callback();
  });

	/* mailgun.messages().send(data, (error, body) => {
		if(error){
		  console.log('----Not able to send mail', error);
		  updateTransitionState(recipient.campaignId, recipient.id, 'bounced');
		  callback();
		}else{
		  updateTransitionState(recipient.campaignId, recipient.id, 'sent');
		  callback();
		}

	});*/
}

module.exports = sendInvitation;

