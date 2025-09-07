import express from "express";
import fetch from "node-fetch";

const app = express();

/**
 * Panggil Gemini API dengan gaya "teman humoris & pintar"
 */
async function askGemini(userInput) {
  const response = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" +
      process.env.GEMINI_API_KEY,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `Kamu adalah seperti manusia yang ramah ketika disapa. 
Jawablah seolah kamu adalah manusia yang disapa dengan ramah di live chat. 
Gunakan bahasa manusia usia 18-30 tahun. ramah, sopan, dan tetap pintar.
Maksimal 2 kalimat, jangan terlalu panjang. 
Input user: ${userInput}`
              }
            ]
          }
        ]
      })
    }
  );

  const data = await response.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
}

/**
 * Endpoint tunggal untuk Nightbot
 */
app.get("/", async (req, res) => {
  const userInput = req.query.q;
  if (!userInput) return res.send("halo juga'");

  try {
    let reply = await askGemini(userInput);

    // Kalau terlalu panjang → ringkas
    if (reply.length > 400) {
      reply = await askGemini(
        `Ringkas jawaban berikut jadi 1-2 kalimat singkat, tetap asyik dan ramah:\n\n${reply}`
      );
    }

    // Bersihkan format aneh
    reply = reply
      .replace(/\*\*/g, "")
      .replace(/`/g, "")
      .replace(/#+/g, "")
      .replace(/\n+/g, " ")
      .trim();

    // Tambahkan sentuhan santai
    reply = reply + " 😎";

    res.send(reply.substring(0, 400));
  } catch (err) {
    res.send("⚠️ Error: " + err.message);
  }
});

// Jalankan lokal
app.listen(3000, () => {
  console.log("✅ Server jalan di http://localhost:3000");
});
