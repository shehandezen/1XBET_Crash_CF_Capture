const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

module.exports = async () => {
    try {

        // 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
        const options = {
            executablePath: process.env.NODE_ENV == 'production' ? process.env.PUPPETEER_EXECUTABLE_PATH : puppeteer.executablePath() ,
            headless: true,
            devtools: false,
            ignoreHTTPSErrors: true,
            args: [
                '--start-maximized',
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--ignore-certificate-errors',
            ],
            ignoreDefaultArgs:['--enable-automation', '--disable-extensions'],
            slowMo: 10
        };
        await puppeteer.use(StealthPlugin());
        const browser = await puppeteer.launch(options);
        let pagesCount = await browser.pages();
        const browserWSEndpoint = await browser.wsEndpoint();
        // console  WSEndPoint say : "ws://127.0.0.1:42207/devtools/browser/dbb2525b-ce44-43c2-a335-ff15d0306f36"
        console.log("browserWSEndpoint----- :> ", browserWSEndpoint);
        await browser.disconnect();
        return browserWSEndpoint;
    } catch (err) {
        console.error(err);
        process.exit(1);
        return false;
    }
};
