#!/bin/bash

my_ip=$( ifconfig eth0 | grep inet | tr -s ' ' |  cut -d ' ' -f 3 | cut -d ':' -f 2 )

sed -i "s/^HOSTS_LIST=127.0.0.1,localhost.*/HOSTS_LIST=127.0.0.1,localhost,${my_ip}/g" /etc/default/owb
sed -i "s/^ALLOWED_SRC_IP=.*/ALLOWED_SRC_IP=( 127.0.0.1 ${my_ip} 0.0.0.0 )/g" /etc/default/owb
sed -i "s/^ALLOWED_DST_IP=.*/ALLOWED_DST_IP=( 127.0.0.1 ${my_ip} )/g" /etc/default/owb
sed -i 's/^DISABLE_MAIL_NOTIFICATION=.*/DISABLE_MAIL_NOTIFICATION=1/g' /etc/default/owb

[ -n "$DB_URI" ] && sed -i "s#\(.*\)self.db_uri =.*#\1self.db_uri = '${DB_URI}'#g" /usr/local/owb/lib/python2.7/dist-packages/globaleaks/settings.py

/etc/init.d/tor start &> /dev/null
/etc/init.d/owb start

while [ true ]; do sleep 5; done
