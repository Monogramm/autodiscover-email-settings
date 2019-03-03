'use strict';

const path		= require('path');
const app		= require('koa')();
const swig		= require('koa-swig');
const body		= require('koa-buddy');
const router	= require('koa-router')();
const settings	= require('./settings.js');

function findChild(name, children) {
	for (let child of children) {
		if (child.name === name) {
			return child;
		}
	}
}

// Microsoft Outlook / Apple Mail
router.post('/Autodiscover/Autodiscover.xml', function *autodiscover() {
	this.set('Content-Type', 'application/xml');

	const request	= findChild('Request', this.request.body.root.children);
	const schema	= findChild('AcceptableResponseSchema', request.children);

	let email		= findChild('EMailAddress', request.children).content;
	let username;
	let domain;
	if (~email.indexOf('@') ) {
		username	= email.split('@')[0];
		domain		= email.split('@')[1];
	} else {
		username	= email;
		domain		= settings.domain;
		email		= username + '@' + domain;
	}

	const imapenc	= settings.imap.socket == 'STARTTLS' ? 'TLS' : settings.imap.socket;
	const smtpenc	= settings.smtp.socket == 'STARTTLS' ? 'TLS' : settings.smtp.socket;

	yield this.render('autodiscover', {
		schema: schema.content,
		email,
		username,
		domain,
		imapenc,
		smtpenc
	});
});

// Thunderbird
router.get('/mail/config-v1.1.xml', function *autoconfig() {
	this.set('Content-Type', 'application/xml');
	yield this.render('autoconfig');
});

// iOS / Apple Mail (/email.mobileconfig?email=username@domain.com or /email.mobileconfig?email=username)
router.get('/email.mobileconfig', function *autoconfig() {
	let email = this.request.query.email;

	if (!email) {
		this.status = 400;

		return;
	}

	let username;
	let domain;
	if (~email.indexOf('@') ) {
		username	= email.split('@')[0];
		domain		= email.split('@')[1];
	} else {
		username	= email;
		domain		= settings.domain;
		email		= username + '@' + domain;
	}

	const filename	= `${domain}.mobileconfig`;

	const inssl		= settings.imap.socket == 'SSL' || settings.imap.socket == 'STARTTLS' ? 'true' : 'false';
	const outssl	= settings.smtp.socket == 'SSL' || settings.smtp.socket == 'STARTTLS' ? 'true' : 'false';

	this.set('Content-Type', 'application/x-apple-aspen-config; chatset=utf-8');
	this.set('Content-Disposition', `attachment; filename="${filename}"`);

	yield this.render('mobileconfig', {
		email,
		username,
		domain,
		inssl,
		outssl
	});
});

app.context.render = swig({
	root: path.join(__dirname, 'views'),
	autoescape: true,
	cache: 'memory',
	ext: 'xml',
	locals: settings
});

app.use(function *fixContentType(next) {
	let type = this.request.headers['content-type'];

	if (type && type.indexOf('text/xml') === 0) {
		let newType = type.replace('text/xml', 'application/xml');

		this.request.headers['content-type'] = newType;
	}

	yield next;
});

app.use(body());
app.use(router.routes());
app.use(router.allowedMethods());

app.listen(process.env.PORT || 8000);
