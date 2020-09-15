testSetup

In project dir run

    npm install protractor --save-dev

        (--save-dev adds it to the package.json file.)


To run tests against a local instance
-----------------------------------------

First, get your mongodb server up and running. In your root dir run

    mongod --dbpath \data\db

Second, get your app server up and running. In your app dir run

    foreman start

        (you should see the app start running on localhost:5000)
        Open a browser, and go to localhost:5000 to confirm app is running.

Next, get get selenium webdriver server up and running.

    In your app dir run

    ./node_modules/.bin/webdriver-manager update

    (this ensures that your serve is updated)

    ./node_modules/.bin/webdriver-manager start

    (this starts the selenium server and allows interaction with the browser)


    See the Protractor documentation for more info. (node_modules/protractor)


Finally, run your tests.

    In your app dir run

    node_modules/.bin/protractor test/conf.js

Watch them go!
