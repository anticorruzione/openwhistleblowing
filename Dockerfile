############################################
#                                          #
# BUILD PHASE                              #
#                                          #
############################################
FROM centos:7 AS BUILDER
MAINTAINER supporto.sviluppo@laserromae.it

# installing maven
RUN yum -y install maven rpm-build

# creating the rpm
COPY AUTHORS LICENSE pom.xml /root/
COPY src /root/src
RUN cd /root; mvn package

############################################
#                                          #
# EXEC PHASE                               #
#                                          #
############################################
FROM centos:7
# package prerequisites
RUN yum -y install epel-release

# postgres config
RUN yum -y install https://download.postgresql.org/pub/repos/yum/9.6/redhat/rhel-6-x86_64/pgdg-redhat-repo-latest.noarch.rpm && yum -y install postgresql96-devel

# backend specific instructions
COPY --from=BUILDER /root/target/rpm/owb/RPMS/x86_64/owb-1.0.4-1.x86_64.rpm /root/
RUN yum -y install /root/owb-1.0.4-1.x86_64.rpm

EXPOSE 80

# entrypoint
COPY src/scripts/entrypoint.sh /
RUN chmod 755 /entrypoint.sh

ENTRYPOINT ["/bin/bash", "/entrypoint.sh" ]
