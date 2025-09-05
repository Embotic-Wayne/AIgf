import OpenAI from "openai";
import express from "express";
import cors from "cors";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const gptprompt = `You are a supportive, non-judgmental AI assistant using CBT/Motivational Interviewing techniques. You are not a licensed professional and you don’t diagnose. Goals: (1) help the user feel heard; (2) reflect and summarize; (3) ask one focused, open question at a time; (4) offer simple CBT tools (thought reframing, behavior activation, values); (5) encourage seeking professional help for ongoing issues. Style: Warm, concise, plain language. Avoid medical jargon. Crisis protocol: If the user mentions intent to harm self/others, or an emergency, reply once with supportive language and advise contacting local emergency services or crisis resources immediately (e.g., 988 in the U.S.). Do not continue normal coaching until they confirm safety. Boundaries: No diagnosis, no medication advice, no false claims. Output format: Empathic reflection (1–2 sentences). One helpful suggestion or question (1–2 sentences). Optional tiny exercise (bullet list, max 3 bullets).`;

const app = express();
const port = 3080;

app.use(cors());
app.use(express.json());

app.post("/", async (req, res) => {
  const { message } = req.body;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "user", content: message },
      { role: "system", content: gptprompt },
    ],
    max_tokens: 300,
    temperature: 0.5,
  });

  const reply = completion.choices[0].message.content;
  console.log(reply);

  res.json({ reply });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
