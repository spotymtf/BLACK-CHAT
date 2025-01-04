const socket = io();
let mediaRecorder;
let audioChunks = [];

function joinChat() {
    const username = document.getElementById('username').value.trim();
    if (username) {
        document.getElementById('login-screen').style.display = 'none';
        document.getElementById('chat-screen').style.display = 'flex';
        socket.emit('join', username);
    }
}

function sendMessage() {
    const input = document.getElementById('message-input');
    const message = input.value.trim();
    if (message) {
        socket.emit('chat-message', message);
        input.value = '';
    }
}

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
            console.error('Error accessing microphone:', err);
            alert('Erreur d\'accès au microphone');
        }
    } else {
        mediaRecorder.stop();
        voiceBtn.classList.remove('recording');
    }
}

socket.on('chat-message', (data) => {
    const messages = document.getElementById('messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${data.sender === socket.id ? 'sent' : 'received'}`;
    
    messageDiv.innerHTML = `
        <div class="message-content">
            <strong>${data.username}:</strong>
            <p>${data.text}</p>
            <div class="timestamp">${data.timestamp}</div>
        </div>
    `;
    
    messages.appendChild(messageDiv);
    messages.scrollTop = messages.scrollHeight;
});

socket.on('voice-message', (data) => {
    const messages = document.getElementById('messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${data.sender === socket.id ? 'sent' : 'received'}`;
    
    const audio = new Audio(URL.createObjectURL(new Blob([data.audio], { type: 'audio/ogg; codecs=opus' })));
    
    messageDiv.innerHTML = `
        <div class="message-content">
            <strong>${data.username}:</strong>
            <p>
                <button onclick="this.nextElementSibling.play()">
                    <i class="fas fa-play"></i>
                </button>
                <audio style="display:none"></audio>
            </p>
            <div class="timestamp">${data.timestamp}</div>
        </div>
    `;
    
    messageDiv.querySelector('audio').src = URL.createObjectURL(new Blob([data.audio], { type: 'audio/ogg; codecs=opus' }));
    messages.appendChild(messageDiv);
    messages.scrollTop = messages.scrollHeight;
});

socket.on('system-message', (data) => {
    const messages = document.getElementById('messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'system-message';
    messageDiv.innerHTML = `
        <p>${data.text}</p>
        <div class="timestamp">${data.timestamp}</div>
    `;
    messages.appendChild(messageDiv);
    messages.scrollTop = messages.scrollHeight;
});

document.getElementById('message-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});