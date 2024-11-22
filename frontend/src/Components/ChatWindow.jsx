import SendIcon from "@mui/icons-material/Send";

export default function ChatWindow() {
    return (
        <>
            <div className="h-5/6 flex flex-col-reverse rounded-lg w-3/6 items-center">
                <div className="flex w-full gap-4">
                    <input
                        type="text"
                        placeholder="Type here"
                        className="input input-bordered w-full max-w-full"
                    />
                    <button className="btn btn-ghost">
                        <SendIcon />
                    </button>
                </div>
            </div>
        </>
    );
}
