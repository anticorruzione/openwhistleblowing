# Openwhistleblowing

## Introduzione
Questo repository contiene il codice sorgente e il binario pronto per
l'installazione di Openwhistleblowing (release 1.0.4), il software fornito per
l'utilizzo interno di ANAC (Autoritá Nazionale Anti Corruzione).

## Installazione
Al fine di consentire la piú ampia personalizzazione alle Amministrazioni
utilizzatrici del software, lo stesso viene fornito completo di source. É
possibile installarlo seguendo una delle seguenti modalità:

- installazione mediante rpm (RedHat Package Manager)
- installazione utilizzando Docker
- installazione da source (utilizzando maven)

I prerequisiti per l'installazione sono:
- sistema operativo RedHat Enterprise  Linux o Centos 7.*
- 100 GB di disco per lo storage di allegati
- 4 GB RAM (suggeriti 8)

Al termine dell'installazione la password di default degli utenti è password1

### RPM
L'installazione mediante RPM si effettua o utilizzando lo script presente in src/scripts/install.sh,
oppure lanciando manualmente le seguenti istruzioni:

```bash
cd openwhistleblowing
yum -y install epel-release
yum -y install https://download.postgresql.org/pub/repos/yum/reporpms/EL-7-x86_64/pgdg-redhat-repo-latest.noarch.rpm
yum -y install postgresql96-devel
yum -y install binary/owb-1.0.4-1.x86_64.rpm &> /dev/null
```
La configurazione del tool inizialmente puó essere effettuata mediante l'utilizzo dello script
presente in src/scripts/setup.sh . Per ulteriori opzioni di configurazioni, riferirsi alla documentazione
tecnica di progetto.

### Docker
L'installazione mediante docker presuppone che Docker sia installato e funzionante (
riferirsi alla documentazione per [RedHat](https://docs.docker.com/install/linux/docker-ee/rhel/) o
[Centos](https://docs.docker.com/install/linux/docker-ce/centos/)).
Il primo step consiste nel creare l'immagine del container
```bash
cd openwhistleblowing
docker build -t owb:anac .
```
successivamente si puó far partire il container con il seguente comando (per la personalizzazione
del comando di partenza del container si rimanda alla documentazione specifica di docker)
```bash
docker run -d --restart=unless-stopped --name=owb -p 80:80 -v /data:/var/owb/files owb:anac
```
il container accetta due variabili d'ambiente:

| nome                      |   valore  |
|---------------------------|:---------:|
| EXTERNAL_HOSTNAME         |  stringa  |
| DISABLE_MAIL_NOTIFICATION |     0     |

la prima, permette di inserire l'hostname con il quale viene raggiunto il servizio (e.g. myhost.mydomain.local),
la seconda, permette di abilitare il servizio di invio delle email (di default disabilitato).

Per una successiva configurazione é possibile entrare nel container in esecuzione:
```bash
docker exec -it owb /bin/bash
```
effettuare le modifiche e far ripartire il tool con:
```bash
/etc/init.d/owb restart
```

### Source
L'installazione da source permette la piú ampia customizzazione dell'applicativo. Viene
fornito il pom.xml per la creazione dell'rpm che verrà successivamente installato come
da istruzioni precedenti.
Per la pacchettizzazione é necessario installare [maven](https://maven.apache.org/) e 
lanciare il seguente comando:
```bash
cd openwhistleblowing
mvn package
```
alla fine dell'esecuzione il nuovo rpm generato si troverà nel path:
*target/rpm/owb/RPMS/x86_64/*

## Aggiornamento
L'aggiornamento va eseugito, utilizzando uno dei metodi di installazione descritti
nel paragrafo Installazione e seguendo le eventuali istruzioni presenti nel file
RELEASE_NOTES.md
