import bot from "./assets/bot.svg";
import user from "./assets/user.svg";

const form = document.querySelector("form");
const chatContainer = document.querySelector("#chat_container");

let loadInterval;

function loader(element) {
  element.textContent = "";
  loadInterval = setInterval(() => {
    element.textContent += ".";
    if (element.textContent === "....") {
      element.textContent = "";
    }
  }, 300);
}

function typeText(element, text) {
  let index = 0;
  let interval = setInterval(() => {
    if (index < text.length) {
      element.innerHTML += text.charAt(index);
      index++;
    } else {
      clearInterval(interval);
    }
  }, 20);
}

function generateUniqueId() {
  return crypto?.randomUUID();
}

function chatStripe(isAI, value, uniqueId) {
  return `
    <div class='wrapper ${isAI && "ai"}'>
      <div class='chat'>
        <div class='profile'>
          <img
            src="${isAI ? bot : user}"
            alt="${isAI ? "bot" : "user"}"
          />
        </div>
      <div class='message' id=${uniqueId}>${value}</div>
   </div>
   </div>
    `;
}

const handleSubmit = async (e) => {
  e.preventDefault();

  const data = new FormData(form);

  //user  chastripe

  chatContainer.innerHTML += chatStripe(false, data.get("prompt"));

  form.reset();

  //bot chatstripe
  const uid = generateUniqueId();

  chatContainer.innerHTML += chatStripe(true, "", uid);

  chatContainer.scrollTop = chatContainer.scrollHeight;

  const messageDiv = document.getElementById(uid);

  loader(messageDiv);

  //fetch data from bot from server

  const response = await fetch("https://codex-4kzi.onrender.com/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt: data.get("prompt"),
    }),
  });

  clearInterval(loadInterval);

  messageDiv.innerHTML = "";

  if (response.ok) {
    const data = await response.json();
    const parserData = data.bot.trim();

    typeText(messageDiv, parserData);
  } else {
    const err = await response.text();
    messageDiv.innerHTML = "Something went wrong";

    alert(err);
  }
};

form.addEventListener("submit", handleSubmit);

form.addEventListener("keyup", (e) => {
  if (e.key === "Enter") handleSubmit(e);
});
