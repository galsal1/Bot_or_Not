// public/script.js
const socket = io();

const chatContainer = document.getElementById('chatContainer');
const chatMessages = document.getElementById('chatMessages');
const messageInput = document.getElementById('messageInput');
const sendButton = document.getElementById('sendButton');
const timerDisplay = document.getElementById('timer');
const startButton = document.getElementById('startButton');
const restartButton = document.getElementById('restartButton');
const finalAnalysisDiv = document.getElementById('finalAnalysis');
const userClassificationDiv = document.getElementById('userClassification');
const commentInput = document.getElementById('commentInput');
const humanCheckbox = document.getElementById('humanCheckbox');
const submitClassificationButton = document.getElementById('submitClassificationButton');

let timeLeft = 120; // 2 minutes countdown
let timerInterval = null;
let currentChatId = null;  // will store the chat DB ID

// Recursive typeMessage function to simulate natural typing
function typeMessage(input, message, index = 0) {
  if (index < message.length) {
    input.value += message.charAt(index);
    input.dispatchEvent(new Event("input", { bubbles: true }));
    setTimeout(() => {
      typeMessage(input, message, index + 1);
    }, 100);
  }
}

// Append message to chat window
function addMessage(content, sender) {
  const messageDiv = document.createElement('div');
  messageDiv.classList.add('message', sender);
  messageDiv.textContent = content;
  chatMessages.appendChild(messageDiv);
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

// Start chat on Start button click (only once)
startButton.addEventListener('click', () => {
  startButton.classList.add('hidden');
  stopButton.classList.remove('hidden');
  chatContainer.classList.remove('hidden');
  timerDisplay.classList.remove('hidden');
  messageInput.disabled = false;
  sendButton.disabled = false;
  startTimer();
});

// Restart chat by reloading the page
restartButton.addEventListener('click', () => {
  socket.emit('resetChat'); // Tell server to clear history
  location.reload(); // Hard reset
});


// Manual send message on click or Enter key
sendButton.addEventListener('click', sendMessage);
messageInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    sendMessage();
  }
});

function sendMessage() {
  const msg = messageInput.value.trim();
  if (msg === "") return;
  
  addMessage(msg, 'user');
  socket.emit('userMessage', msg);
  messageInput.value = "";
}

// Start the timer (only once)
function startTimer() {
  timeLeft = 120;
  timerDisplay.textContent = timeLeft;
  timerInterval = setInterval(() => {
    timeLeft--;
    timerDisplay.textContent = timeLeft;
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      endChat();
    }
  }, 1000);
}

// When timer ends, disable input and request final classification
function endChat() {
  messageInput.disabled = true;
  sendButton.disabled = true;
  restartButton.classList.remove('hidden');
  stopButton.classList.add('hidden');
  socket.emit('finalizeChat');
}
const stopButton = document.getElementById('stopButton');
stopButton.classList.add('hidden'); // Hide the Stop button at the beginning 


stopButton.addEventListener('click', () => {
  stopButton.classList.remove('hidden');
  clearInterval(timerInterval); // Stop the timer
  timeLeft = 0;
  timerDisplay.textContent = timeLeft;
  endChat(); // Call the existing function to finalize the chat
});


// Listen for bot messages from the server
socket.on('botMessage', (msg) => {
  addMessage(msg, 'bot');
});

// When final classification is received, show classification input
socket.on('finalClassification', (data) => {
  const { classification, chatId } = data;
  addMessage(classification, 'bot');
  finalAnalysisDiv.textContent = "Final Analysis: " + classification;
  currentChatId = chatId;
  // classificationInput.value = "";
  userClassificationDiv.classList.remove('hidden');
});

// Handle submit classification button click
submitClassificationButton.addEventListener('click', () => {
  const comment=commentInput.value.trim();
  const actualClassification = humanCheckbox.checked ? "Human" : "AI";
  socket.emit('saveChat', { chatId: currentChatId, comment: comment, actualClassification: actualClassification });
  socket.on('saveChatResponse', (message) => {
    alert("✅ Data saved to database!");
  });  
  // Disable the input after submission
  commentInput.disabled = true;
  submitClassificationButton.disabled = true;
});
