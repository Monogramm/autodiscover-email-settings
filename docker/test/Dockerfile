FROM alpine:3.12

COPY docker_test.sh /docker_test.sh

RUN set -ex; \
    chmod 755 /docker_test.sh; \
    apk add --update \
        curl \
        git \
    ; \
    \
    rm -rf /var/cache/apk/*

CMD ["/docker_test.sh"]
