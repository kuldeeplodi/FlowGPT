import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { useState } from "react";

export default function MarkdownWithCopy({ content }) {
    const [copied, setCopied] = useState(null);

    const copyCode = async (code, index) => {
        await navigator.clipboard.writeText(code);
        setCopied(index);
        setTimeout(() => setCopied(null), 1500);
    };

    return (
        <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
                code({ inline, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || "");

                    if (!inline) {
                        const codeString = String(children).replace(/\n$/, "");

                        return (
                            <div className="relative">
                                {/* Copy Button */}
                                <button
                                    onClick={() => copyCode(codeString, codeString)}
                                    className="absolute top-2 right-2 text-xs bg-gray-700 text-white px-2 py-1 rounded hover:bg-gray-600"
                                >
                                    {copied === codeString ? "Copied!" : "Copy"}
                                </button>

                                {/* Code Block */}
                                <SyntaxHighlighter
                                    language={match?.[1] || "javascript"}
                                    PreTag="div"
                                >
                                    {codeString}
                                </SyntaxHighlighter>
                            </div>
                        );
                    }

                    return (
                        <code className="bg-gray-800 px-1 py-0.5 rounded">
                            {children}
                        </code>
                    );
                },
            }}
        >
            {content}
        </ReactMarkdown>
    );
}