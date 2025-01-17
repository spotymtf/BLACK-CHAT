const socket = io();
let mediaRecorder;
let audioChunks = [];
let users = [];
let loggedInUser = null;

// Switch Views
function showView(viewId) {
    const views = ["login-screen", "sign-up-screen", "chat-screen", "profile-screen"];
    views.forEach((view) => {
        document.getElementById(view).style.display = view === viewId ? "flex" : "none";
    });
}

// Sign Up
function signUp() {
    const username = document.getElementById("signup-username").value.trim();
    const password = document.getElementById("signup-password").value.trim();
    const mobileNumber = document.getElementById("signup-mobile").value.trim();
    const profilePicture = document.getElementById("signup-profile-picture").files[0];

    if (username && password && mobileNumber) {
        const existingUser = users.find(
            (user) => user.username === username || user.mobileNumber === mobileNumber
        );

        if (existingUser) {
            alert("User with this username or mobile number already exists!");
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            users.push({
                username,
                password,
                mobileNumber,
                profilePicture: reader.result,
            });
            alert("Sign-Up Successful!");
            showView("login-screen");
        };

        if (profilePicture) {
            reader.readAsDataURL(profilePicture);
        } else {
            users.push({
                username,
                password,
                mobileNumber,
                profilePicture: null,
            });
            alert("Sign-Up Successful!");
            showView("login-screen");
        }
    } else {
        alert("Please fill in all fields!");
    }
}

// Login
function login() {
    const usernameOrNumber = document.getElementById("login-username-or-number").value.trim();
    const password = document.getElementById("login-password").value.trim();

    const user = users.find(
        (user) =>
            (user.username === usernameOrNumber || user.mobileNumber === usernameOrNumber) &&
            user.password === password
    );

    if (user) {
        loggedInUser = user;
        alert(`Welcome back, ${user.username}!`);
        showView("chat-screen");
    } else {
        alert("Invalid username/mobile number or password!");
    }
}

// Chat Features
function sendMessage() {
    const input = document.getElementById("message-input");
    const message = input.value.trim();
    if (message) {
        socket.emit("chat-message", { text: message, sender: loggedInUser.username });
        input.value = "";
    }
}

async function toggleVoiceRecording() {
    const voiceBtn = document.getElementById("voice-btn");

    if (!mediaRecorder || mediaRecorder.state === "inactive") {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorder = new MediaRecorder(stream);
            audioChunks = [];

            mediaRecorder.ondataavailable = (event) => {
                audioChunks.push(event.data);
            };

            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunks, { type: "audio/ogg; codecs=opus" });
                socket.emit("voice-message", { audio: audioBlob, sender: loggedInUser.username });
                stream.getTracks().forEach((track) => track.stop());
            };

            mediaRecorder.start();
            voiceBtn.classList.add("recording");
        } catch (err) {
            console.error("Error accessing microphone:", err);
            alert("Error accessing microphone!");
        }
    } else {
        mediaRecorder.stop();
        voiceBtn.classList.remove("recording");
    }
}

// Handle Incoming Messages
socket.on("chat-message", (data) => {
    const messages = document.getElementById("messages");
    const messageDiv = document.createElement("div");
    messageDiv.className = `message ${data.sender === loggedInUser.username ? "sent" : "received"}`;

    messageDiv.innerHTML = `
        <div class="message-content">
            <strong>${data.sender}:</strong>
            <p>${data.text}</p>
            <div class="timestamp">${data.timestamp}</div>
        </div>
    `;

    messages.appendChild(messageDiv);
    messages.scrollTop = messages.scrollHeight;
});

// Add Event Listeners
document.getElementById("signup-button").addEventListener("click", signUp);
document.getElementById("login-button").addEventListener("click", login);
document.getElementById("message-input").addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        sendMessage();
    }
});
