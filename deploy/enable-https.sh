#!/bin/sh
# Run on the server once chess.orciuolo.it resolves to this server.
set -eu
proxy="$HOME/or2-proxy"
app="$HOME/chess-gif-editor"

sudo certbot certonly --webroot -w "$proxy/letsencrypt" -d chess.orciuolo.it --key-type ecdsa

cp "$proxy/nginx/conf.d/chess.conf" /tmp/chess.conf.http
cp "$app/deploy/proxy-https.conf" "$proxy/nginx/conf.d/chess.conf"
if ! docker exec or2-proxy nginx -t; then
	cp /tmp/chess.conf.http "$proxy/nginx/conf.d/chess.conf"
	echo "nginx rejected the HTTPS config; the HTTP config is back in place." >&2
	exit 1
fi
docker exec or2-proxy nginx -s reload
echo "https://chess.orciuolo.it is live."
