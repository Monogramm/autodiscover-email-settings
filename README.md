# autodiscover.xml
Provides IMAP/SMTP Autodiscover capabilities on Microsoft Outlook/Apple Mail, Autoconfig capabilities for Thunderbird, and Configuration Profiles for iOS/Apple Mail.

[![Deploy](https://www.herokucdn.com/deploy/button.png)](https://heroku.com/deploy)


## Microsoft Outlook/Apple Mail
URL (POST XML): https://autodiscover.tiliq.com/Autodiscover/Autodiscover.xml

Create a SRV DNS Record:

|    Service    | Protocol | Value, Destination, Target | Port | Priority | Weight | TTL  |
|:-------------:|:--------:|:--------------------------:|:----:|:--------:|:------:|:----:|
| _autodiscover |   _tcp   |   autodiscover.tiliq.com   |  443 |     5    | 0      | 3600 |

Test your Autodiscover configuration (Microsoft Outlook): https://testconnectivity.microsoft.com (Click on "Outlook Autodiscover")

## Mozilla Thunderbird
URL (GET): https://autoconfig.tiliq.com/mail/config-v1.1.xml

Create a CNAME DNS Record:

| Name, Host, Alias |  Value, Destination  |  TTL |
|:-----------------:|:--------------------:|:----:|
|     autoconfig    | autoconfig.tiliq.com | 3600 |

## iOS / Apple Mail
URL (GET): https://autodiscover.tiliq.com/email.mobileconfig?email=EMAIL_ADDRESS

Redirect users to above URL and the MobileConfig Profile will be downloaded. The user will be instructed to install the profile to configure their email.

## Notes

The above autoconfiguration methods assume the following:

* IMAP Server: `imap.{{domain}}`
* IMAP Port: `993`
* SMTP Server: `smtp.{{domain}}`
* SMTP Port: `587`
* Username: `{{email}}` (Entire email address)
* Encryption: SSL/TLS

Also, if you use the hosted versions of the above tools via Tiliq.com, please note that we log all requests which may include query strings containing email addresses.

Although we do not use the information in the query strings, we are telling you so that if you want to feel safer with your information, you can (and should) deploy your own copy of this repository using the Heroku Deploy button above.

## Workarounds

#### I only have one mail server with both IMAP and SMTP on the same machine (mail.mydomain.com).

Create CNAME DNS Records that alias imap/smtp to your machine, like so:

| Name, Host, Alias | Value, Destination |  TTL |
|:-----------------:|:------------------:|:----:|
|        imap       |  mail.mydomain.com | 3600 |
|        smtp       |  mail.mydomain.com | 3600 |

#### My settings are different or not compatible with these settings.

Feel free to fork this repository and modify it to your needs.

## License

This project is distributed under the [MIT License](LICENSE)
