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
        // Emit message to the server
        socket.emit('chat-message', { text: message, timestamp: new Date().toLocaleTimeString() });

        // Add the message to the chat locally for immediate feedback
        addMessageToChat({ username: 'You', text: message, timestamp: new Date().toLocaleTimeString(), sender: 'self' });

        input.value = ''; // Clear the input
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
            alert('Error accessing microphone.');
        }
    } else {
        mediaRecorder.stop();
        voiceBtn.classList.remove('recording');
    }
}

function addMessageToChat(data) {
    const messages = document.getElementById('messages');
    const messageDiv = document.createElement('div');

    // Determine message class (sent or received)
    messageDiv.className = `message ${data.sender === 'self' ? 'sent' : 'received'}`;

    // Add message content
    messageDiv.innerHTML = `
        <div class="message-content">
            <strong>${data.username}:</strong>
            <p>${data.text}</p>
            <div class="timestamp">${data.timestamp}</div>
        </div>
    `;

    // Append to messages container and scroll to the bottom
    messages.appendChild(messageDiv);
    messages.scrollTop = messages.scrollHeight;
}

// Handle receiving messages from the server
socket.on('chat-message', (data) => {
    addMessageToChat(data);
});

// Handle voice messages
socket.on('voice-message', (data) => {
    const messages = document.getElementById('messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${data.sender === 'self' ? 'sent' : 'received'}`;

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

// Handle system messages
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

// Handle pressing Enter to send a message
document.getElementById('message-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

// Profile Management Button
document.getElementById('profile-management-btn').addEventListener('click', () => {
    document.getElementById('profile-management-screen').style.display = 'flex';
});

document.getElementById('logout-btn').addEventListener('click', () => {
    location.reload();
});

document.getElementById('change-profile-btn').addEventListener('click', () => {
    const newUsername = prompt('Enter new username:');
    if (newUsername) {
        socket.emit('update-profile', { username: newUsername });
        alert('Username updated successfully!');
    }
});

document.getElementById('change-picture-btn').addEventListener('click', () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                socket.emit('update-profile-picture', { picture: reader.result });
                alert('Profile picture updated successfully!');
            };
            reader.readAsDataURL(file);
        }
    };
    fileInput.click();
});
