const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { SessionsClient } = require("@google-cloud/dialogflow");
const uuid = require("uuid");

const app = express();
app.use(bodyParser.json());
app.use(cors());

const projectId = "ccfp-442213";
const sessionId = uuid.v4();

const sessionClient = new SessionsClient({
    keyFilename: "./secrets/ccfp-442213-4728de656a6d.json",
});

app.post("/api/dialogflow", async (req, res) => {
    const { text } = req.body;

    const sessionPath = sessionClient.projectAgentSessionPath(
        projectId,
        sessionId
    );

    const request = {
        session: sessionPath,
        queryInput: {
            text: {
                text: text,
                languageCode: "en",
            },
        },
    };

    try {
        const responses = await sessionClient.detectIntent(request);
        const result = responses[0].queryResult;
        res.send({ reply: result.fulfillmentText });
    } catch (error) {
        console.error("Dialogflow request error:", error);
        res.status(500).send("Error processing request");
    }
});

app.listen(5000, () => {
    console.log("Server running on port 5000");
});
