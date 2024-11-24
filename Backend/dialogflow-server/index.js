const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { SessionsClient } = require("@google-cloud/dialogflow");
const uuid = require("uuid");
const { Pool } = require("pg");
const env = require("dotenv").config();

const app = express();
app.use(bodyParser.json());
app.use(cors());

const projectId = "ccfp-442213";
const sessionId = uuid.v4();

const sessionClient = new SessionsClient({
    keyFilename: "./secrets/ccfp-442213-4728de656a6d.json",
});

const pool = new Pool({
    user: process.env.POSTGRE_DB_USER,
    host: process.env.POSTGRE_DB_HOST,
    database: "cscoursecatalog",
    password: process.env.POSTGRE_DB_PASSWORD,
    port: 5432,
});

// Webhook route
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
        // Detect intent
        const responses = await sessionClient.detectIntent(request);
        const result = responses[0].queryResult;
        console.log("Detected intent:", result.intent.displayName);

        if (result.intent.displayName === "GetCourseDetails") {
            // Assuming user asked for course details
            console.log("results:", result.parameters.fields.courseName);
            const courseName = result.parameters.fields.courseName.stringValue;
            console.log("Course name:", courseName);

            // Query the database for course details
            const query = "SELECT * FROM Courses WHERE course_name = $1";
            const queryResult = await pool.query(query, [courseName]);
            console.log("Query result:", queryResult.rows);

            if (queryResult.rows.length > 0) {
                const course = queryResult.rows[0];
                const responseText = `Course: ${course.course_name}\nCredits: ${course.credits}\nDescription: ${course.description}`;
                res.send({ reply: responseText });
            } else {
                res.send({
                    reply: "Sorry, I could not find details for that course.",
                });
            }
        } else {
            // Default fallback response
            res.send({ reply: result.fulfillmentText });
        }
    } catch (error) {
        console.error("Error processing request:", error);
        res.status(500).send("Error processing request");
    }
});

app.listen(5000, () => {
    console.log("Server running on port 5000");
});
