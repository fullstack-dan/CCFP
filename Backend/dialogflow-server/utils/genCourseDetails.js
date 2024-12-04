const model = require("../config/genAI");

const difficultyScales = {
    ContentDifficulty: {
        1: "Not hard to understand at all",
        2: "Somewhat easy to understand",
        3: "Requires moderate effort to understand",
        4: "Requires a lot of effort to understand",
    },
    Workload: {
        1: "Not a lot of assignments",
        2: "A manageable number of assignments",
        3: "Several assignments that require consistent work",
        4: "Lots of assignments",
    },
    AssignmentDifficulty: {
        1: "Assignments are easy to complete",
        2: "Assignments are somewhat challenging",
        3: "Assignments require significant effort and time",
        4: "Assignments require lots of time and effort to complete",
    },
};

async function genCourseDetails(userInput, serverResponse) {
    const prompt = `You are an academic advisor at Western Carolina University. You specialize in the computer science degree. You have access to a database that gives you information about the courses offered at the university.
    This is the user's prompt: "${userInput}". This is the server's response: "${serverResponse}". Using only the server's response as a reference, answer the user's prompt. Do not format your text; act as if you were a human responding to the user. Be thorough.
    If the user references MATH270 or MATH370, note that these courses, while required, are interchangeable; they will fulfill the same requirement. If the user references CS495 or CS496, note that these courses are the capstone courses for the computer science degree.
    If a course's availability is defined as 'VARIABLE', note that the course is part of the rotation of computer science elective courses, and may be offered in either the fall or spring semester. If a course's availability is defined as 'SPRING', note that the course is only offered in the spring semester. If a course's availability is defined as 'FALL', note that the course is only offered in the fall semester.
    If a student asks about a course's difficulty or workload, use the following scales to describe the course: 
    ${Object.entries(difficultyScales)}.`;

    try {
        const result = await model.generateContent([prompt]);
        return result.response.text();
    } catch (error) {
        console.error("Error generating response with Gemini:", error);
        return "I'm sorry, but I couldn't process your request at the moment.";
    }
}

module.exports = genCourseDetails;
