FROM php:8.3-cli

RUN useradd -r -u 1001 -m -d /home/labrunner -s /usr/sbin/nologin labrunner

WORKDIR /app

COPY --chown=root:root . /app

RUN echo 'expose_php = Off' > /usr/local/etc/php/conf.d/hardening.ini

# files/ is fully writable — session subfolders are created here at runtime
RUN mkdir -p /app/files \
    && chown -R labrunner:labrunner /app/files \
    && chmod 755 /app/files

# secret/ is readable but never writable — flag lives here
RUN mkdir -p /app/files/secret/nothing \
    && chown -R root:root /app/files/secret \
    && chmod -R 755 /app/files/secret

# Lock down everything outside files/
RUN chmod -R a-w /app \
    && chmod -R u+w /app/files \
    && chmod -R a-w /app/files/secret

# Sticky bit on files/ — students can't delete each other's session folders
RUN chmod +t /app/files

# Block destructive PHP functions only.
# system/exec/shell_exec/passthru kept ON — webshell needs them.
# unlink/rename/rmdir disabled — uploaded shell can't delete files.
# mkdir disabled — shell can't create new directories outside upload flow.
RUN { \
      echo 'disable_functions = unlink,rename,rmdir,copy,chmod,chown,chgrp'; \
    } >> /usr/local/etc/php/conf.d/hardening.ini

USER labrunner

EXPOSE 10000
CMD ["sh", "-c", "php -S 0.0.0.0:${PORT:-10000} router.php"]
