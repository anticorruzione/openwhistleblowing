# Openwhistleblowing

## Release notes

### 1.0.1 (04.04.2019)
- aggiunte variabili EXTERNAL_HOSTNAME, DISABLE_MAIL_NOTIFICATION nell'init del container Docker
- aggiunte le ON DELETE CASCADE mancanti nello schema del DB
- sistemato badge HTTPS/TOR nella WebUI

### 1.0.2 (17.07.2019)
- aggiunta la possibilità di annullare l'upload del file
- aggiunta la possibilità per gli istruttori di inserire degli allegati non visibili al segnalante
- aggiunta la possibilità per il custode di visionare il contenuto della segnalazione nel momento della richiesta dell'identità del segnalante
- update delle librerie python-gnupg, twisted, pillow
- eseguire lo script upgrade_1.0.1_to_1.0.2.sql dentro al folder /var/owb/db per aggiornare il database, prima del restart dell'applicazione
```bash
cd /var/owb/db/
sqlite glbackend-30.db < upgrade_1.0.1_to_1.0.2.sql
```

### 1.0.3 (16.07.2020)
- aggiornamento della UI
- eseguire lo script upgrade_1.0.2_to_1.0.3.sql dentro al folder /var/owb/db per aggiornare il database, prima del restart dell'applicazione
```bash
cd /var/owb/db/
sqlite glbackend-30.db < upgrade_1.0.2_to_1.0.3.sql
```

### 1.0.4 (16.10.2020)
- fix varie
- eseguire lo script upgrade_1.0.3_to_1.0.4.sql dentro al folder /var/owb/db per aggiornare il database, prima del restart dell'applicazione
```bash
cd /var/owb/db/
sqlite glbackend-30.db < upgrade_1.0.3_to_1.0.4.sql
```

### 1.0.5 (25.06.2021)
- corretto URL nel templating email
- eseguire lo script upgrade_1.0.4_to_1.0.5.sql dentro al folder /var/owb/db per aggiornare il database, prima del restart dell'applicazione
```bash
cd /var/owb/db/
sqlite glbackend-30.db < upgrade_1.0.4_to_1.0.5.sql
```
