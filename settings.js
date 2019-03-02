module.exports = {
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
	}
};
