#!/bin/bash

# simple script which sets the default config in
# /etc/default/owb

echo "Indicare gli hostname con cui é possibile"
echo "raggiungere l'applicazione, ad esempio"
echo "$( hostname ). É possibile indicare piú"
echo "nomi separati da virgola"

read ANSWER

# changing values
[ -n "${ANSWER}" ] && ANSWER=",${ANSWER}"
IPS="$( ifconfig | grep inet | tr -s ' ' |  cut -d ' ' -f 3 | cut -d ':' -f 2 | sed '/^$/d' | tr '\n' ' ' | sed 's# $##g' )"
HOSTS="$( echo "${IPS}" | tr ' ' ',' )${ANSWER}"

sed -i "s/^HOSTS_LIST=.*/HOSTS_LIST=${HOSTS}/g" /etc/default/owb
sed -i "s/^ALLOWED_SRC_IP=.*/ALLOWED_SRC_IP=( 127.0.0.1 ${IPS} )/g" /etc/default/owb
sed -i "s/^ALLOWED_DST_IP=.*/ALLOWED_DST_IP=( 127.0.0.1 ${IPS} )/g" /etc/default/owb

/etc/init.d/owb restart
