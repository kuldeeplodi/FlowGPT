"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import MarkdownWithCopy from "./MarkDownWithCopy";
import { Copy, Check } from "lucide-react";


export default function ChatBox() {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [threadId, setThreadId] = useState("");
    const [copiedIdx, setCopiedIdx] = useState(null);


    useEffect(() => {
        setThreadId("thread-" + Math.random().toString(36).substring(2, 15));
    }, []);

    const sendMessage = async () => {
        if (!input || loading) return;

        const newMessages = [...messages, { role: "user", content: input }];
        setMessages(newMessages);
        setInput("");
        setLoading(true);
        try {
            const res = await axios.post("http://localhost:5000/chat", {
                message: input,
                threadId: threadId

            });

            console.log("Full response:", res.data);

            const reply = res.data.message || "[No reply received]";
            setMessages([
                ...newMessages,
                { role: "assistant", content: reply },
            ]);
        } catch (err) {
            setMessages([
                ...newMessages,
                { role: "assistant", content: "[Error: Could not get reply]" },
            ]);
        } finally {
            setLoading(false);
        }
    };

    return (
        // <div className="w-full h-full  shadow-xl  flex flex-col ">


        <div className="w-full flex flex-col items-center h-full">
            {/* Messages */}
            <div
                className="flex-1 flex flex-col overflow-y-auto p-6 space-y-3 scrollbar-hide max-w-[55%] w-full mx-auto relative group"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
                {messages.map((msg, i) => (
                    <div
                        key={i}
                        className={`py-2 px-4 rounded-xl  ${msg.role === "user"
                            ? "bg-black text-[#f4f3ee] self-end ml-auto"
                            : "text-[#f4f3ee] self-start "
                            }`}
                    >
                        <MarkdownWithCopy content={msg.content} />
                        {msg.role === "assistant" && (
                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(msg.content);
                                    setCopiedIdx(i);
                                    setTimeout(() => setCopiedIdx(null), 1000);
                                }}
                                className="mt-2 text-xs text-white px-2 py-1 rounded shadow hover:opacity-100 opacity-80"
                            >
                                {copiedIdx === i ? <Check size={16} /> : <Copy size={16} />}

                            </button>
                        )}
                    </div>

                ))}
                {loading && (
                    <div className="text-gray-400 italic self-start animate-pulse">Assistant is typing...</div>
                )}


            </div>

            {/* Input */}
            <div className="w-full">
                <div className="p-3  rounded-xl flex gap-2 w-full max-w-[55%] items-center justify-center bg-[#232323] mx-auto mb-4">
                    <input
                        className="flex-1 p-4 pr-5 rounded text-white outline-0"
                        placeholder="How can I help you today?"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                sendMessage();
                            }
                        }}
                        disabled={loading}
                    />
                    <button
                        onClick={sendMessage}
                        className="bg-white text-black text-lg font-bold px-4 py-2 rounded-full"
                        disabled={loading}
                    >
                        {loading ? <span className="animate-pulse">...</span> : "Ask"}
                    </button>
                </div>
            </div>
        </div>
        // </div>
    );
}