const API_KEY = 'key-f5c8fa8c7b7691bf5b21d1971e822c8e';
const DOMAIN = 'sandboxa30099c9392e43768348abce5da1b1ad.mailgun.org';
const mailgun = require('mailgun-js')({apiKey: API_KEY, domain: DOMAIN});


function sendInvitation(from, recipient, subject, content, callback, callback1) {
   let emailOpenTrack = 'http://office.girosole.com/api/tours/testmail/'+recipient.campaignId+'/'+recipient.id+'?transition=read';
   let data = {
	  from: from,
	  to: recipient.email,
	  subject: subject,
	  text: content,
	  html: '<html><body><h1>HTML text here</h1><img src="'+emailOpenTrack+'" alt="txt" /><a target="_blank" href="http://localhost:3002/campaignPage/'+recipient.campaignId+'/'+recipient.id+'?transition=loaded">Click Here to Join</a></body></html>'
	};
			 
	mailgun.messages().send(data, function (error, body) {		
		if(error){
		  callback(recipient.campaignId, recipient.id, 'bounced');
		  callback1();
		}else{
		  callback(recipient.campaignId, recipient.id, 'sent');
		  callback1();
		}
	    
	});
}

module.exports = sendInvitation;			 
		