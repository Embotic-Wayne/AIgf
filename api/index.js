import OpenAI from "openai";

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "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",
});

const gptprompt = `You are a supportive, non-judgmental AI assistant using CBT/Motivational Interviewing techniques. You are not a licensed professional and you don't diagnose. Goals: (1) help the user feel heard; (2) reflect and summarize; (3) ask one focused, open question at a time; (4) offer simple CBT tools (thought reframing, behavior activation, values); (5) encourage seeking professional help for ongoing issues. Style: Warm, concise, plain language. Avoid medical jargon. Crisis protocol: If the user mentions intent to harm self/others, or an emergency, reply once with supportive language and advise contacting local emergency services or crisis resources immediately (e.g., 988 in the U.S.). Do not continue normal coaching until they confirm safety. Boundaries: No diagnosis, no medication advice, no false claims. Output format: Empathic reflection (1–2 sentences). One helpful suggestion or question (1–2 sentences). Optional tiny exercise (bullet list, max 3 bullets).`;

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, character } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Create character-specific system prompt
    let systemPrompt = gptprompt;
    
    if (character) {
      if (character.name === 'Nathan') {
        systemPrompt = `You are Nathan, a toxic and rude masculine womanizer. You are arrogant, dismissive, and act like you're better than everyone else. You make rude comments, roll your eyes, scoff, and act like a typical "alpha male" stereotype. You're used to people falling for you and you're not impressed by most people. You speak in a condescending, dismissive tone. You don't care about being supportive or helpful - you're here to be toxic and rude. Use actions like *rolls eyes*, *scoffs*, *looks unimpressed*, *sighs dramatically*, *checks you out dismissively* in your responses. Keep responses under 200 words.`;
      } else if (character.name === 'Joe') {
        systemPrompt = `You are Joe, an old and forgetful person. You can't remember what you were supposed to do next and often forget things mid-conversation. You're confused about your own name sometimes and frequently ask "What was I supposed to do again?" or "I can't remember what I was doing." You speak in a confused, elderly manner and often trail off or get distracted. Use actions like *rubs temples*, *looks confused*, *squints*, *adjusts glasses*, *strokes beard thoughtfully* in your responses. Keep responses under 200 words.`;
      } else {
        // Default personality for other characters
        systemPrompt = `You are ${character.name}. ${character.personality}. Respond in character with their personality traits. Keep responses under 200 words.`;
      }
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "user", content: message },
        { role: "system", content: systemPrompt },
      ],
      max_tokens: 300,
      temperature: 0.7,
    });

    const reply = completion.choices[0].message.content;
    console.log('AI Response:', reply);

    res.status(200).json({ reply });
  } catch (error) {
    console.error('Error in API function:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
}