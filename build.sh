#!/bin/sh
# Builds the Home Screen app (index.html) from the shared BogFit source, src/bogfit.html.
# The same src/bogfit.html is what gets published as the BogFit artifact in Claude.
set -e
cd "$(dirname "$0")"
SRC=src/bogfit.html
{
cat <<'HEAD'
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="theme-color" content="#EEF0EE" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#111513" media="(prefers-color-scheme: dark)">
<link rel="manifest" href="manifest.webmanifest">
<link rel="apple-touch-icon" href="apple-touch-icon.png">
<link rel="icon" type="image/png" href="icon-192.png">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="BogFit">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
HEAD
sed -n '1,/<\/style>/p' "$SRC"
echo '</head>'
echo '<body>'
sed '1,/<\/style>/d' "$SRC"
echo '</body>'
echo '</html>'
} > index.html
# New cache name so installed phones pick up the new version on next open.
sed -i "s/const CACHE = 'bogfit-[^']*'/const CACHE = 'bogfit-$(date +%Y%m%d%H%M%S)'/" sw.js
echo "built index.html ($(wc -c < index.html) bytes)"
