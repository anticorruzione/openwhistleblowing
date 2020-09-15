coverage-collector
==================

a simple server for collection of code coverage objects

###Starting the server
```
    var collector=require('coverage-collector');
    collector({port:3001});
```

###Collecting data
```curl -X POST http://localhost:3001/data -H "Content-Type: application/json" -d '{"coverage":"object"}'```

###Retrieving collected data
```curl -X GET http://localhost:3001/data```
returns
```[{"coverage":"object"}]```

###Stopping the server
```curl -X GET http://localhost:3001/done```

###Contributing
If you have issues or you want to discuss other use cases, feel free to open an issue or send a pull request on github
