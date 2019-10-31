FROM centos:7
MAINTAINER supporto.sviluppo@laserromae.it

# package prerequisites
RUN yum -y install epel-release

# postgres config
RUN yum -y install https://download.postgresql.org/pub/repos/yum/9.6/redhat/rhel-6-x86_64/pgdg-centos96-9.6-3.noarch.rpm && yum -y install postgresql96-devel

# centos packages
RUN yum -y install maven initscripts which mlocate openssl-devel libffi-devel python-devel haveged net-tools iptables-services unzip python-pip vim gcc python-virtualenv gcc sqlite-devel openssl-static rpm-build

# creating the rpm
COPY pom.xml /root
COPY src /root/src
RUN cd /root; mvn package

# backend specific instructions
RUN yum -y install /root/target/rpm/owb/RPMS/x86_64/owb-1.0.1-1.x86_64.rpm 

EXPOSE 80

COPY src/scripts/entrypoint.sh /
RUN chmod 755 /entrypoint.sh

ENTRYPOINT ["/bin/bash", "/entrypoint.sh" ]
