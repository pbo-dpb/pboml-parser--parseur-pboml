const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto('https://pboml-parser--parseur-pboml.s3.ca-central-1.amazonaws.com/index.html', {
        waitUntil: 'networkidle2',
    });
    await page.pdf({
        path: 'pbomlexample.pdf',
        format: 'Letter',
        margin: {
            top: "2cm",
            left: "2cm",
            bottom: "2cm",
            right: "2cm",
        },
        displayHeaderFooter: true,
        footerTemplate: `<div class='text-xs'><span class='pageNumber'></span> / <span class='totalPages'></span></div>`
    });

    await browser.close();
})();