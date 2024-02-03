"use strict";

const path		= require("path");
const app		= require("koa")();
const swig		= require("koa-swig");
const body		= require("koa-buddy");
const router	= require("koa-router")();
const settings	= require("./settings.js");

function findChild(name, children, def = null) {
	for (let child of children) {
		if (child.name === name) {
			return child;
		}
	}
	return def;
}

// Microsoft Outlook / Apple Mail
function *autodiscover() {
	this.set("Content-Type", "application/xml");

	const request	= this.request.body && this.request.body.root ? 
		findChild("Request", this.request.body.root.children) : 
		null;
	const schema	= request !== null ? 
		findChild("AcceptableResponseSchema", request.children) : 
		null;
	const xmlns		= schema !== null ? 
		schema.content : 
		"http://schemas.microsoft.com/exchange/autodiscover/outlook/responseschema/2006a";

	let email		= request !== null ? 
		findChild("EMailAddress", request.children) : 
		null;

	let username;
	let domain;
	if ( email === null || email.content === null ) {
		email		= "";
		username	= "";
		domain		= settings.domain;
	} else if ( ~email.content.indexOf("@") ) {
		email		= email.content;
		username	= email.split("@")[0];
		domain		= email.split("@")[1];
	} else {
		username	= email.content;
		domain		= settings.domain;
		email		= username + "@" + domain;
	}

	const imapenc	= settings.imap.socket === "STARTTLS" ? "TLS" : settings.imap.socket;
	const popenc	= settings.pop.socket === "STARTTLS" ? "TLS" : settings.pop.socket;
	const smtpenc	= settings.smtp.socket === "STARTTLS" ? "TLS" : settings.smtp.socket;

	const imapssl	= settings.imap.socket === "SSL" ? "on" : "off";
	const popssl	= settings.pop.socket === "SSL" ? "on" : "off";
	const smtpssl	= settings.smtp.socket === "SSL" ? "on" : "off";

	yield this.render("autodiscover", {
		schema: xmlns,
		email,
		username,
		domain,
		imapenc,
		popenc,
		smtpenc,
		imapssl,
		popssl,
		smtpssl
	});
}

router.get("/autodiscover/autodiscover.xml", autodiscover);
router.post("/autodiscover/autodiscover.xml", autodiscover);
router.get("/Autodiscover/Autodiscover.xml", autodiscover);
router.post("/Autodiscover/Autodiscover.xml", autodiscover);


// Thunderbird
router.get("/mail/config-v1.1.xml", function *autoconfig() {
	this.set("Content-Type", "application/xml");
	yield this.render("autoconfig");
});


// iOS / Apple Mail (/email.mobileconfig?email=username@domain.com or /email.mobileconfig?email=username)
router.get("/email.mobileconfig", function *autoconfig() {
	let email = this.request.query.email;

	if (!email) {
		this.status = 400;

		return;
	}

	let username;
	let domain;
	if ( ~email.indexOf("@") ) {
		username	= email.split("@")[0];
		domain		= email.split("@")[1];
	} else {
		username	= email;
		domain		= settings.domain;
		email		= username + "@" + domain;
	}

	const filename	= `${domain}.mobileconfig`;

	const imapssl	= settings.imap.socket === "SSL" || settings.imap.socket === "STARTTLS" ? "true" : "false";
	const popssl	= settings.pop.socket === "SSL" || settings.pop.socket === "STARTTLS" ? "true" : "false";
	const smtpssl	= settings.smtp.socket === "SSL" || settings.smtp.socket === "STARTTLS" ? "true" : "false";
	const ldapssl	= settings.ldap.socket === "SSL" || settings.ldap.port === "636" ? "true" : "false";

	this.set("Content-Type", "application/x-apple-aspen-config; charset=utf-8");
	this.set("Content-Disposition", `attachment; filename="${filename}"`);

	yield this.render("mobileconfig", {
		email,
		username,
		domain,
		imapssl,
		popssl,
		smtpssl,
		ldapssl
	});
});


// Generic support page
router.get("/", function *index() {
	yield this.render("index.html");
});

router.get("/favicon.ico", function *icon() {
	yield this.render("favicon.ico");
});

app.context.render = swig({
	root: path.join(__dirname, "views"),
	autoescape: true,
	cache: "memory",
	ext: "xml",
	locals: settings
});

app.use(function *fixContentType(next) {
	let type = this.request.headers["content-type"];

	if (type && type.indexOf("text/xml") === 0) {
		let newType = type.replace("text/xml", "application/xml");

		this.request.headers["content-type"] = newType;
	}

	yield next;
});

app.use(body());
app.use(router.routes());
app.use(router.allowedMethods());

app.listen(process.env.PORT || 8000);
