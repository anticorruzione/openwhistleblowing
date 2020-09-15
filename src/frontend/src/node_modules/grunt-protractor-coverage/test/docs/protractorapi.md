Protractor API
==============

The most recent API can be found here: http://angular.github.io/protractor/#/api

git protractor

        element.all(locator)
            clone
            all
            filter
            get
            first
            last
            count
            locator
            each
            map
            reduce
            evaluate
            allowAnimations

        element(locator)
            clone
            locator
            getWebElement
            then
            all
            element
            $$
            $
            isPresent
            isElementPresent
            evaluate
            allowAnimations
            isPending

        browser
            waitForAngular
            findElement
            findElements
            isElementPresent
            addMockModule
            clearMockModules
            removeMockModule
            get
            refresh
            navigate
            setLocation
            getLocationAbsUrl
            debugger
            pause

    locators

        by
            addLocator
            binding
            exactBinding
            model
            buttonText
            partialButtonText
            repeater
            cssContainingText
            options

    webdriver

        webdriver.WebDriver
            attachToSession
            createSession
            controlFlow
            schedule
            getSession
            getCapabilities
            quit
            actions
            executeScript
            executeAsyncScript
            call
            wait
            sleep
            getWindowHandle
            getAllWindowHandles
            getPageSource
            close
            get
            getCurrentUrl
            getTitle
            findElement
            isElementPresent
            findElements
            takeScreenshot
            manage
            navigate
            switchTo
            Navigation
            to
            back
            forward
            refresh
            Options
            addCookie
            deleteAllCookies
            deleteCookie
            getCookies
            getCookie
            logs
            timeouts
            window
            Timeouts
            implicitlyWait
            setScriptTimeout
            pageLoadTimeout
            Window
            getPosition
            setPosition
            getSize
            setSize
            maximize
            Logs
            get
            getAvailableLogTypes
            TargetLocator
            activeElement
            defaultContent
            frame
            window
            alert

        webdriver.Key.chord

        webdriver.WebElement
            equals
            getDriver
            getId
            findElement
            isElementPresent
            findElements
            click
            sendKeys
            getTagName
            getCssValue
            getAttribute
            getText
            getSize
            getLocation
            isEnabled
            isSelected
            submit
            clear
            isDisplayed
            getOuterHtml
            getInnerHtml

        webdriver.WebElementPromise


        cancel

        isPending

        then

        thenCatch

        thenFinally

        getId

        webdriver.Alert
            getText
            accept
            dismiss
            sendKeys

        webdriver.AlertPromise

        cancel

        isPending

        then

        thenCatch

        thenFinally

        getText

        accept

        dismiss

        sendKeys

        webdriver.UnhandledAlertError
            getAlertText
            getAlert
