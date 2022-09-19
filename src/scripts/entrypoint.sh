#!/bin/bash

IPS="$( ifconfig | grep inet | tr -s ' ' |  cut -d ' ' -f 3 | cut -d ':' -f 2 | sed '/^$/d' | tr '\n' ' ' | sed 's# $##g' )"
HOSTS="localhost,$( echo "${IPS}" | tr ' ' ',' )"
[ -n "${EXTERNAL_HOSTNAME}" ] && HOSTS="${HOSTS},${EXTERNAL_HOSTNAME}"

sed -i "s/^HOSTS_LIST=.*/HOSTS_LIST=${HOSTS}/g" /etc/default/owb
sed -i "s/^ALLOWED_SRC_IP=.*/ALLOWED_SRC_IP=( ${IPS} )/g" /etc/default/owb
sed -i "s/^ALLOWED_DST_IP=.*/ALLOWED_DST_IP=( ${IPS} )/g" /etc/default/owb

[ -n "${DISABLE_MAIL_NOTIFICATION}" ] && [ ${DISABLE_MAIL_NOTIFICATION} -eq 0 ] && {
  sed -i 's/^DISABLE_MAIL_NOTIFICATION=.*/DISABLE_MAIL_NOTIFICATION=0/g' /etc/default/owb
} || {
  sed -i 's/^DISABLE_MAIL_NOTIFICATION=.*/DISABLE_MAIL_NOTIFICATION=1/g' /etc/default/owb
}

[ -n "$DB_URI" ] && sed -i "s#\(.*\)self.db_uri =.*#\1self.db_uri = '${DB_URI}'#g" /usr/local/owb/lib/python2.7/dist-packages/globaleaks/settings.py

/etc/init.d/tor start &> /dev/null
/etc/init.d/owb start

while [ true ]; do sleep 5; done
