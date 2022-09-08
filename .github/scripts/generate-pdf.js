const puppeteer = require('puppeteer');

const makePdf = async function (language) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    let rootFile = language === 'en' ? "index.html" : 'index.fr.html';
    await page.goto('https://pboml-parser--parseur-pboml.s3.ca-central-1.amazonaws.com/index.html', {
        waitUntil: 'networkidle2',
    });
    await page.pdf({
        path: `pboml-gen-${language}.pdf`,
        format: 'Letter',
        margin: {
            top: "1.2cm",
            left: "1.2cm",
            bottom: "1.2cm",
            right: "1.2cm",
        },
        displayHeaderFooter: true,
        headerTemplate: '',
        footerTemplate: `<div style="font-size: 12px;"><span class='pageNumber'></span> / <span class='totalPages'></span></div>`,
    });

    await browser.close();
};

(async () => {
    await makePdf("en");
    await makePdf("fr");
})();