const express = require("express");
const bodyParser = require("body-parser");
const crypto = require("crypto");

const app = express();

// Your verify token. Should be a random string.
const VERIFY_TOKEN = "mantap";

// Adds support for JSON-encoded bodies
app.use(bodyParser.json({
    verify: verifyRequestSignature,
}));

// Adds support for URL-encoded bodies
app.use(bodyParser.urlencoded({ extended: true }));

// Verify that the callback came from Facebook
function verifyRequestSignature(req, res, buf) {
    const signature = req.headers["x-hub-signature-256"];

    if (!signature) {
        throw new Error("Signature not provided - cannot validate webhook event.");
    } else {
        const elements = signature.split('=');
        const signatureHash = elements[1];
        const expectedHash = crypto.createHmac('sha256', "6668a89fc8cdea01568e64efc49e240c")
            .update(buf)
            .digest('hex');

        if (signatureHash !== expectedHash) {
            throw new Error("Invalid signature.");
        }
    }
}

// Webhook validation
app.get("/webhook", (req, res) => {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    if (mode && token) {
        if (mode === "subscribe" && token === VERIFY_TOKEN) {
            console.log("Webhook Verified.");
            res.status(200).send(challenge);
        } else {
            res.sendStatus(403);
        }
    }
});

// Webhook event handling
app.post("/webhook", (req, res) => {
    const body = req.body;

    if (body.object === "page") {
        body.entry.forEach(entry => {
            // Handle messages or other events here
            console.log('Webhook event received:', entry);
        });

        res.status(200).send('EVENT_RECEIVED');
    } else {
        res.sendStatus(404);
    }
});

// Sets server port and logs message
app.listen(8080, () => console.log('Webhook server is listening, port 8080'));
