const socket = io();
let mediaRecorder;
let audioChunks = [];

// Handle sign-up
function signUp() {
    const username = document.getElementById('username').value.trim();
    const phoneNumber = document.getElementById('phone-number').value.trim();

    if (username && phoneNumber) {
        // Hide the signup screen and show the chat screen
        document.getElementById('signup-screen').style.display = 'none';
        document.getElementById('chat-screen').style.display = 'flex';

        // Emit the user details to the server
        socket.emit('join', { username, phoneNumber });
    } else {
        alert('Please fill in all fields.');
    }
}

// Handle text messages
function sendMessage() {
    const input = document.getElementById('message-input');
    const message = input.value.trim();
    if (message) {
        socket.emit('chat-message', message);
        input.value = '';
    }
}

// Handle voice messages
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
            };

            mediaRecorder.start();
        } catch (err) {
            console.error('Error accessing microphone:', err);
        }
    } else {
        mediaRecorder.stop();
    }
}

// Display messages
socket.on('chat-message', (data) => {
    const messages = document.getElementById('messages');
    const messageDiv = document.createElement('div');
    messageDiv.textContent = data;
    messages.appendChild(messageDiv);
});
