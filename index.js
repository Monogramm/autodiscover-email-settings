'use strict';

const path		= require('path');
const app		= require('koa')();
const swig		= require('koa-swig');
const body		= require('koa-buddy');
const router	= require('koa-router')();

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
	const email		= findChild('EMailAddress', request.children).content;
	const username	= email.split('@')[0];
	const domain	= email.split('@')[1];

	yield this.render('autodiscover', {
		schema: schema.content,
		email,
		username,
		domain
	});
});

// Thunderbird
router.get('/mail/config-v1.1.xml', function *autoconfig() {
	this.set('Content-Type', 'application/xml');
	yield this.render('autoconfig');
});

app.context.render = swig({
	root: path.join(__dirname, 'views'),
	autoescape: true,
	cache: 'memory',
	ext: 'xml'
});

app.use(function *fixContentType(next) {
	if (this.request.headers['content-type'] === 'text/xml') {
		this.request.headers['content-type'] = 'application/xml';
	}

	yield next;
});

app.use(body());
app.use(router.routes());
app.use(router.allowedMethods());

app.listen(process.env.PORT || 8000);
