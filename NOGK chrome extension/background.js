const apiKey ="Your-API-KEY"

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === "generateReply") {
      console.log("Received request to generate reply for:", request.currentMessage);
      console.log("Using persona:", request.persona);
    
      const messages = [
        { role: "system", content: request.persona },
        { role: "user", content: `Reply to: ${request.currentMessage}` }
      ];

      fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: messages,
          temperature: 0.7
        })
      })
          .then(response => response.json())
          .then(data => {
            if (data.choices && data.choices.length > 0) {
              const reply = data.choices[0].message.content;
              console.log("Generated reply:", reply);

              const farewellKeywords = ["goodbye", "bye", "see you", "take care"];
              const lowerReply = reply.toLowerCase();
              const endConversation = farewellKeywords.some(keyword => lowerReply.includes(keyword));

              sendResponse({ reply: reply, endConversation: endConversation });

              if (endConversation) {
                console.log("Extension: Detected conversation ending response.");
                setTimeout(() => {
                  const stopButton = document.getElementById("stopButton");
                  if (stopButton) {
                    console.log("Extension: Clicking stop button to end the conversation.");
                    stopButton.click();
                  } else {
                    console.log("Extension: Stop button not found.");
                  }
                }, 5000);
              }
            } else {
              console.error("Unexpected API response:", data);
              sendResponse({ reply: "Error: Unexpected API response." });
            }
          })
          .catch(error => {
            console.error("Error calling OpenAI API:", error);
            sendResponse({ reply: "Error: Unable to generate reply." });
          });

      return true; // Keep the message channel open for async response
    }
});
