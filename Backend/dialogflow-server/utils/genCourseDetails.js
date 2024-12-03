const model = require("../config/genAI");

const courses = {
    CS150: "Problem Solving and Programming I",
    CS151: "Problem Solving and Programming II",
    CS253: "Software Development",
    CS260: "Computer Organization",
    CS351: "Data Structures and Algorithms",
    CS352: "Organization of Programming Languages",
    CS353: "Professional Ethics in Computing",
    CS364: "Software Engineering",
    CS370: "Operating Systems",
    CS453: "Database Systems",
    CS462: "Linux Tools",
    CS465: "Computer Networking",
    CS466: "Information Security I",
    CS467: "Mobile Application Development",
    CS475: "Cloud Computing",
    CS495: "Capstone I",
    CS496: "Capstone II",
    MATH153: "Calculus I",
    MATH255: "Calculus II",
    MATH250: "Introduction to Logic and Proof",
    MATH310: "Discrete Structures",
    MATH270: "Statistical Methods I",
    MATH370: "Probability and Statistics I",
};

async function genCourseDetails(userInput, serverResponse) {
    const prompt = `You are an academic advisor at Western Carolina University. You specialize in the computer science degree. You have access to a database that gives you information about the courses offered at the university.
    This is the user's prompt: "${userInput}". This is the server's response: "${serverResponse}". Using only the server's response as a reference, answer the user's prompt. Do not format your text; act as if you were a human responding to the user. Be thorough.
    If the user references MATH270 or MATH370, note that these courses, while required, are interchangeable; they will fulfill the same requirement. If the user references CS495 or CS496, note that these courses are the capstone courses for the computer science degree.
    If a course's availability is defined as 'VARIABLE', note that the course is part of the rotation of computer science elective courses, and may be offered in either the fall or spring semester. If a course's availability is defined as 'SPRING', note that the course is only offered in the spring semester. If a course's availability is defined as 'FALL', note that the course is only offered in the fall semester.`;

    try {
        const result = await model.generateContent([prompt]);
        return result.response.text();
    } catch (error) {
        console.error("Error generating response with Gemini:", error);
        return "I'm sorry, but I couldn't process your request at the moment.";
    }
}

module.exports = genCourseDetails;
