# autodiscover-email-settings

[![Docker Pulls](https://img.shields.io/docker/pulls/weboaks/autodiscover-email-settings.svg)](https://hub.docker.com/r/weboaks/autodiscover-email-settings/) [![Docker layers](https://images.microbadger.com/badges/image/weboaks/autodiscover-email-settings.svg)](https://microbadger.com/images/weboaks/autodiscover-email-settings)

This service is created to autodiscover your provider email settings.

It provides IMAP/SMTP Autodiscover capabilities on Microsoft Outlook/Apple Mail, Autoconfig capabilities for Thunderbird, and Configuration Profiles for iOS/Apple Mail.

#### DNS settings

```
autoconfig              IN      A      {{$AUTODISCOVER_IP}}
autodiscover            IN      A      {{$AUTODISCOVER_IP}}
imap                    IN      A      {{$MX_DOMAIN}}
smtp                    IN      A      {{$MX_DOMAIN}}
@                       IN      MX 10   {{$MX_DOMAIN}}.
@                       IN      TXT     "mailconf=https://autoconfig.{{$DOMAIN}}/mail/config-v1.1.xml"
_imaps._tcp             SRV 0 1 993     {{$MX_DOMAIN}}.
_submission._tcp        SRV 0 1 465     {{$MX_DOMAIN}}.
_autodiscover._tcp      SRV 0 0 443     autodiscover.{{$DOMAIN}}.
```

Replace above variables with data according to this table

| Variable        | Description                         |
| --------------- | ----------------------------------- |
| MX_DOMAIN       | The hostname name of your MX server |
| DOMAIN          | Your apex/bare/naked Domain         |
| AUTODISCOVER_IP | IP of the Autoconfig HTTP           |

---

## Usage

[traefik](https://github.com/containous/traefik) can proxy your containers on docker, on docker swarm, and on a wide range of orchestrators

### docker

```yaml
version: '2'

services:
  autodiscover-domain-com:
    image: weboaks/autodiscover-email-settings:latest
    environment:
    - DOMAIN=domain.com
    - IMAP_HOST=imap.domain.com
    - IMAP_PORT=993
    - SMTP_HOST=smtp.domain.com
    - SMTP_PORT=465
    labels:
      - "traefik.port=8000"
      - "traefik.frontend.rule=Host:autoconfig.domain.com,autodiscover.domain.com"
```

### docker swarm

```yaml
version: '3'

services:
  autodiscover-domain-com:
    image: weboaks/autodiscover-email-settings:latest
    environment:
    - DOMAIN=domain.com
    - IMAP_HOST=imap.domain.com
    - IMAP_PORT=993
    - SMTP_HOST=smtp.domain.com
    - SMTP_PORT=465
    deploy:
      replicas: 1
      labels:
        - "traefik.port=8000"
        - "traefik.frontend.rule=Host:autoconfig.domain.com,autodiscover.domain.com"
```

## Credits

Inspired from https://github.com/johansmitsnl/docker-email-autodiscover, but with https://github.com/Tiliq/autodiscover.xml instead of https://github.com/gronke/email-autodiscover to allow a much lighter image based of node on alpine instead of apache on debian

## Notes

The above autoconfiguration methods assume the following:

* Username: `{{email}}` (Entire email address)
* Encryption: SSL/TLS
  .

## License

This project is distributed under the [MIT License](LICENSE)
