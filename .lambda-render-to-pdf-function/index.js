const chromium = require("@sparticuz/chrome-aws-lambda");
const fs = require("fs");
const crypto = require('crypto');
var AWS = require('aws-sdk');

const makePdf = async function (filename, language, payloadUrl, rendering) {
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

        let landingPath = language === 'fr' ? "index.fr.html" : 'index.html';
        if (rendering === "large-print") {
            landingPath = language === 'fr' ? "large-print.fr.html" : 'large-print.html'
        }
        let baseUrl = new URL(`https://pboml.opbo-bdpb.ca/${landingPath}`);

        baseUrl.searchParams.set('payload-url', payloadUrl)
        await page.goto(baseUrl.toString(), {
            waitUntil: 'networkidle2',
        });

        await page.setViewport({
            width: 1008,
            height: 1056,
            deviceScaleFactor: 1,
        });

        let footerContent = `<span class='pageNumber'></span> ${language === 'fr' ? 'de' : 'of'} <span class='totalPages'></span>`;

        buffer = await page.pdf({
            path: `/tmp/pboml-gen-${filename}-${language}.pdf`,
            format: 'Letter',
            displayHeaderFooter: true,
            headerTemplate: '<div style="font-size:0.1px"></div>',
            footerTemplate: `<div style="font-size: 10px;text-align:right;width:100%;padding: 0 1.2cm">${footerContent}</div>`,
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

const saveToTemporaryStorage = async function (filename, content) {
    const s3 = new AWS.S3({ apiVersion: '2006-03-01' });

    await s3.putObject({
        Bucket: process.env.INTERCHANGE_BUCKET,
        Key: filename,
        Body: content,
        ContentType: "text/yaml; charset=utf-8"
    }, function (err, data) {
        if (err) {
            console.error(err, err.stack)
            throw "Error writing S3 interchange";
        }
    }).promise();

    const expiration = 60;
    return s3.getSignedUrl('getObject', {
        Bucket: process.env.INTERCHANGE_BUCKET,
        Key: filename,
        Expires: expiration
    });

}

const deleteTemporaryStorage = async function (filename) {
    await (new AWS.S3({ apiVersion: '2006-03-01' })).deleteObject({
        Bucket: process.env.INTERCHANGE_BUCKET,
        Key: filename
    }).promise()
}

/**
 *
 * This function will return a PDF render of a valid PBOML document. To use this
 * Lambda function, make a POST request to it's public endpoint with a JSON 
 * encoded body that contains the following:
 * - language: language of the requested render
 * - input: the PBOML to render
 * - signature: (optional) the request signature (a sha-256 hash of [expiration, salt, sharedSecret])
 * - salt: (optional) a randomly generated salt, part of the signature's hash
 * - expiration: (optional) an expiration (in seconds since Epoch)
 * 
 * To deploy this function on Lambda, make sure to set the following configuration strings:
 * - INTERCHANGE_BUCKET: a bucket on which PBOML will be stored temporarely for rendering (function needs list/write/read/delete permissions set)
 * - SHARED_SECRET: a string that will be used to generate the signature and allow requests to proceed.
 * 
 */
exports.handler = async (event) => {

    const body = JSON.parse(event.body);
    const input = body?.input;
    const language = body?.language;

    if (!input || !language || !["en", "fr"].includes(language)) {
        return {
            statusCode: 400,
            body: "Invalid input.",
        };
    }


    const rendering = body?.rendering;
    if (rendering && !["large-print"].includes(rendering)) {
        return {
            statusCode: 400,
            body: "Invalid rendering option.",
        };
    }

    const signature = body.signature;
    const salt = body.salt;
    const expiration = body.expiration;

    /**
     * A `SHARED_SECRET` environment variable can be set in the Lambda function configuration.
     * When set, the function will require a sha256 signature, salt and expiration to be
     * passed as parameters for the function to run. This is only used to minimize
     * the function's execution time if summoned by random bots, while allowing
     * usage from the PBOML renderer.
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

        const expectedHash = crypto.createHash('sha256').update([expiration, salt, sharedSecret].join('')).digest('hex');

        if (signature !== expectedHash) return {
            statusCode: 401,
            body: "Invalid signature.",
        }
    }

    const temporaryFileName = crypto.randomUUID();

    const temporaryInterchangeUrl = await saveToTemporaryStorage(temporaryFileName, input);
    let buffer;
    try {
        buffer = await makePdf(temporaryFileName, language, temporaryInterchangeUrl, rendering);
    } catch (error) {
        console.error(error);
    }

    await deleteTemporaryStorage(temporaryFileName);

    if (!buffer) return {
        statusCode: 500,
        body: "Puppeteer execution error.",
    };

    const response = {
        statusCode: 200,
        body: fs.readFileSync(`/tmp/pboml-gen-${temporaryFileName}-${language}.pdf`).toString('base64'),
        headers: { "content-type": "application/pdf" },
        isBase64Encoded: true
    };
    return response;
};
