module.exports = {
	info: {
		name: process.env.COMPANY_NAME,
		url: process.env.SUPPORT_URL
	},
	domain: process.env.DOMAIN,
	imap: {
		host: process.env.IMAP_HOST,
		port: process.env.IMAP_PORT,
		socket: process.env.IMAP_SOCKET
	},
	smtp: {
		host: process.env.SMTP_HOST,
		port: process.env.SMTP_PORT,
		socket: process.env.SMTP_SOCKET
	},
	mobile: {
		identifier: process.env.PROFILE_IDENTIFIER,
		uuid: process.env.PROFILE_UUID,
		mail: {
			uuid: process.env.MAIL_UUID,
		}
	}
};
