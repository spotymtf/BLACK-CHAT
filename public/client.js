const socket = io();
let mediaRecorder;
let audioChunks = [];

// Sign Up
function signUp() {
    const username = document.getElementById('username').value.trim();
    if (username) {
        document.getElementById('login-screen').style.display = 'none';
        document.getElementById('chat-screen').style.display = 'flex';
        socket.emit('join', username);
    }
}

// Sign In
function signIn() {
    const username = document.getElementById('username-signin').value.trim();
    if (username) {
        document.getElementById('sign-in-screen').style.display = 'none';
        document.getElementById('chat-screen').style.display = 'flex';
        socket.emit('join', username);
    }
}

function showSignUp() {
    document.getElementById('sign-in-screen').style.display = 'none';
    document.getElementById('login-screen').style.display = 'flex';
}

function showSignIn() {
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('sign-in-screen').style.display = 'flex';
}

// Send Message
function sendMessage() {
    const input = document.getElementById('message-input');
    const message = input.value.trim();
    if (message) {
        socket.emit('chat-message', message);
        input.value = '';
    }
}

// Voice Message Toggle
async function toggleVoiceRecording() {
    const voiceBtn = document.getElementById('voice-btn');
    if (!mediaRecorder || mediaRecorder.state === 'inactive') {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorder = new MediaRecorder(stream);
            audioChunks = [];

            mediaRecorder.ondataavailable = (event) => {
                audioChunks.push(event.data);
            };

            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunks, { type: 'audio/ogg; codecs=opus' });
                socket.emit('voice-message', audioBlob);
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();
            voiceBtn.classList.add('recording');
        } catch (err) {
            alert('Microphone access denied.');
        }
    } else {
        mediaRecorder.stop();
        voiceBtn.classList.remove('recording');
    }
}

// Profile Management Placeholder
function manageProfile() {
    alert('Profile management coming soon!');
}

// Chat Message Received
socket.on('chat-message', (data) => {
    const messages = document.getElementById('messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${data.sender === socket.id ? 'sent' : 'received'}`;
    messageDiv.innerHTML = `
        <div class="message-content">
            <p>${data.text}</p>
            <div class="timestamp">${data.timestamp}</div>
        </div>
    `;
    messages.appendChild(messageDiv);
    messages.scrollTop = messages.scrollHeight;
});

// Voice Message Received
socket.on('voice-message', (data) => {
    const messages = document.getElementById('messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${data.sender === socket.id ? 'sent' : 'received'}`;
    const audio = new Audio(URL.createObjectURL(new Blob([data.audio], { type: 'audio/ogg; codecs=opus' })));

    messageDiv.innerHTML = `
        <div class="message-content">
