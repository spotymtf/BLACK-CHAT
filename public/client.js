const socket = io();
let mediaRecorder;
let audioChunks = [];
let users = [];
let loggedInUser = null;

// Helper to switch views
function showView(viewId) {
    const views = ["login-screen", "sign-up-screen", "chat-screen", "profile-screen"];
    views.forEach((view) => {
        document.getElementById(view).style.display = view === viewId ? "flex" : "none";
    });
}

// Sign-Up and Login
function signUp() {
    const username = document.getElementById("signup-username").value.trim();
    const password = document.getElementById("signup-password").value.trim();
    const profilePicture = document.getElementById("profile-picture").files[0];

    if (username && password) {
        const reader = new FileReader();
        reader.onload = () => {
            users.push({ username, password, profilePicture: reader.result });
            alert("Sign-Up Successful!");
            showView("login-screen");
        };
        if (profilePicture) {
            reader.readAsDataURL(profilePicture);
        } else {
            users.push({ username, password, profilePicture: null });
            alert("Sign-Up Successful!");
            showView("login-screen");
        }
    } else {
        alert("Please fill in all fields!");
    }
}

function login() {
    const username = document.getElementById("login-username").value.trim();
    const password = document.getElementById("login-password").value.trim();

    const user = users.find(
        (user) => user.username === username && user.password === password
    );

    if (user) {
        loggedInUser = user;
        alert(`Welcome back, ${user.username}!`);
        showView("chat-screen");
    } else {
        alert("Invalid username or password!");
    }
}

// Profile Management
function showProfile() {
    const profileScreen = document.getElementById("profile-screen");
    const profilePicture = document.getElementById("current-profile-pic");
    const usernameField = document.getElementById("change-username");

    profilePicture.src = loggedInUser.profilePicture || "default-profile.png";
    usernameField.value = loggedInUser.username;
    showView("profile-screen");
}

function saveProfile() {
    const newUsername = document.getElementById("change-username").value.trim();
    const newProfilePicture = document.getElementById("change-profile-picture").files[0];

    if (newUsername) {
        loggedInUser.username = newUsername;
    }

    if (newProfilePicture) {
        const reader = new FileReader();
        reader.onload = () => {
            loggedInUser.profilePicture = reader.result;
            alert("Profile updated successfully!");
            showView("chat-screen");
        };
        reader.readAsDataURL(newProfilePicture);
    } else {
        alert("Profile updated successfully!");
        showView("chat-screen");
    }
}

function logout() {
    loggedInUser = null;
    alert("Logged out successfully!");
    showView("login-screen");
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

function toggleVoiceRecording() {
    const voiceBtn = document.getElementById("voice-btn");

    if (!mediaRecorder || mediaRecorder.state === "inactive") {
        navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
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
        });
    } else {
        mediaRecorder.stop();
        voiceBtn.classList.remove("recording");
    }
}

function showMediaOptions() {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "image/*,audio/*";
    fileInput.onchange = () => {
        const file = fileInput.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                if (file.type.startsWith("image/")) {
                    socket.emit("image-message", { image: reader.result, sender: loggedInUser.username });
                } else if (file.type.startsWith("audio/")) {
                    socket.emit("audio-message", { audio: reader.result, sender: loggedInUser.username });
                }
            };
            reader.readAsDataURL(file);
        }
    };
    fileInput.click();
}

// Handle Messages
socket.on("chat-message", (data) => {
    const messages = document.getElementById("messages");
    const messageDiv = document.createElement("div");
    messageDiv.className = `message ${data.sender === loggedInUser.username ? "sent" : "received"}`;
    messageDiv.innerHTML = `
        <div class="message-content">
            <strong>${data.sender}:</strong>
            <p>${data.text}</p>
        </div>
    `;
    messages.appendChild(messageDiv);
    messages.scrollTop = messages.scrollHeight;
});

socket.on("image-message", (data) => {
    const messages = document.getElementById("messages");
    const messageDiv = document.createElement("div");
    messageDiv.className = `message ${data.sender === loggedInUser.username ? "sent" : "received"}`;
    messageDiv.innerHTML = `
        <div class="message-content">
            <strong>${data.sender}:</strong>
            <img src="${data.image}" alt="Shared Image" class="shared-image">
        </div>
    `;
    messages.appendChild(messageDiv);
    messages.scrollTop = messages.scrollHeight;
});

socket.on("audio-message", (data) => {
    const messages = document.getElementById("messages");
    const messageDiv = document.createElement("div");
    messageDiv.className = `message ${data.sender === loggedInUser.username ? "sent" : "received"}`;
    messageDiv.innerHTML = `
        <div class="message-content">
            <strong>${data.sender}:</strong>
            <audio controls>
                <source src="${data.audio}" type="audio/ogg">
                Your browser does not support the audio element.
            </audio>
        </div>
    `;
    messages.appendChild(messageDiv);
    messages.scrollTop = messages.scrollHeight;
});
