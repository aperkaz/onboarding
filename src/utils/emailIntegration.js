const API_KEY = 'key-f5c8fa8c7b7691bf5b21d1971e822c8e';
const DOMAIN = 'sandboxa30099c9392e43768348abce5da1b1ad.mailgun.org';
const mailgun = require('mailgun-js')({apiKey: API_KEY, domain: DOMAIN});


function sendInvitation(from, recipients, subject, content) {
   var data = {
	  from: from,
	  to: recipients,
	  subject: subject,
	  text: content
	};
			 
	mailgun.messages().send(data, function (error, body) {
		if(error){
		console.log('--error---', error);
		}
	    console.log('--error---', body);
	});
}

module.exports = sendInvitation;			 
			