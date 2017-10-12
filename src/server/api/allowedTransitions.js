module.exports = {
    eInvoiceSupplierOnboarding : {
        queued : ['queued', 'sending', 'sent', 'read', 'loaded', 'onboarded', 'bounced'],
        sending : ['sending', 'sent', 'read', 'loaded', 'onboarded', 'bounced'],
        sent : ['sent', 'read', 'loaded', 'onboarded'],
        read : ['read', 'loaded', 'onboarded'],
        loaded : ['loaded', 'onboarded'],
        onboarded : ['onboarded'],
        bounced : ['bounced', 'sent', 'read', 'loaded', 'onboarded'],
        invitationGenerated : ['sending', 'sent', 'onboarded']
	}
};
