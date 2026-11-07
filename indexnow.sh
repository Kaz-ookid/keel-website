#!/bin/sh
# Tell IndexNow (Bing, DuckDuckGo, Yandex, Seznam, Naver) which pages changed.
# Usage, after a push:  sh indexnow.sh https://keel-app.ch/ https://keel-app.ch/fr/
# Only submit pages whose content changed; repeats of unchanged URLs count as spam.
KEY=e1af74b129df46f3beade88037de971f
LIST=$(printf '"%s",' "$@" | sed 's/,$//')
curl -s -o /dev/null -w "IndexNow: %{http_code}\n" -X POST "https://api.indexnow.org/IndexNow" \
  -H "Content-Type: application/json; charset=utf-8" \
  -d "{\"host\":\"keel-app.ch\",\"key\":\"$KEY\",\"keyLocation\":\"https://keel-app.ch/$KEY.txt\",\"urlList\":[$LIST]}"
