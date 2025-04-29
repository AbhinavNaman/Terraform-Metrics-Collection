//external imports 
import fetch from "node-fetch";
import https from "https";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";


// Load the certificate
// Resolve current file directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Absolute path to the PEM file
const certPath = path.join(__dirname, "zscaler-bundle.pem");
console.log("Reading cert from:", certPath);
const cert = fs.readFileSync(certPath);

const SLACK_WEBHOOK_URL = "https://hooks.slack.com/services/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"

const agent = new https.Agent({
  ca: cert // Use the custom certificate
});

export const sendSlackNotification = (error_messages: string[]) => {
    fetch(SLACK_WEBHOOK_URL, {
        method: "POST",
        body: JSON.stringify({
            text: error_messages.toString(),
        }),
        headers: {
            "Content-Type": "application/json"
        },
        agent: agent // Use the custom certificate
    })
    .then(async (response) => {
        // console.log(response);
        const text = await response.text(); // Get raw response text
        console.log("Slack Response:", text); // Log the actual response
    })
    .catch(error => {
        console.error("Fetch error:", error);
    });
};

