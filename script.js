const chatInput = document.querySelector(".chat-input textarea");
const sendChatBtn = document.querySelector(".chat-input span");
const chatbox = document.querySelector(".chatbox");
const chatbotToggler = document.querySelector(".chatbot-toggler");
const chatbotCloseBtn = document.querySelector(".close-btn");

let userMessage;

const API_KEY = "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";
const inputInitHeight = chatInput.scrollHeight;

// Create a chat list item
const createChatLi = (message, className) => {
    const chatLi = document.createElement("li");
    chatLi.classList.add("chat", className);

    let chatContent = className === "outgoing" 
        ? `<p></p>` 
        : `<span class="material-symbols-outlined">smart_toy</span> <p></p>`;

    chatLi.innerHTML = chatContent;
    chatLi.querySelector("p").textContent = message;
    return chatLi;
};

const generateResponse = (incomingChatLi, attempt = 1) => {
   const API_URL = "https://api.openai.com/v1/chat/completions";
   const messageElement = incomingChatLi.querySelector("p");

   const requestOptions = {
       method: "POST",
       headers: {
           "Content-Type": "application/json",
           "Authorization": `Bearer ${API_KEY}`
       },
       body: JSON.stringify({
           model: "gpt-3.5-turbo",
           messages: [{ role: "user", content: userMessage }]
       })
   };

   fetch(API_URL, requestOptions)
       .then(res => {
           // Check if the response is okay
           if (!res.ok) {
               if (res.status === 429 && attempt < 3) {
                   // Retry if rate limited
                   const retryAfter = res.headers.get("Retry-After") || 1; // Get retry time from headers or set default to 1 second
                   setTimeout(() => {
                       generateResponse(incomingChatLi, attempt + 1);
                   }, retryAfter * 1000); // Wait for the specified time before retrying
                   return; // Exit the current fetch chain
               } else {
                   throw new Error(`HTTP error! Status: ${res.status}`);
               }
           }
           return res.json();
       })
       .then(data => {
           console.log(data); // Log the entire response to the console for debugging
           // Check for errors in response
           if (data.choices && data.choices.length > 0) {
               messageElement.textContent = data.choices[0].message.content;
           } else {
               messageElement.textContent = "Sorry, I couldn't get a response.";
           }
       })
       .catch(error => {
           console.error("Error:", error); // Log any errors to the console
           messageElement.classList.add("error");
           messageElement.textContent = "Oops! Something went wrong. Please try again.";
       })
       .finally(() => chatbox.scrollTo(0, chatbox.scrollHeight));
};



// Handle the chat submission
const handleChat = () => {
    userMessage = chatInput.value.trim();  // Get and trim the user input
    if (!userMessage) return;  
    chatInput.value = "";
    chatInput.style.height = `${inputInitHeight}px`;

    chatbox.appendChild(createChatLi(userMessage, "outgoing"));
    chatbox.scrollTo(0, chatbox.scrollHeight);

    setTimeout(() => {
        const incomingChatLi = createChatLi("Thinking...", "incoming");
        chatbox.appendChild(incomingChatLi);
        chatbox.scrollTo(0, chatbox.scrollHeight);
        generateResponse(incomingChatLi);
    }, 600);  
};

// Fix textarea input event for resizing
chatInput.addEventListener("input", () => {
    chatInput.style.height = `${inputInitHeight}px`;
    chatInput.style.height = `${chatInput.scrollHeight}px`;
});

// Fix keydown event for submitting the message on Enter
chatInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey && window.innerWidth > 800) {
        e.preventDefault();
        handleChat();
    }
});

sendChatBtn.addEventListener("click", handleChat);

// Toggle chatbot visibility on button click
chatbotToggler.addEventListener("click", () => {
    document.body.classList.toggle("show-chatbot");
});

// Close the chatbot when the close button is clicked
chatbotCloseBtn.addEventListener("click", () => {
    document.body.classList.remove("show-chatbot");
});
