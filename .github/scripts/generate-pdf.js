const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto('https://pboml-parser--parseur-pboml.s3.ca-central-1.amazonaws.com/index.html', {
        waitUntil: 'networkidle2',
    });
    await page.pdf({ path: 'pbomlexample.pdf', format: 'Letter' });

    await browser.close();
})();