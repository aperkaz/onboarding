const API_KEY = 'key-f5c8fa8c7b7691bf5b21d1971e822c8e';
const DOMAIN = 'sandboxa30099c9392e43768348abce5da1b1ad.mailgun.org';
const mailgun = require('mailgun-js')({apiKey: API_KEY, domain: DOMAIN});
const URL = 'http://103733d0.ngrok.io/campaigns/';


let sendInvitation = (from, recipient, subject, content, updateTransitionState, callback) => {

   let emailOpenTrack = `${URL}/api/transition/${recipient.campaignId}/${recipient.id}?transition=read`;
   let data = {
	  from: from,
	  to: recipient.email,
	  subject: subject,
	  text: content,
	  html: `<html>
		   <body>
		      <table style="margin:0 auto; width:960px; ">
		         <tr>
		            <td style="text-align: left">Aller</td>
		         </tr>
		         <tr>
		            <td colspan="2" style="font-size:large"> Aller streamlines invoice administration. </td>
		         </tr>
		         <tr>
		            <td colspan="2">Effective from 2017-01-01!</td>
		         </tr>
		         <tr>
		            <td>
		               <p>
		                  As part of strengthening cooperation with you as one of our most important contract partners and to
		                  reach our goal of increased internal efficiency such as the development of our purchasing and supplier
		                  management Aller will manage all supplier invoices electronically, which will lead to a more efficient
		                  invoicing both for the benefit of Aller as for you as our partner.
		               </p>
		               <p>This is a priority project of Aller and an important part in the development of the entire Aller Group
		                  where we hope you will develop together with us and see it as an equally important project.
		               </p>
		               <p>
		                  Aller has initiated cooperation with OpusCapita that will handle the Aller electronic messages such as
		                  supplier invoices and customer invoices. The first step for Aller is the introduction of electronic
		                  supplier invoices. When this is implemented fully, other electronic feeds will be revised as customer
		                  invoice. Aller will carry out connection work with the help of an intuitive and streamlined three-stage
		                  process. The process steps and associated description can be found below.
		               </p>
		               <p>1. Establishment
		                  Aller uses OpusCapita’s web-based connection service to establish an electronic invoice flow with
		                  you as a preferred supplier. The accession process is initiated by Aller and requires no effort from
		                  you as a supplier other than engaging in a dialogue with OpusCapita on behalf of Aller. The
		                  connections will begin in the fourth quarter of 2016 and continue throughout the year.
		               </p>
		               <p>2. Contact
		                  When Aller joins you as a supplier and has all information needed for a technical setup, information
		                  regarding the onboarding process will be sent to you. The information (receipt) that appears
		                  between the parties includes information as, connection set up, EDI addresses to be used in e-
		                  invoices and contact details for Aller. The information should be seen as a confirmation that you have
		                  been connected to e-invoicing with Aller. OpusCapita on behalf of Aller will shortly afterwards
		                  contact you to go through the practical details of the start-up of e-invoicing. Typical activities that
		                  will be examined include invoice references, timetable and process before sending the first e-invoice.
		               </p>
		               <p>
		                  3. Start
		                  When the first e-invoice has been successfully loaded and processed by the Aller, we are ready to go
		                  into operation. The connection between you and the Aller is ready for use and no further activity is
		                  required. Production date for e-invoicing, we have previously agreed to in paragraph 2, and all that
		                  remains is to enable e-invoice flow between us in each system. Please get back with the contact
		                  person at your place for this project and email contact information to:
		               </p>
		               <a href="${URL}/campaignPage/${recipient.campaignId}/${recipient.id}">Click here To get details</a>
		               <p>
		                  einvoice@aller.com <br/>
		                  Contact the Aller are:<br/>
		                  Technical questions IT [Name, Email, Phone]<br/>
		                  Accounts Receivable [Name, Email, Phone]<br/>
		                  Project [Name, Email, Phone]<br/><br/>
		                  Thanks for your participation!<br/><br/>
		                  Greetings<br/><br/>
		                  Jesper Lyngby Sørensen, Senior Group Controller, Aller Holding<br/>
		               </p>
		            </td>
		         </tr>
		      </table>
		      <img src="${emailOpenTrack}" alt="txt" />
		      <a target="_blank" href="${URL}/campaignPage/${recipient.campaignId}/${recipient.id}?transition=loaded">Click Here to onboard</a>
		   </body>
		</html>`
	};
			 
	mailgun.messages().send(data, (error, body) => {		
		if(error){
		  updateTransitionState(recipient.campaignId, recipient.id, 'bounced');
		  callback();
		}else{
		  updateTransitionState(recipient.campaignId, recipient.id, 'sent');
		  callback();
		}
	    
	});
}

module.exports = sendInvitation;			 
		