#!/bin/sh

# If TMDB_API_KEY is provided at runtime, replace the placeholder in the JS bundle
if [ -n "$TMDB_API_KEY" ]; then
  echo "Injecting TMDB_API_KEY into static files..."
  find /usr/share/nginx/html/assets -type f -name "*.js" -exec sed -i "s|__TMDB_API_KEY__|${TMDB_API_KEY}|g" {} +
else
  echo "WARNING: TMDB_API_KEY environment variable is not set."
fi

# Pass control to the default Nginx entrypoint
exec "$@"
