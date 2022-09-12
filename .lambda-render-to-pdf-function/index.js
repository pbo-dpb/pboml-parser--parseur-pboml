const chromium = require("@sparticuz/chrome-aws-lambda");
const fs = require("fs");

const makePdf = async function (language, payloadUrl) {
    let browser;
    /*    browser = await chromium.puppeteer.launch({
          args: [...chromium.args,
                '--disable-web-security',
                '--disable-features=IsolateOrigins',
                '--disable-site-isolation-trials'
                ],
          defaultViewport: chromium.defaultViewport,
          executablePath: await chromium.executablePath,
          headless: chromium.headless,
          //ignoreHTTPSErrors: true,
        });*/
    browser = await chromium.puppeteer.launch({
        args: chromium.args,
        defaultViewport: chromium.defaultViewport,
        executablePath: await chromium.executablePath,
        headless: chromium.headless,
        ignoreHTTPSErrors: true,
    });

    const page = await browser.newPage();
    let baseUrl = new URL(`http://pboml-parser--parseur-pboml.s3.ca-central-1.amazonaws.com/${language === 'fr' ? "index.fr.html" : 'index.html'}`);
    baseUrl.searchParams.set('payload-url', payloadUrl)
    await page.goto(baseUrl.toString(), {
        waitUntil: 'networkidle2',
    });
    const buffer = await page.pdf({
        path: `/tmp/pboml-gen-${language}.pdf`,
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

    await page.close();
    await browser.close();

    return buffer;
};


exports.handler = async (event) => {

    const enBuffer = await makePdf('fr', 'https://pbo-epc-utils.s3.ca-central-1.amazonaws.com/epc-2021-1.0.0.yaml');  //await makePdf("en", process.argv[2]);
    //const frBuffer = //await makePdf("fr", process.argv[2]);

    const response = {
        statusCode: 200,
        body: fs.readFileSync("/tmp/pboml-gen-fr.pdf").toString('base64'),
        headers: { "content-type": "application/pdf" },
        isBase64Encoded: true
    };
    return response;
};
