# autodiscover.xml
Provides IMAP/SMTP Autodiscover capabilities on Microsoft Outlook/Apple Mail, Autoconfig capabilities for Thunderbird, and Configuration Profiles for iOS/Apple Mail.

[![Deploy](https://www.herokucdn.com/deploy/button.png)](https://heroku.com/deploy)

## Microsoft Outlook/Apple Mail
URL (POST XML): https://{{app_domain}}/Autodiscover/Autodiscover.xml

Create a SRV DNS Record:

|    Service    | Protocol | Value, Destination, Target | Port | Priority | Weight | TTL  |
|:-------------:|:--------:|:--------------------------:|:----:|:--------:|:------:|:----:|
| _autodiscover |   _tcp   |   {{app_domain}}   |  443 |     5    | 0      | 3600 |

Test your Autodiscover configuration (Microsoft Outlook): https://testconnectivity.microsoft.com (Click on "Outlook Autodiscover")

## Mozilla Thunderbird
URL (GET): https://{{app_domain}}/mail/config-v1.1.xml

Create a CNAME DNS Record:

| Name, Host, Alias |  Value, Destination  |  TTL |
|:-----------------:|:--------------------:|:----:|
|     autoconfig    | {{app_domain}} | 3600 |

## iOS / Apple Mail
URL (GET): https://{{app_domain}}/email.mobileconfig?email=EMAIL_ADDRESS

Redirect users to above URL and the MobileConfig Profile will be downloaded. The user will be instructed to install the profile to configure their email.

## Notes

The above autoconfiguration methods assume the following:

* Username: `{{email}}` (Entire email address)
* Encryption: SSL/TLS

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
