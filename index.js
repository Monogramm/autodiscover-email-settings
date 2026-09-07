"use strict";

const path = require("path");
const crypto = require("crypto");
const Koa = require("koa");
const app = new Koa();
const views = require("@ladjs/koa-views");
const rawBody = require("raw-body");
const xml2js = require("xml2js");
const bodyParser = require("koa-bodyparser");
const Router = require("@koa/router");
const router = new Router();
const settings = require("./settings.js");
const send = require('koa-send');

const LOG_LEVEL = (process.env.LOG_LEVEL || 'info').toLowerCase();
const LOG_ENABLED = LOG_LEVEL !== 'silent' && LOG_LEVEL !== 'none';

function log(level, event, details = {}) {
	if (!LOG_ENABLED) {
		return;
	}

	const payload = Object.assign({
		timestamp: new Date().toISOString(),
		level,
		event
	}, details);

	const output = JSON.stringify(payload);
	if (level === 'error') {
		console.error(output);
	} else {
		console.log(output);
	}
}

function buildRequestId() {
	if (typeof crypto.randomUUID === 'function') {
		return crypto.randomUUID();
	}
	return crypto.randomBytes(16).toString('hex');
}

const XML_OPTIONS = {
	explicitArray: false,
	explicitChildren: true,
	preserveChildrenOrder: true,
	charsAsChildren: false
};

// Parses XML request bodies into ctx.request.body and keeps the raw text on
// ctx.request.rawBody. This replaces koa-xml-body, a thin wrapper around the same two
// libraries that declares a peer dependency on koa@^2 and so breaks a plain `npm ci`
// on koa 3.
async function xmlBody(ctx, next) {
	if (ctx.request.body !== undefined ||
		!ctx.is('text/xml', 'xml') ||
		!/^(POST|PUT|PATCH)$/i.test(ctx.method)) {
		return next();
	}

	const text = await rawBody(ctx.req, {
		limit: '1mb',
		encoding: ctx.request.charset || 'utf8',
		length: ctx.request.headers['content-length']
	});

	let parsed;
	try {
		parsed = await xml2js.parseStringPromise(text, XML_OPTIONS);
	} catch (err) {
		ctx.throw(400, `invalid XML body: ${err.message}`);
	}

	ctx.request.body = parsed;
	ctx.request.rawBody = text;

	return next();
}

function findChild(name, children, def = null) {
	for (let child of children) {
		if (child.name === name) {
			return child;
		}
	}
	return def;
}

function extractEmailFromXml(raw) {
	if (!raw) return null;
	const m = raw.match(/<EMailAddress>([^<]+)<\/EMailAddress>/i);
	return m ? m[1] : null;
}

// Microsoft Outlook / Apple Mail
async function autodiscover(ctx) {
	// Try to use parsed body if available, otherwise fallback to raw XML extraction
	let email = null;
	if (ctx.request.body && typeof ctx.request.body === 'object') {
		const request = ctx.request.body.root && ctx.request.body.root.children ?
			findChild("Request", ctx.request.body.root.children) : null;
		const schema = request !== null ? findChild("AcceptableResponseSchema", request.children) : null;
		const xmlns = schema !== null ? schema.content : "http://schemas.microsoft.com/exchange/autodiscover/responseschema/2006";

		let emailNode = request !== null ? findChild("EMailAddress", request.children) : null;
		if (emailNode && emailNode.content) {
			email = emailNode.content;
		}

		ctx.state._xmlns = xmlns;
	}

	if (!email) {
		const raw = ctx.request.rawBody || (typeof ctx.request.body === 'string' ? ctx.request.body : null);
		email = extractEmailFromXml(raw);
	}

	let username;
	let domain;
	if (!email) {
		email = "";
		username = "";
		domain = settings.domain;
	} else if (email.indexOf("@") !== -1) {
		username = email.split("@")[0];
		domain = email.split("@")[1];
	} else {
		username = email;
		domain = settings.domain;
		email = `${username}@${domain}`;
	}

	const imapenc = settings.imap.socket === "STARTTLS" ? "TLS" : settings.imap.socket;
	const popenc = settings.pop.socket === "STARTTLS" ? "TLS" : settings.pop.socket;
	const smtpenc = settings.smtp.socket === "STARTTLS" ? "TLS" : settings.smtp.socket;

	const imapssl = settings.imap.socket === "SSL" ? "on" : "off";
	const popssl = settings.pop.socket === "SSL" ? "on" : "off";
	const smtpssl = settings.smtp.socket === "SSL" ? "on" : "off";

	await ctx.render('autodiscover.xml', Object.assign({}, settings, {
		schema: ctx.state._xmlns || "http://schemas.microsoft.com/exchange/autodiscover/responseschema/2006",
		email,
		username,
		domain,
		imapenc,
		popenc,
		smtpenc,
		imapssl,
		popssl,
		smtpssl
	}));
	ctx.type = "application/xml";
}

