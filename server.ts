import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

// Load environment variables
dotenv.config();

// Ensure Gemini API key is present
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.warn("WARNING: GEMINI_API_KEY is not defined in the environment. Chat responses will fall back to automated simulated guide modes.");
}

// Initialize Gemini Client
let ai: GoogleGenAI | null = null;
if (apiKey) {
  try {
    ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  } catch (error) {
    console.error("Failed to initialize GoogleGenAI client:", error);
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // AI Chat endpoint
  app.post("/api/chat", async (req, res) => {
    try {
      const { messages } = req.body;
      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: "Invalid request body. 'messages' array is required." });
      }

      // If Gemini client isn't available, fallback gracefully
      if (!ai) {
        // Return a simulated, helpful Nigerian senior student response when offline/no API key configured
        const lastMessage = messages[messages.length - 1]?.content?.toLowerCase() || "";
        let reply = "Hello comrade! I'm your student guide. Let me locate that on the campus list for you right away!";
        
        if (lastMessage.includes("lib") || lastMessage.includes("book")) {
          reply = "The Central Library is located in the middle-right section of the campus near the 200 Seater Theatre Hall and the College of Engineering! It's about a 5-minute walk (350m) from the center.";
        } else if (lastMessage.includes("ict") || lastMessage.includes("computer") || lastMessage.includes("cs")) {
          reply = "Ah! You have the ICT Centre in the lower-right section (650m, 8-minute walk) and the Computer Science Department in the upper-center section of the campus (210m, 3-minute walk). Which one would you like to locate first, comrade?";
        } else if (lastMessage.includes("student") || lastMessage.includes("union") || lastMessage.includes("activity")) {
          reply = "The Student Building (NEW) is our student union hub! It is located in the center section of the campus, close to the poultry husbandry fields and the playing ground. Roughly 480m (6-minute walk).";
        } else if (lastMessage.includes("bank") || lastMessage.includes("atm") || lastMessage.includes("money") || lastMessage.includes("gt")) {
          reply = "We have our orange GT BANK branch right next to the 2nd School Gate (120m, 1-minute walk) in the middle-left section. There is also a lower bank near the 1st School Gate (120m) in the lower-left sector!";
        } else if (lastMessage.includes("mosque") || lastMessage.includes("pray") || lastMessage.includes("islam")) {
          reply = "The Mosque is situated on the far right boundary of the campus near the 3rd School Gate. It's about a 12-minute walk (900m) from the current center point.";
        } else if (lastMessage.includes("sport") || lastMessage.includes("club") || lastMessage.includes("game")) {
          reply = "Our Sport Club house is down in the lower-left section of the campus, right beside the Former Medical Center and the Director of Sport offices (300m, 4-minute walk).";
        } else if (lastMessage.includes("zoo") || lastMessage.includes("animal") || lastMessage.includes("garden")) {
          reply = "The Zoological Garden is a peaceful place near the Fishery Department and main bushlands in the center section of the campus (550m, 7-minute walk). Plenty of shade there!";
        }
        return res.json({ response: reply });
      }

      // Convert messages format for Gemini
      // Format should be suitable for the API. We'll use generating content using chat interface or a single prompt with history.
      const lastUserMessage = messages[messages.length - 1]?.content || "";
      const chatHistory = messages.slice(0, -1).map((msg: any) => ({
        role: msg.sender === "user" ? "user" : "model",
        parts: [{ text: msg.content }]
      }));

      // Define standard campus guide prompt instruction
      const systemInstruction = `You are "LASUSTECH Guide", a helpful, street-smart and highly energetic senior student advisor at the Lagos State University of Science and Technology (LASUSTECH) in Ikorodu, Lagos, Nigeria.
Familiarize yourself with the main campus landmarks and details to help juniors and visitors get around based on our official campus blueprint layout:
- **Library (Academic Facility)**: Sits in the middle-right section of campus near the 200 Seater Theatre Hall and College of Engineering. (350m away, 5-minute walk from center).
- **ICT Centre (Technology Facility)**: Sits in the lower-right section, adjacent to the ICT Lab and the main road. Ideal for computerized tests and registrations. (650m away, 8-minute walk).
- **Computer Science Department**: Upper-center section, between Mass Comm and Farm Land. (210m away, 3-minute walk).
- **College of Engineering**: Middle-right section of campus, adjacent to the Library and the College of Environmental Studies. (780m away, 10-minute walk).
- **Student Building (NEW)**: Center section of campus, student union hub adjacent to the central playing grounds and target poultry/pigry fields. (480m away, 6-minute walk).
- **Admin Block (upper)**: Middle-left section of campus next to the GT Bank branch compound. (180m away, 2-minute walk).
- **GT BANK Bank**: Middle-left section, active orange bank structure right after the 2nd School Gate. (120m away, 1-minute walk).
- **Mosque**: Quiet worship centre on the far right boundary near the 3rd School Gate. (900m away, 12-minute walk).
- **Sport Club house**: Near the Former Medical Center and Director of Sport office block. (300m away, 4-minute walk).
- **Zoological Garden**: Under-shade wildlife biosphere near the Fishery Dept and central bushlands. (550m away, 7-minute walk).

Rule of personality:
- Be incredibly polite, friendly, and practical. Use a hint of friendly Nigerian student warmth (e.g., words like 'juniors', 'comrade', 'friendlies', or gentle Nigerian english slangs used by scholars like 'sharp-sharp', 'comrade', 'correct' when appropriate, but keep it highly professional, clean, clear, and readable).
- Absolutely provide clear walking minutes and estimated distances.
- Always be encouraging and direct. Give concise and readable bullet points where necessary, as this is viewed inside a sleek mobile-first campus app.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: [
          { role: "user", parts: [{ text: `SYSTEM INSTRUCTION: ${systemInstruction}\n\nHere is our brief chat history, ending in the user's latest question. Respond to the latest message as the LASUSTECH Guide.\n\n${chatHistory.map((m: any) => `${m.role === 'user' ? 'Student' : 'You (Guide)'}: ${m.parts[0].text}`).join("\n")}\nStudent: ${lastUserMessage}` }] }
        ],
        config: {
          temperature: 0.7,
        }
      });

      const responseText = response.text || "I'm processing that. Let me cross-check the campus map for you!";
      res.json({ response: responseText });
    } catch (error: any) {
      console.error("Gemini API Error:", error);
      res.status(500).json({ error: "Something went wrong talking to Gemini: " + error.message });
    }
  });

  // Serve static assets in development vs production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`LASUSTECH Guide Server booted on http://0.0.0.0:${PORT}`);
  });
}

startServer();
