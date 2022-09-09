const puppeteer = require('puppeteer');

const makePdf = async function (language, payloadUrl) {
    const browser = await puppeteer.launch({
        args: [
            '--disable-web-security',
            '--disable-features=IsolateOrigins',
            '--disable-site-isolation-trials'
        ]
    });
    const page = await browser.newPage();
    let baseUrl = new URL(`http://pboml-parser--parseur-pboml.s3.ca-central-1.amazonaws.com/${language === 'fr' ? "index.fr.html" : 'index.html'}`);
    baseUrl.searchParams.set('payload-url', payloadUrl)
    await page.goto(baseUrl.toString(), {
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
        headerTemplate: '<div></div>',
        footerTemplate: `<div style="font-size: 12px;text-align:center;width:100%;padding: 0 0.6cm"><span class='pageNumber'></span> / <span class='totalPages'></span></div>`,
    });

    await browser.close();
};

(async () => {
    // Test with https://pbo-epc-utils.s3.ca-central-1.amazonaws.com/epc-2021-1.0.0.yaml
    await makePdf("en", process.argv[2]);
    await makePdf("fr", process.argv[2]);
})();