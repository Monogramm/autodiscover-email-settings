# autodiscover.xml

Provides IMAP/SMTP Autodiscover capabilities on Microsoft Outlook/Apple Mail, Autoconfig capabilities for Thunderbird, and Configuration Profiles for iOS/Apple Mail.

#### DNS settings

For the case you are using Bind and have the autoconfig HTTP server running on the same IP your `www.` subdomain resolves to, you can use this DNS records to configure your nameserver

```
autoconfig              IN      CNAME   www
autodiscover            IN      CNAME   www

@                       IN      MX 10   {{$MX_DOMAIN}}.
@                       IN      TXT     "mailconf=https://autoconfig.{{$DOMAIN}}/mail/config-v1.1.xml"
_imaps._tcp             SRV 0 1 993     {{$MX_DOMAIN}}.
_submission._tcp        SRV 0 1 465     {{$MX_DOMAIN}}.
_autodiscover._tcp      SRV 0 0 443     autodiscover.{{$DOMAIN}}.
```

Instead of a CNAME, you can of course also choose an A-record

```
autoconfig              IN      A      {{$AUTODISCOVER_IP}}
autodiscover            IN      A      {{$AUTODISCOVER_IP}}
```

Replace above variables with data according to this table

| Variable        | Description                         |
| --------------- | ----------------------------------- |
| MX_DOMAIN       | The hostname name of your MX server |
| DOMAIN          | Your apex/bare/naked Domain         |
| AUTODISCOVER_IP | IP of the Autoconfig HTTP           |

---

## Notes

The above autoconfiguration methods assume the following:

* Username: `{{email}}` (Entire email address)
* Encryption: SSL/TLS

## Workarounds

#### I only have one mail server with both IMAP and SMTP on the same machine (mail.mydomain.com).

Create CNAME DNS Records that alias imap/smtp to your machine, like so:

| Name, Host, Alias | Value, Destination | TTL  |
| :---------------: | :----------------: | :--: |
|       imap        | mail.mydomain.com  | 3600 |
|       smtp        | mail.mydomain.com  | 3600 |

#### My settings are different or not compatible with these settings.

Feel free to fork this repository and modify it to your needs.

## License

This project is distributed under the [MIT License](LICENSE)
