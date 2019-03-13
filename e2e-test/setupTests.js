const webdriver = require('selenium-webdriver')

require('chromedriver')
const driver = new webdriver.Builder().forBrowser(webdriver.Browser.CHROME).build()

driver.get("http://www.bilibili.com")

setTimeout(()=>{
    driver.close()
},60000)