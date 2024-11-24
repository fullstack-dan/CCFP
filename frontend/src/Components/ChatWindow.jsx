import SendIcon from "@mui/icons-material/Send";
import { useEffect, useState } from "react";

function UserMessage({ message }) {
    return (
        <div className="chat chat-end">
            <div
                className="chat-bubble"
                style={{
                    maxWidth: "70%",
                }}
            >
                {message}
            </div>
        </div>
    );
}

function ReplyMessage({ message }) {
    return (
        <div className="chat chat-start">
            <div
                className="chat-bubble"
                style={{
                    maxWidth: "70%",
                }}
            >
                {message}
            </div>
        </div>
    );
}

export default function ChatWindow() {
    //array of message objects with info about the sender and the message
    const [messages, setMessages] = useState([
        {
            message:
                "Hello there! I  am the Feline Learning Interface for Computer Science, or FeLICS for short. I can answer questions you might have about Western Carolina University's Computer Science program. How can I help you today?",
            type: "reply",
        },
    ]);

    const sendMessage = async () => {
        const message = document.querySelector("#user-input").value;
        const messageObject = {
            message,
            type: "user",
        };

        // Add user's message immediately
        setMessages((prevMessages) => [...prevMessages, messageObject]);

        let replyObject;

        try {
            const res = await fetch("http://localhost:5000/api/dialogflow", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text: message }),
            });
            const data = await res.json();
            replyObject = {
                message: data.reply,
                type: "reply",
            };
        } catch (error) {
            console.error("Error:", error);
            replyObject = {
                message:
                    "I'm sorry, I'm having trouble understanding you right now. Please try again later.",
                type: "reply",
            };
        }

        // Add the bot's reply when it arrives
        setMessages((prevMessages) => [...prevMessages, replyObject]);

        document.querySelector("#user-input").value = "";
    };

    useEffect(() => {
        const chatWindow = document.querySelector("#chat-window");
        chatWindow.scrollTop = chatWindow.scrollHeight;
    }, [messages]);

    const handleKeyPress = (event) => {
        if (event.key === "Enter") {
            sendMessage();
        }
    };

    return (
        <>
            <div className="h-5/6 flex flex-col w-3/6">
                <div
                    className="flex flex-col mt-auto overflow-x-scroll"
                    id="chat-window"
                >
                    {messages.map((messageObject, index) => {
                        if (messageObject.type === "user") {
                            return (
                                <UserMessage
                                    key={index}
                                    message={messageObject.message}
                                />
                            );
                        } else {
                            return (
                                <ReplyMessage
                                    key={index}
                                    message={messageObject.message}
                                />
                            );
                        }
                    })}
                </div>
                <div className="flex w-full gap-4 mt-8">
                    <input
                        id="user-input"
                        type="text"
                        placeholder="Type here"
                        className="input input-bordered w-full max-w-full"
                        onKeyPress={handleKeyPress}
                    />
                    <button className="btn btn-ghost" onClick={sendMessage}>
                        <SendIcon />
                    </button>
                </div>
            </div>
        </>
    );
}
