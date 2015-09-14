'use strict';

const path		= require('path');
const app		= require('koa')();
const swig		= require('koa-swig');
const body		= require('koa-buddy');
const router	= require('koa-router')();
const log		= console.log.bind(console);

function findChild(name, children) {
	for (let child of children) {
		if (child.name === name) {
			return child;
		}
	}
}

router.post('/Autodiscover/Autodiscover.xml', function *autodiscover(next) {
	log(this.request.headers, this.request.body);

	this.set('Content-Type', 'application/xml');

	const request	= findChild('Request');
	const schema	= findChild('AcceptableResponseSchema', request.children);
	const email		= findChild('EMailAddress', request.children).content;
	const username	= email.split('@')[0];
	const domain	= email.split('@')[1];

	this.render('autodiscover', {
		schema: schema.content,
		email,
		username,
		domain
	});

	yield next;
});

app.context.render = swig({
	root: path.join(__dirname, 'views'),
	autoescape: true,
	cache: 'memory',
	ext: 'xml'
});

app.use(body());
app.use(router.routes());
app.use(router.allowedMethods());

app.listen(process.env.PORT || 8000);
