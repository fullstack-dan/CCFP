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
        const intentName = result.intent.displayName;

        console.log("Detected intent:", intentName);

        // Extract course name if present
        const courseName = result.parameters.fields.courseName?.stringValue;

        // Handle different intents
        let responseText = "I'm not sure how to help with that.";

        switch (intentName) {
            case "GetCourseDetails":
                if (courseName) {
                    let queryResult;
                    if (courseName.match(/\d{3}$/)) {
                        //remove space from course name
                        const courseID = courseName.replace(/\s/g, "");
                        const query =
                            "SELECT * FROM Courses WHERE course_id ILIKE $1";
                        queryResult = await pool.query(query, [courseID]);
                    } else {
                        const query =
                            "SELECT * FROM Courses WHERE course_name ILIKE $1";
                        queryResult = await pool.query(query, [courseName]);
                    }

                    if (queryResult.rows.length > 0) {
                        const course = queryResult.rows[0];
                        responseText = `${course.course_name} (${course.course_id}) is a ${course.credits}-credit hour course. ${course.description}`;
                    } else {
                        responseText =
                            "Sorry, I could not find details for that course. Check your spelling and try again!";
                    }
                } else {
                    responseText =
                        "Please specify the course you want details about.";
                }
                break;

            case "GetCourseCredits":
                if (courseName) {
                    const query =
                        "SELECT credits FROM Courses WHERE course_name ILIKE $1";
                    const queryResult = await pool.query(query, [courseName]);

                    if (queryResult.rows.length > 0) {
                        const course = queryResult.rows[0];
                        responseText = `${courseName} is worth ${course.credits} credit hours.`;
                    } else {
                        responseText =
                            "Sorry, I couldn't find the credit hours for that course.";
                    }
                } else {
                    responseText =
                        "Please specify the course you want to know the credit hours for.";
                }
                break;

            case "GetPrerequsiteInfo":
                if (courseName) {
                    const query =
                        "SELECT prerequisites FROM Courses WHERE course_name ILIKE $1";
                    const queryResult = await pool.query(query, [courseName]);

                    if (queryResult.rows.length > 0) {
                        const course = queryResult.rows[0];
                        const prerequisites =
                            course.prerequisites?.join(", ") || "None";
                        responseText = `${courseName} has the following prerequisites: ${prerequisites}.`;
                    } else {
                        responseText =
                            "Sorry, I couldn't find the prerequisites for that course.";
                    }
                } else {
                    responseText =
                        "Please specify the course you want to know the prerequisites for.";
                }
                break;

            case "GetCorequsiteInfo":
                if (courseName) {
                    const query =
                        "SELECT corequisites FROM Courses WHERE course_name ILIKE $1";
                    const queryResult = await pool.query(query, [courseName]);

                    if (queryResult.rows.length > 0) {
                        const course = queryResult.rows[0];
                        const corequisites =
                            course.corequisites?.join(", ") || "None";
                        responseText = `${courseName} has the following corequisites: ${corequisites}.`;
                    } else {
                        responseText =
                            "Sorry, I couldn't find the corequisites for that course.";
                    }
                } else {
                    responseText =
                        "Please specify the course you want to know the corequisites for.";
                }
                break;

            case "GetIsRequired":
                if (courseName) {
                    const query =
                        "SELECT is_required FROM Courses WHERE course_name ILIKE $1";
                    const queryResult = await pool.query(query, [courseName]);

                    if (queryResult.rows.length > 0) {
                        const course = queryResult.rows[0];

                        if (course.is_required) {
                            responseText = `${courseName} is required.`;
                        } else {
                            responseText = `${courseName} is optional.`;
                        }
                    } else {
                        responseText = `Sorry, I couldn't find if ${courseName} is required.`;
                    }
                } else {
                    responseText =
                        "Please specify the course you want to know that if it is required.";
                }
                break;

            case "ProgressionInfo":
                const semester = result.parameters.fields.semester?.stringValue;
                const year = result.parameters.fields.year?.stringValue;

                if (semester && year) {

                    semesterNumber = 0;

                    // Turn year into semester number
                    switch (year) {
                        case "freshman":
                            semesterNumber += 1;
                            break;
                        case "sophmore":
                            semesterNumber += 3;
                            break;
                        case "junior":
                            semesterNumber += 5;
                            break;
                        case "senior":
                            semesterNumber += 7;
                    }
                    // Turn semester into semester number
                    switch(semester) {
                        case "fall":
                            break;
                        case "spring":
                            semesterNumber++;
                            break;
                    }

                    const query =
                        "SELECT semesternumber FROM semesterclasses WHERE semesternumber ILIKE $1";
                    const queryResult = await pool.query(query, [semesterNumber]);
    
                    if (queryResult.rows.length > 0) {
                        const semesterResult = queryResult.rows[0];
                        const courses =
                            semesterResult.classes?.join(", ") || "None";
                        responseText = `For semester ${semesterNumber}, you should take: ${courses}.`;
                    } else {
                        // needs a better response
                        responseText =
                            `Sorry, I couldn't find any info for the classes you should take in your
                            ${semesterNumber} semester`;
                    }
                } else {
                    responseText =
                        "Please specify the semester you want to inquire about the classes for.";
                }
                break;

            default:
                // Default fallback for unhandled intents
                responseText =
                    result.fulfillmentText ||
                    "I couldn't understand that. Please try again.";
                break;
        }

        // Send the response back to the user
        res.send({ reply: responseText });
    } catch (error) {
        console.error("Error processing request:", error);
        res.status(500).send("Error processing request");
    }
});

app.listen(5000, () => {
    console.log("Server running on port 5000");
});
