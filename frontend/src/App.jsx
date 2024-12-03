import "./App.css";
import ChatWindow from "./Components/ChatWindow";

export default function App() {
    return (
        <>
            <main className="flex flex-col items-center m-0 p-0 h-full justify-between pb-4 w-dvw">
                <h1 className="text-3xl font-bold my-4 text-center">CatGPT</h1>
                <ChatWindow />
            </main>
        </>
    );
}
