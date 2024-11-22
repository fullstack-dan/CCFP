import "./App.css";
import ChatWindow from "./Components/ChatWindow";

export default function App() {
    return (
        <>
            <main className="flex flex-col items-center h-screen m-0 p-0">
                <h1 className="text-3xl font-bold my-8">Welcome to FeLICS!</h1>
                <ChatWindow />
            </main>
        </>
    );
}
