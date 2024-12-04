const { SessionsClient } = require("@google-cloud/dialogflow");
const uuid = require("uuid");

const projectId = "ccfp-442213";
const sessionId = uuid.v4();

const sessionClient = new SessionsClient({
    keyFilename: "./ccfp-442213-4728de656a6d.json",
});

module.exports = { projectId, sessionId, sessionClient };
