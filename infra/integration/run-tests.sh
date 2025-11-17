#!/bin/sh
set -e

echo "Waiting for services..."
sleep 5

echo "Testing OpenResty..."
for i in $(seq 1 105); do
  status=$(curl -s -o /dev/null -w "%{http_code}" http://openresty:8080/)
  echo "OpenResty $i -> $status"
done

if [ "$(curl -s -o /dev/null -w '%{http_code}' http://openresty:8080/)" -ne 429 ]; then
  echo "OpenResty FAILED"
  exit 1
fi

echo "Testing Kong..."
for i in $(seq 1 105); do
  status=$(curl -s -o /dev/null -w "%{http_code}" http://kong:8000/)
  echo "Kong $i -> $status"
done

if [ "$(curl -s -o /dev/null -w '%{http_code}' http://kong:8000/)" -ne 429 ]; then
  echo "Kong FAILED"
  exit 1
fi

echo "Integration tests PASSED"
exit 0
