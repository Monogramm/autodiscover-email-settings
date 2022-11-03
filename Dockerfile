FROM node:lts-alpine

EXPOSE 8000

WORKDIR /app
COPY package.json yarn.lock index.js settings.js /app/

RUN set -ex; \
    node --version; \
    yarn --version; \
    yarn --prod; \
    yarn cache clean

COPY views /app/views

CMD ["node", "/app/index"]

# Arguments to label built container
ARG VCS_REF=unknown
ARG BUILD_DATE=unknown
ARG VERSION=1.4.0

# Container labels (http://label-schema.org/)
# Container annotations (https://github.com/opencontainers/image-spec)
LABEL maintainer="Monogramm Maintainers <opensource at monogramm dot io>" \
      product="Autodiscover Email Settings" \
      version=$VERSION \
      org.label-schema.vcs-ref=$VCS_REF \
      org.label-schema.vcs-url="https://github.com/Monogramm/autodiscover-email-settings" \
      org.label-schema.build-date=$BUILD_DATE \
      org.label-schema.name="Autodiscover Email Settings" \
      org.label-schema.description="Provides Autodiscover capabilities for IMAP/POP/SMTP/LDAP services on Microsoft Outlook/Apple Mail and Autoconfig capabilities for Thunderbird" \
      org.label-schema.url="https://github.com/Monogramm/autodiscover-email-settings" \
      org.label-schema.vendor="Monogramm" \
      org.label-schema.version=$VERSION \
      org.label-schema.schema-version="1.0" \
      org.opencontainers.image.revision=$VCS_REF \
      org.opencontainers.image.source="https://github.com/Monogramm/autodiscover-email-settings" \
      org.opencontainers.image.created=$BUILD_DATE \
      org.opencontainers.image.title="Autodiscover Email Settings" \
      org.opencontainers.image.description="Provides Autodiscover capabilities for IMAP/POP/SMTP/LDAP services on Microsoft Outlook/Apple Mail and Autoconfig capabilities for Thunderbird" \
      org.opencontainers.image.url="https://github.com/Monogramm/autodiscover-email-settings" \
      org.opencontainers.image.vendor="Monogramm" \
      org.opencontainers.image.version=$VERSION \
      org.opencontainers.image.authors="Monogramm Maintainers <opensource at monogramm dot io>"
