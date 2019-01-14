#!/bin/bash

function logThis(){
  echo "$( date +"%Y-%m-%d %H:%M:%S" ) $1"
}

logThis "configuration"
source /etc/profile.d/owb.sh
ldconfig -v &> /dev/null

cd /usr/bin
ln -s /usr/pgsql-9.6/bin/pg_config

useradd -d /var/lib/tor -s /bin/false owb

# creating the virtualenv
cd /usr/local/owb && virtualenv backend && source backend/bin/activate && pip install -r /usr/local/owb/backend/usr/share/requirements.txt && pip install pysqlcipher --install-option="--bundled"

# fix for the zope in virtual env installation
touch /usr/local/owb/backend/lib/python2.7/site-packages/zope/__init__.py

# Create globaleaks service directories with proper permissions.
[ -d /var/owb ] ||  mkdir -p /var/owb
chown owb:owb /var/owb
chmod 700 /var/owb

[ -d /var/run/owb ] || mkdir -p /var/run/owb
chown -R owb:owb /var/run/owb
chmod 700 /var/run/owb

[ -d /dev/shm/owb ] || mkdir -p /dev/shm/owb
chown -R owb:owb /dev/shm/owb
chmod 700 /dev/shm/owb

# Remove old configuration of Tor used before txtorcon adoption
if $(grep -q -i owb /etc/tor/torrc >/dev/null 2>&1); then
  sed -i '/BEGIN Owb/,/END Owb/d' /etc/tor/torrc
  service tor restart
fi

# adds the virtualenv auto loading
echo "source /usr/local/owb/backend/bin/activate" >> /etc/profile.d/owb.sh

# raise haveged default water mark to 4067 bits
# for the reason for the 4067 bits see:
#   - https://github.com/globaleaks/GlobaLeaks/issues/1722
sed -i 's/-w 1024/-w 4067/g' /usr/lib/systemd/system/haveged.service
systemctl daemon-reload
systemctl enable haveged
systemctl start haveged

# adding the service to autostart
systemctl enable owb
systemctl enable tor

systemctl start owb
systemctl start tor

exit 0