router.get("/autodiscover/autodiscover.xml", autodiscover);
router.post("/autodiscover/autodiscover.xml", autodiscover);
router.get("/Autodiscover/Autodiscover.xml", autodiscover);
router.post("/Autodiscover/Autodiscover.xml", autodiscover);


// Thunderbird
router.get("/mail/config-v1.1.xml", async (ctx) => {
	await ctx.render('autoconfig.xml', settings);
	ctx.type = "application/xml";
});


// iOS / Apple Mail (/email.mobileconfig?email=username@domain.com or /email.mobileconfig?email=username)
router.get("/email.mobileconfig", async (ctx) => {
	let email = ctx.request.query.email;

	// Ensure email is a single string value, not an array, to avoid type confusion issues
	if (Array.isArray(email)) {
		email = email[0] || "";
	}

	if (!email || typeof email !== "string") {
		ctx.status = 400;
		return;
	}

	let username;
	let domain;
	if (email.indexOf("@") !== -1) {
		username = email.split("@")[0];
		domain = email.split("@")[1];
	} else {
		username = email;
		domain = settings.domain;
		email = `${username}@${domain}`;
	}

	const safeDomain = domain.replace(/[^a-zA-Z0-9.-]/g, '_');
	const filename = `${safeDomain}.mobileconfig`;

	const imapssl = settings.imap.socket === "SSL" || settings.imap.socket === "STARTTLS" ? "true" : "false";
	const popssl = settings.pop.socket === "SSL" || settings.pop.socket === "STARTTLS" ? "true" : "false";
	const smtpssl = settings.smtp.socket === "SSL" || settings.smtp.socket === "STARTTLS" ? "true" : "false";
	const ldapssl = settings.ldap.socket === "SSL" || settings.ldap.port === "636" ? "true" : "false";

	ctx.set("Content-Type", "application/x-apple-aspen-config; charset=utf-8");
	ctx.set("Content-Disposition", `attachment; filename="${filename}"`);

	await ctx.render('mobileconfig.xml', Object.assign({}, settings, {
		email,
		username,
		domain,
		imapssl,
		popssl,
		smtpssl,
		ldapssl
	}));
	ctx.type = "application/x-apple-aspen-config";
});


// Generic support page
router.get("/", async (ctx) => {
	await ctx.render('index.html', settings);
});

router.get("/favicon.ico", async (ctx) => {
	// Serve static favicon from views directory
	ctx.type = 'image/x-icon';
	await send(ctx, 'favicon.ico', { root: path.join(__dirname, 'views') });
});

app.use(views(path.join(__dirname, 'views'), {
	map: { xml: 'nunjucks', html: 'nunjucks' }
}));

app.use(async (ctx, next) => {
	const incomingRequestId = ctx.get('x-request-id');
	const requestId = incomingRequestId || buildRequestId();
	ctx.state.requestId = requestId;
	ctx.set('X-Request-Id', requestId);
	await next();
});

app.use(async (ctx, next) => {
	try {
		await next();
	} catch (err) {
		ctx.status = err.status || 500;
		if (!ctx.body) {
			ctx.body = 'Internal Server Error';
		}

		log('error', 'request_error', {
			requestId: ctx.state.requestId,
			method: ctx.method,
			path: ctx.path,
			status: ctx.status,
			message: err.message
		});

		ctx.app.emit('error', err, ctx);
	}
});

app.use(async (ctx, next) => {
	const start = Date.now();
	await next();

	log('info', 'request', {
		requestId: ctx.state.requestId,
		method: ctx.method,
		path: ctx.path,
		status: ctx.status,
		durationMs: Date.now() - start,
		ip: ctx.ip
	});
});

app.use(async (ctx, next) => {
	// Normalize text/xml to application/xml for downstream parsers
	const type = ctx.request.headers['content-type'];
	if (type && type.indexOf('text/xml') === 0) {
		ctx.request.headers['content-type'] = type.replace('text/xml', 'application/xml');
	}
	await next();
});

// parse XML bodies into ctx.request.body and keep raw body on ctx.request.rawBody
app.use(xmlBody);

// parse urlencoded/json bodies
app.use(bodyParser());

app.use(router.routes());
app.use(router.allowedMethods());

const port = process.env.PORT || 8000;
app.listen(port);

log('info', 'server_started', { port });

app.on('error', (err, ctx) => {
	log('error', 'app_error', {
		requestId: ctx && ctx.state ? ctx.state.requestId : undefined,
		message: err.message
	});
});
