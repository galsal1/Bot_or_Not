(function() {
    console.log("Extension content script loaded");

    const chatContainer = document.getElementById("chatMessages");
    const startButton = document.getElementById("startButton");
    const sendButton = document.getElementById("sendButton");
    const timerElement = document.getElementById("timer");

    if (!chatContainer) {
        console.log("Chat container not found.");
        return;
    }
    console.log("Chat container found:", chatContainer);

    const userPersonas = [
        "You are Alex, a 25-year-old software engineer from New York. Respond casually with short, friendly messages.",
        "You are Sarah, a 30-year-old teacher from London. Your responses are brief and conversational.",
        "You are Tom, a 40-year-old businessman from Berlin. Reply in a concise and genuine manner.",
        "You are Emily, a 22-year-old university student from Toronto. Keep your replies short and natural.",
        "You are Jake, a 35-year-old fitness trainer from Sydney. Answer straightforwardly with brief messages."
    ];

    const goodbyePrompt = "When you determine that the conversation should end, please include the farewell keyword 'goodbye' at the end of your reply.";
    const selectedPersona = userPersonas[Math.floor(Math.random() * userPersonas.length)] + goodbyePrompt;
    console.log("Selected AI user persona:", selectedPersona);

    // Variable to track the last processed partner message
    let lastProcessedMessage = "";

    function getLastPartnerMessage() {
        const messages = document.querySelectorAll("#chatMessages .bot");
        if (messages.length > 0) {
            return messages[messages.length - 1].innerText;
        }
        return "";
    }

    function isTimerRunning() {
        if (timerElement) {
            return parseInt(timerElement.innerText) > 0;
        }
        return false;
    }

    async function ensureChatIsActive() {
        return new Promise((resolve) => {
            if (startButton && startButton.offsetParent !== null && !startButton.disabled) {
                console.log("Clicking 'Start Chat' button...");
                startButton.click();
                setTimeout(resolve, 2000);
            } else {
                resolve();
            }
        });
    }

    const observer = new MutationObserver((mutations) => {
        mutations.forEach(mutation => {
            if (mutation.addedNodes.length > 0) {
                console.log("Extension: New node added to chat container");
                chrome.storage.local.get("active", async (result) => {
                    const isActive = (result.active === true);
                    console.log("Extension: Auto-reply active state:", isActive);
                    if (isActive && isTimerRunning()) {
                        const currentMessage = getLastPartnerMessage();
                        console.log("Extension: Current partner message:", currentMessage);

                        if (currentMessage && currentMessage !== lastProcessedMessage) {
                            lastProcessedMessage = currentMessage; // Update last processed message
                            await ensureChatIsActive();

                            chrome.runtime.sendMessage({
                                type: "generateReply",
                                currentMessage: currentMessage,
                                persona: selectedPersona
                            }, (response) => {
                                if (response && response.reply) {
                                    console.log("Extension: Received auto-reply:", response.reply);

                                    // Calculate delay based on response length
                                    const typingSpeed = 15; // Characters per second (adjustable)
                                    const baseDelay = 500; // Minimum delay in milliseconds
                                    const responseLength = response.reply.length;
                                    const delay = baseDelay + (responseLength / typingSpeed) * 1000;

                                    console.log("Extension: Setting reply timeout with delay (ms):", delay);

                                    setTimeout(() => {
                                        if (!isTimerRunning()) {
                                            console.log("Extension: Timer expired, not sending reply.");
                                            return;
                                        }

                                        const input = document.getElementById("messageInput");
                                        if (input) {
                                            input.disabled = false;
                                            input.value = response.reply;
                                            console.log("Extension: Reply set directly in input.");

                                            const enterEvent = new KeyboardEvent("keydown", {
                                                bubbles: true,
                                                cancelable: true,
                                                key: "Enter",
                                                code: "Enter"
                                            });

                                            setTimeout(() => {
                                                console.log("Extension: Simulating Enter keypress to send message.");
                                                input.dispatchEvent(enterEvent);
                                            }, 500);

                                            setTimeout(() => {
                                                console.log("Extension: Clicking Send");
                                                sendButton.click();

                                                // If it's a conversation-ending message, stop AFTER sending
                                                if (response.endConversation) {
                                                    console.log("Extension: Detected conversation-ending message. Ending conversation after sending...");
                                                    setTimeout(() => {
                                                        const stopButton = document.getElementById("stopButton");
                                                        if (stopButton) {
                                                            console.log("Extension: Clicking stop button to end conversation.");
                                                            stopButton.click();
                                                        } else {
                                                            console.log("Extension: Stop button not found.");
                                                        }
                                                    }, 1000); // Delay ensures message is sent before stopping
                                                }

                                            }, 1000); // Ensuring send action completes before stop
                                        } else {
                                            console.log("Extension: Input field not found.");
                                        }
                                    }, delay);
                                } else {
                                    console.log("Extension: No reply received from background.");
                                }
                            });
                        } else {
                            console.log("Extension: No new partner message to reply to.");
                        }
                    }
                });
            }
        });
    });

    observer.observe(chatContainer, { childList: true, subtree: true });
})();
