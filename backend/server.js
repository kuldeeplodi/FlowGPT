import express from "express";
import cors from "cors";



import { generate } from "./chatbot.js";

const app = express();

app.use(cors());
app.use(express.json());

app.post("/chat", async (req, res) => {
    const { message, threadId } = req.body;
    console.log("Received message:", message);

    try {
        // Replace this with your LLM call
        const result = await generate(message, threadId);
        console.log("LLM Result:", result);

        res.json({ "message": result });
    } catch (err) {
        console.error("SERVER ERROR:", err); // 🔥 MUST HAVE
        res.status(500).json({ error: "LLM failed" });
    }
});



app.listen(5000, () => {
    console.log("Server running on port 5000");
});