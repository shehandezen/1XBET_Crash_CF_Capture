const puppeteer = require("puppeteer-extra");
const launch = require("./launch");
const fs = require('fs');
const wait = (ms) => new Promise(res => setTimeout(res, ms));

//get WsEndpoint
async function getWsEndpoint() {
  let wsEndpoint = await launch();
  return wsEndpoint;
}
let x
(async () => {
  const browser = await puppeteer.connect({
    browserWSEndpoint: await getWsEndpoint(),
    defaultViewport: null,
  });

  let page = await browser.newPage();
  await page.goto("https://1xbet.com/en/allgamesentrance/crash", { timeout: 60000 });
  await page.setViewport({
    width: 900,
    height: 800,
    isMobile: false,
    isLandscape: true,
    hasTouch: false,
    deviceScaleFactor: 1
  })

  const client = await page.target().createCDPSession()

  await client.send('Network.enable')

  client.on('Network.webSocketFrameReceived', ({ requestId, timestamp, response }) => {
    let payloadString = response.payloadData.toString('utf8');
   

    try {

      if (payloadString.includes('"target":"OnStart"')) {

        payloadString = payloadString.replace(/[^\x20-\x7E]/g, '');
        const payload = JSON.parse(payloadString);
        console.log(payload)
        fs.appendFile('data.txt', payload, (err) => {
          if (err) throw err;
        });
        const { ts } = payload.arguments[0];
        x = ts
      }
      if (payloadString.includes('"type":1,"target":"OnCrash"')) {
        
        payloadString = payloadString.replace(/[^\x20-\x7E]/g, '');
        const payload = JSON.parse(payloadString);
        fs.appendFile('data.txt', payload, (err) => {
          if (err) throw err;
        });
        const { f, ts } = payload.arguments[0];
        console.log(`${timestamp} >> ${f}, ${x}, ${ts}`);
        const csvData = `${f},${x},${ts}\n`;

        fs.appendFile('data.csv', csvData, (err) => {
          if (err) throw err;
        });
      }
    } catch (error) {
      console.error('Error processing WebSocket frame:', error);
    }
  });

  while (true) {
    await page.keyboard.press("Tab");
    await wait(1000);

    await wait(1000);
  }
})();





