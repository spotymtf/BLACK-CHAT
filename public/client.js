const socket = io();
let mediaRecorder;
let audioChunks = [];

// Join Chat Functionality
function joinChat() {
    const username = document.getElementById('username').value.trim();
    if (username) {
        document.getElementById('login-screen').style.display = 'none';
        document.getElementById('chat-screen').style.display = 'flex';
        socket.emit('join', username);
    }
}

// Send Message
function sendMessage() {
    const input = document.getElementById('message-input');
    const message = input.value.trim();
    if (message) {
        socket.emit('chat-message', { text: message });
        input.value = '';
    }
}

// Voice Message Recording
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

// Profile Management Button
function manageProfile() {
    alert('Profile management coming soon!');
}

// Socket Event Listeners
socket.on('chat-message', (data) => {
    const messages = document.getElementById('messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message received';
    messageDiv.innerHTML = `
        <div class="message-content">
            <p>${data.text}</p>
        </div>
    `;
    messages.appendChild(messageDiv);
    messages.scrollTop = messages.scrollHeight;
});

socket.on('voice-message', (audioBlob) => {
    const messages = document.getElementById('messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message received';
    const audioURL = URL.createObjectURL(audioBlob);

    messageDiv.innerHTML = `
        <div class="message-content">
            <audio controls>
                <source src="${audioURL}" type="audio/ogg">
            </audio>
        </div>
    `;
    messages.appendChild(messageDiv);
    messages.scrollTop = messages.scrollHeight;
});
