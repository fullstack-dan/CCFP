const express = require("express");
const { projectId, sessionId, sessionClient } = require("../config/dialogflow");
const pool = require("../config/db");
const genCourseDetails = require("../utils/genCourseDetails");

const router = express.Router();

router.post("/", async (req, res) => {
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

    const userText = text;

    try {
        const responses = await sessionClient.detectIntent(request);
        const result = responses[0].queryResult;
        const intentName = result.intent.displayName;

        console.log("Detected intent:", intentName);

        const courseName = result.parameters.fields.courseName?.stringValue;

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
                        const databaseResponse = `Course name: ${course.course_name}; Course ID: ${course.course_id}; Credits: ${course.credits}; Description: ${course.description}; Typical Availability: ${course.availability}; Is Required: ${course.is_required};`;

                        responseText = await genCourseDetails(
                            userText,
                            `${databaseResponse}`
                        );
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
                            "Sorry, I couldn't find the credit hours for that course. Check your spelling and try again!";
                    }
                } else {
                    responseText =
                        "Please specify the course you want to know the credit hours for.";
                }
                break;

            case "GetPrerequsiteInfo":
                if (courseName) {
                    let queryResult;

                    if (courseName.match(/\d{3}$/)) {
                        //remove space from course name
                        const courseID = courseName.replace(/\s/g, "");
                        const query = `
                            SELECT c.course_name 
                            FROM Courses AS c
                            WHERE c.course_id = ANY (
                                SELECT UNNEST(prerequisites) 
                                FROM Courses 
                                WHERE course_id ILIKE $1
                            );
                        `;
                        queryResult = await pool.query(query, [courseID]);
                    } else {
                        const query = `
                            SELECT c.course_name 
                            FROM Courses AS c
                            WHERE c.course_id = ANY (
                                SELECT UNNEST(prerequisites) 
                                FROM Courses 
                                WHERE course_name ILIKE $1
                            );
                    `;
                        queryResult = await pool.query(query, [courseName]);
                    }

                    if (queryResult.rows.length > 0) {
                        const course = queryResult.rows;
                        const databaseResponse = course
                            .map((c) => c.course_name)
                            .join(", ");

                        responseText = await genCourseDetails(
                            userText,
                            `${courseName} has the following prerequisites: ${databaseResponse}.`
                        );
                    } else {
                        responseText =
                            "Sorry, I couldn't find the prerequisites for that course.";
                    }
                } else {
                    responseText =
                        "Please specify the course you want to know the prerequisites for.";
                }
                break;

            case "GetCorequsitesInfo":
                if (courseName) {
                    let queryResult;

                    if (courseName.match(/\d{3}$/)) {
                        const courseID = courseName.replace(/\s/g, "");
                        const query = `
                            SELECT c.course_name 
                            FROM Courses AS c
                            WHERE c.course_id = ANY (
                                SELECT UNNEST(corequisites) 
                                FROM Courses 
                                WHERE course_id ILIKE $1
                            );
                        `;
                        queryResult = await pool.query(query, [courseID]);
                    } else {
                        const query = `
                            SELECT c.course_name 
                            FROM Courses AS cs
                            WHERE c.course_id = ANY (
                                SELECT UNNEST(corequisites) 
                                FROM Courses 
                                WHERE course_name ILIKE $1
                            );
                        `;
                        queryResult = await pool.query(query, [courseName]);
                    }

                    console.log(queryResult);
                    if (queryResult.rows.length > 0) {
                        const course = queryResult.rows;
                        const databaseResponse = course
                            .map((c) => c.course_name)
                            .join(", ");

                        responseText = await genCourseDetails(
                            userText,
                            `${courseName} has the following corequisites: ${databaseResponse}.`
                        );
                    }

                    responseText = `Sorry, I couldn't find the corequisites for that course.`;
                } else {
                    responseText =
                        "Please specify the course you want to know the corequisites for.";
                }
                break;

            case "GetIsRequired":
                if (courseName) {
                    let queryResult;

                    if (courseName.match(/\d{3}$/)) {
                        const courseID = courseName.replace(/\s/g, "");
                        const query = `
                            SELECT is_required
                            FROM Courses
                            WHERE course_id ILIKE $1;
                        `;
                        queryResult = await pool.query(query, [courseID]);
                    } else {
                        const query = `
                            SELECT is_required
                            FROM Courses
                            WHERE course_name ILIKE $1;
                        `;
                        queryResult = await pool.query(query, [courseName]);
                    }

                    if (queryResult.rows.length > 0) {
                        const course = queryResult.rows[0];

                        if (course.is_required) {
                            responseText = `${courseName} is required.`;
                        } else {
                            responseText = `${courseName} is an elective.`;
                        }
                    } else {
                        responseText = `Sorry, I couldn't find if ${courseName} is required.`;
                    }
                } else {
                    responseText =
                        "Please specify the course you want to know that if it is required.";
                }
                break;

            case "GetCourseAvailability":
                if (courseName) {
                    let queryResult;

                    if (courseName.match(/\d{3}$/)) {
                        const courseID = courseName.replace(/\s/g, "");
                        const query = `
                            SELECT availability
                            FROM Courses
                            WHERE course_id ILIKE $1;
                        `;
                        queryResult = await pool.query(query, [courseID]);
                    } else {
                        const query = `
                            SELECT availability
                            FROM Courses
                            WHERE course_name ILIKE $1;
                        `;
                        queryResult = await pool.query(query, [courseName]);
                    }

                    if (queryResult.rows.length > 0) {
                        const course = queryResult.rows[0];
                        databaseResponse = course.availability;
                        responseText = await genCourseDetails(
                            userText,
                            `${courseName} is typically available in ${databaseResponse}.`
                        );
                    } else {
                        responseText = `Sorry, I couldn't find the typical availability for ${courseName}.`;
                    }
                } else {
                    responseText =
                        "Please specify the course you want to know the typical availability for.";
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
                    switch (semester) {
                        case "fall":
                            break;
                        case "spring":
                            semesterNumber++;
                            break;
                    }

                    const query =
                        "SELECT semesternumber FROM semesterclasses WHERE semesternumber ILIKE $1";
                    const queryResult = await pool.query(query, [
                        semesterNumber,
                    ]);

                    if (queryResult.rows.length > 0) {
                        const semesterResult = queryResult.rows[0];
                        const courses =
                            semesterResult.classes?.join(", ") || "None";
                        responseText = `For semester ${semesterNumber}, you should take: ${courses}.`;
                    } else {
                        // needs a better response
                        responseText = `Sorry, I couldn't find any info for the classes you should take in your
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

        res.send({ reply: responseText });
    } catch (error) {
        console.error("Error processing request:", error);
        res.status(500).send("Error processing request");
    }
});

module.exports = router;
