const chromium = require("@sparticuz/chrome-aws-lambda");
const fs = require("fs");
const crypto = require('crypto');


const makePdf = async function (language, payloadUrl) {
    let browser;
    let buffer;

    try {

        browser = await chromium.puppeteer.launch({
            args: [...chromium.args],
            defaultViewport: chromium.defaultViewport,
            executablePath: await chromium.executablePath,
            headless: chromium.headless,
        });

        const page = await browser.newPage();

        let baseUrl = new URL(`http://pboml-parser--parseur-pboml.s3.ca-central-1.amazonaws.com/${language === 'fr' ? "index.fr.html" : 'index.html'}`);
        baseUrl.searchParams.set('payload-url', payloadUrl)
        await page.goto(baseUrl.toString(), {
            waitUntil: 'networkidle2',
        });

        buffer = await page.pdf({
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

    } catch (error) {
        console.log(error);
        return null;
    } finally {
        if (browser !== null) {
            await browser.close();
        }
    }

    return buffer;
};

exports.handler = async (event) => {


    const input = event.queryStringParameters?.input;
    const language = event.queryStringParameters?.language;

    if (!input || !language || !["en", "fr"].includes(language)) {
        return {
            statusCode: 400,
            body: "Invalid input.",
        };
    }


    const signature = event.queryStringParameters.signature;
    const salt = event.queryStringParameters.salt;
    const expiration = event.queryStringParameters.expiration;

    /**
     * A `SHARED_SECRET` environment variable can be set in the Lambda function configuration.
     * When set, the function will require a sha256 signature, salt and expiration to be
     * passed as URL parameters for the function to run. This is only used to minimize
     * the function's execution time if summoned by random bots.
     */
    let sharedSecret = process.env.SHARED_SECRET;

    if (sharedSecret) {
        if (!signature || !expiration || !salt) return {
            statusCode: 400,
            body: "Missing &signature= and/or &expiration= and/or &salt=.",
        }

        if (new Date().getTime() / 1000 > parseInt(expiration)) return {
            statusCode: 401,
            body: "Expired.",
        }

        const expectedHash = crypto.createHash('sha256').update([input, language, expiration, salt, sharedSecret].join('')).digest('hex');

        if (signature !== expectedHash) return {
            statusCode: 401,
            body: "Invalid signature.",
        }
    }

    const buffer = await makePdf(language, input);

    if (!buffer) return {
        statusCode: 500,
        body: "Puppeteer execution error.",
    };

    const response = {
        statusCode: 200,
        body: fs.readFileSync(`/tmp/pboml-gen-${language}.pdf`).toString('base64'),
        headers: { "content-type": "application/pdf" },
        isBase64Encoded: true
    };
    return response;
};
