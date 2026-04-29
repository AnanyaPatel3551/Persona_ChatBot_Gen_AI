require("dotenv").config();

async function testGroq() {
  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [
          { role: "user", content: "Hello from Groq!" }
        ]
      })
    });

    const data = await response.json();
    console.log("Response:", data);

  } catch (error) {
    console.error("Error details:", error);
  }
}

testGroq();