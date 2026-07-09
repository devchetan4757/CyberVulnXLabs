FROM php:8.3-cli

# 1. Dedicated non-root user that will actually run the app.
RUN useradd -r -u 1001 -m -d /home/labrunner -s /usr/sbin/nologin labrunner

WORKDIR /app

# 2. Copy the codebase in as root. labrunner does NOT own these files,
#    so it can't modify or delete them even with full code execution.
COPY --chown=root:root . /app

# 3. Defense in depth: block the functions an uploaded webshell would use
#    to spawn a real shell (rm, mv, chmod, etc via exec/system/proc_open).
RUN { \
    echo 'disable_functions = exec,shell_exec,system,passthru,proc_open,popen,pcntl_exec,pcntl_fork'; \
    echo 'expose_php = Off'; \
  } > /usr/local/etc/php/conf.d/hardening.ini

# 4. files/ is the only directory the app needs to write to (uploads).
#    Create it, hand it to labrunner, everything else stays root-owned.
RUN mkdir -p /app/files \
    && chown -R labrunner:labrunner /app/files \
    && chmod 775 /app/files

# 5. Strip write permission from the rest of the tree for every user
#    except root, then re-grant it only on files/.
RUN chmod -R a-w /app \
    && chmod -R u+w /app/files

USER labrunner

# Render injects $PORT at runtime; bind to it on 0.0.0.0.
EXPOSE 10000
CMD ["sh", "-c", "php -S 0.0.0.0:${PORT:-10000} router.php"]
