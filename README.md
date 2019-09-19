# autodiscover-email-settings

[![Docker Pulls](https://img.shields.io/docker/pulls/monogramm/autodiscover-email-settings.svg)](https://hub.docker.com/r/monogramm/autodiscover-email-settings/)
[![](https://images.microbadger.com/badges/version/monogramm/autodiscover-email-settings.svg)](https://microbadger.com/images/monogramm/autodiscover-email-settings)
[![Docker layers](https://images.microbadger.com/badges/image/monogramm/autodiscover-email-settings.svg)](https://microbadger.com/images/monogramm/autodiscover-email-settings)

This service is created to autodiscover your provider email settings.

It provides IMAP/SMTP Autodiscover capabilities on Microsoft Outlook/Apple Mail, Autoconfig capabilities for Thunderbird, and Configuration Profiles for iOS/Apple Mail.

**A simple support page is also available at the root of the autodiscover domain.**

### DNS settings

```
autoconfig              IN      A      {{$AUTODISCOVER_IP}}
autodiscover            IN      A      {{$AUTODISCOVER_IP}}
imap                    IN      CNAME  {{$MX_DOMAIN}}.
smtp                    IN      CNAME  {{$MX_DOMAIN}}.
@                       IN      MX 10  {{$MX_DOMAIN}}.
@                       IN      TXT    "mailconf=https://autoconfig.{{$DOMAIN}}/mail/config-v1.1.xml"
_imaps._tcp             IN      SRV    0 0 {{IMAP_PORT}} {{MX_DOMAIN}}.
_submission._tcp        IN      SRV    0 0 {{SMTP_PORT}} {{MX_DOMAIN}}.
_autodiscover._tcp      IN      SRV    0 0 443 autodiscover.{{$DOMAIN}}.
```

Replace above variables with data according to this table

| Variable        | Description                         |
| --------------- | ----------------------------------- |
| MX_DOMAIN       | The hostname name of your MX server |
| DOMAIN          | Your apex/bare/naked Domain         |
| AUTODISCOVER_IP | IP of the Autoconfig HTTP           |
| IMAP_PORT       | Port for the IMAP server            |
| SMTP_PORT       | Port for the SMTP server            |

---

### Usage

[traefik](https://github.com/containous/traefik) can proxy your containers on docker, on docker swarm, and on a wide range of orchestrators.
You can also achieve this with another proxy like [Nginx](https://www.nginx.com/) for instance.

#### docker

```yaml
version: '2'

services:
  autodiscover-domain-com:
    image: monogramm/autodiscover-email-settings:latest
    environment:
      - COMPANY_NAME=Company
      - SUPPORT_URL=https://autodiscover.domain.com
      - DOMAIN=domain.com
      - IMAP_HOST=imap.domain.com
      - IMAP_PORT=993
      - IMAP_SOCKET=SSL
      - SMTP_HOST=smtp.domain.com
      - SMTP_PORT=587
      - SMTP_SOCKET=STARTTLS
      - PROFILE_IDENTIFIER=com.domain.autodiscover
      - PROFILE_UUID=48C88203-4DB9-49E8-B593-4831903605A0
      - MAIL_UUID=7A981A9E-D5D0-4EF8-87FE-39FD6A506FAC
    labels:
      - "traefik.port=8000"
      - "traefik.frontend.rule=Host:autoconfig.domain.com,autodiscover.domain.com"
```

#### docker swarm

```yaml
version: '3'

services:
  autodiscover-domain-com:
    image: monogramm/autodiscover-email-settings:latest
    environment:
      - COMPANY_NAME=Company
      - SUPPORT_URL=https://autodiscover.domain.com
      - DOMAIN=domain.com
      - IMAP_HOST=imap.domain.com
      - IMAP_PORT=993
      - IMAP_SOCKET=SSL
      - SMTP_HOST=smtp.domain.com
      - SMTP_PORT=587
      - SMTP_SOCKET=STARTTLS
      - PROFILE_IDENTIFIER=com.domain.autodiscover
      - PROFILE_UUID=48C88203-4DB9-49E8-B593-4831903605A0
      - MAIL_UUID=7A981A9E-D5D0-4EF8-87FE-39FD6A506FAC
    deploy:
      replicas: 1
      labels:
        - "traefik.port=8000"
        - "traefik.frontend.rule=Host:autoconfig.domain.com,autodiscover.domain.com"
```

### Credits

Inspired from https://github.com/sylvaindumont/autodiscover.xml, but without the few restrictions mentioned in the original project notes and with a simple support page to allow manual setup and iOS profile download.

The original project was inspired from https://github.com/johansmitsnl/docker-email-autodiscover, but with https://github.com/monogramm/autodiscover-email-settings instead of https://github.com/gronke/email-autodiscover to allow a much lighter ([![](https://images.microbadger.com/badges/image/weboaks/autodiscover-email-settings.svg)](https://microbadger.com/images/weboaks/autodiscover-email-settings)) image based of node on alpine instead of apache on debian ([![](https://images.microbadger.com/badges/image/jsmitsnl/docker-email-autodiscover.svg)](https://microbadger.com/images/jsmitsnl/docker-email-autodiscover))

### Notes

The above autoconfiguration methods assume the following:

* If username does not contain `@`, full email address will be generated based on domain settings

### Links

* Mozilla [Autoconfig configuration](https://developer.mozilla.org/en-US/docs/Mozilla/Thunderbird/Autoconfiguration/FileFormat/HowTo)
* Microsoft [Exchange Command Reference](https://docs.microsoft.com/en-us/openspecs/exchange_server_protocols/ms-ascmd/1a3490f1-afe1-418a-aa92-6f630036d65a)
* Apple [ConfigurationProfile reference](https://developer.apple.com/library/archive/featuredarticles/iPhoneConfigurationProfileRef/index.html)

* [Bootstrap](https://getbootstrap.com/), [jQuery](https://jquery.com/) and [Popper.js](https://popper.js.org/) used for default support page

### License

This project is distributed under the [MIT License](LICENSE)
