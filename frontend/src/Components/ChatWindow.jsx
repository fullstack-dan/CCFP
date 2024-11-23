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
    //array of message objects with info about the sender
    const [messages, setMessages] = useState([
        {
            message: "Hello! Who are you?",
            type: "user",
        },
        {
            message:
                "Hi! I'm the Feline Learning Interface for Computer Science (FeLICS)",
            type: "reply",
        },
    ]);

    const sendMessage = () => {
        const message = document.querySelector("#user-input").value;
        const messageObject = {
            message,
            type: "user",
        };
        const replyObject = {
            message:
                "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
            type: "reply",
        };
        setMessages([...messages, messageObject, replyObject]);
        document.querySelector("#user-input").value = "";
    };

    useEffect(() => {
        const chatWindow = document.querySelector("#chat-window");
        chatWindow.scrollTop = chatWindow.scrollHeight;
    }, [messages]);

    return (
        <>
            <div className="h-5/6 flex flex-col rounded-lg w-3/6">
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
                    />
                    <button className="btn btn-ghost" onClick={sendMessage}>
                        <SendIcon />
                    </button>
                </div>
            </div>
        </>
    );
}
