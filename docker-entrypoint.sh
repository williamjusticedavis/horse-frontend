#!/bin/sh
set -e

# Replace the build-time placeholder with the real API URL from the environment.
# This allows VITE_API_URL to be set as a runtime env var on platforms like Render
# that don't support Docker build args.
if [ -n "$VITE_API_URL" ] && [ "$VITE_API_URL" != "VITE_API_URL_PLACEHOLDER" ]; then
  find /usr/share/nginx/html -name '*.js' \
    -exec sed -i "s|VITE_API_URL_PLACEHOLDER|$VITE_API_URL|g" {} \;
fi

exec nginx -g 'daemon off;'
