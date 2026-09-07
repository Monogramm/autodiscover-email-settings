module.exports = {
	info: {
 		name: process.env.COMPANY_NAME || process.env.DOMAIN || 'Example',
 		url: process.env.SUPPORT_URL || (process.env.DOMAIN ? `https://${process.env.DOMAIN}` : '')
	},
	domain: process.env.DOMAIN || 'example.com',

	// sensible defaults derived from domain when specific env vars are not provided
	imap: {
		host: process.env.IMAP_HOST || `imap.${process.env.DOMAIN || 'example.com'}`,
		port: process.env.IMAP_PORT || '993',
		socket: process.env.IMAP_SOCKET || 'SSL'
	},
	pop: {
		host: process.env.POP_HOST || `pop.${process.env.DOMAIN || 'example.com'}`,
		port: process.env.POP_PORT || '995',
		socket: process.env.POP_SOCKET || 'SSL'
	},
	smtp: {
		host: process.env.SMTP_HOST || `smtp.${process.env.DOMAIN || 'example.com'}`,
		port: process.env.SMTP_PORT || '587',
		socket: process.env.SMTP_SOCKET || 'STARTTLS'
	},
	mobilesync: {
		url: process.env.MOBILESYNC_URL,
		name: process.env.MOBILESYNC_NAME
	},
	ldap: {
		host: process.env.LDAP_HOST,
		port: process.env.LDAP_PORT,
		socket: process.env.LDAP_SOCKET,
		base: process.env.LDAP_BASE,
		userfield: process.env.LDAP_USER_FIELD,
		usersbase: process.env.LDAP_USER_BASE,
		searchfilter: process.env.LDAP_SEARCH
	},
	mobile: {
		identifier: process.env.PROFILE_IDENTIFIER,
		uuid: process.env.PROFILE_UUID,
		mail: {
			uuid: process.env.MAIL_UUID,
		},
		ldap: {
			uuid: process.env.LDAP_UUID,
		}
	}
};
