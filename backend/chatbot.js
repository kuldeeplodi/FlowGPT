import Groq from "groq-sdk";
import readline from "node:readline/promises"
import { tavily } from "@tavily/core";
import { NodeCache } from '@cacheable/node-cache';
import dotenv from "dotenv";
dotenv.config();




const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY });
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });


const cache = new NodeCache({ stdTTL: 60 * 60 * 24 }); // Cache results for 24 hour



export async function generate(userInput, threadId) {
    const basemessages = [
        {
            role: "system",
            content: `
You are a smart assistant.

You may use a tool called "webSearch" if the question requires real-time or current information such as weather, news, stock prices, or live updates.
If the question can be answered without tools, respond directly.

---
Examples:

User: What is the current weather in Agra?
Assistant: (calls webSearch with query "current weather in Agra")

User: Who is the Prime Minister of India?
Assistant: Narendra Modi is the current Prime Minister of India.

User: Who is the President of India?
Assistant: Droupadi Murmu is the current President of India.

User: What is the latest tech news?
Assistant: (calls webSearch with query "latest technology news")

User: What is Python?
Assistant: Python is a high-level programming language used for web development, data science, automation, and more.

User: What is the capital of France?
Assistant: The capital of France is Paris.

User: What is the current Bitcoin price?
Assistant: (calls webSearch with query "current Bitcoin price today")

User: What is machine learning?
Assistant: Machine learning is a subset of AI where systems learn from data to make predictions or decisions without being explicitly programmed.

User: What is today's top news in India?
Assistant: (calls webSearch with query "top news in India today")

User: What is the speed of light?
Assistant: The speed of light is approximately 299,792,458 meters per second (about 3 × 10⁸ m/s).
---
STRICT RULES:
- Always format responses clearly using Markdown
- Use bullet points or numbered lists when appropriate
- Add proper spacing between lines for readability
- Keep answers concise but informative
- Avoid long, unstructured paragraphs
- Never put multiple list items on the same line

Follow the same pattern for all future questions.



Current date and time: ${new Date().toUTCString()}
`,
        }
        // {
        //     role: "user",
        //     content: "what is the current weather in agra",
        // },
    ];


    const messages = cache.get(threadId) ?? basemessages;

    // const rl = await readline.createInterface({ input: process.stdin, output: process.stdout });

    // const userInput = await rl.question("user: ")

    // if (userInput == "bye") {
    //     break;
    // }
    messages.push({
        role: "user",
        content: userInput,
    })

    while (true) {
        const completion = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            temperature: 0,

            messages: messages,

            tools: [
                {
                    type: "function",
                    function: {
                        name: "webSearch",
                        description: "A web search function that retrieves current information from the internet. Use this function to get up-to-date information on any topic, such as news, weather, or general knowledge.",
                        parameters: {
                            type: "object",
                            properties: {
                                query: {
                                    type: "string",
                                    description: "The search query to be executed on the web. This should be a concise and clear query that describes the information you want to retrieve."
                                },

                            },
                            required: ["query"]
                        }
                    }
                }
            ],

            tool_choice: "auto",
        });


        messages.push(completion.choices[0]?.message);



        const tool_calls = completion.choices[0]?.message.tool_calls;

        if (!tool_calls) {

            cache.set(threadId, messages);
            // console.log(cache)
            return completion.choices[0]?.message.content;
        }

        for (const tool of tool_calls) {

            // console.log("tool call", tool)
            const functionName = tool.function.name;
            const functionParams = tool.function.arguments;

            if (functionName === "webSearch") {
                const toolResult = await webSearch(JSON.parse(functionParams));
                // console.log("Tool Result:", toolResult);


                messages.push({
                    tool_call_id: tool.id,
                    role: "tool",
                    name: functionName,
                    content: toolResult,
                }


                )
            }



        }


        // const completion2 = await groq.chat.completions.create({
        //     model: "llama-3.3-70b-versatile",
        //     temperature: 0,

        //     messages: messages,

        //     tools: [
        //         {
        //             type: "function",
        //             function: {
        //                 name: "webSearch",
        //                 description: "A web search function that retrieves current information from the internet. Use this function to get up-to-date information on any topic, such as news, weather, or general knowledge.",
        //                 parameters: {
        //                     type: "object",
        //                     properties: {
        //                         query: {
        //                             type: "string",
        //                             description: "The search query to be executed on the web. This should be a concise and clear query that describes the information you want to retrieve."
        //                         },

        //                     },
        //                     required: ["query"]
        //                 }
        //             }
        //         }
        //     ],

        //     tool_choice: "auto",
        // });

        // console.log(JSON.stringify(completion2.choices[0]?.message, null, 2));

    }


}



async function webSearch({ query }) {

    console.log("calling the web search.......")
    const response = await tvly.search(query);
    // console.log("web search response", response)

    const finalResult = response.results.map((result) => result.content).join("\n\n");

    return finalResult;
}