const socket = io();
let mediaRecorder;
let audioChunks = [];

function joinChat() {
    const username = document.getElementById('username').value.trim();
    const number = document.getElementById('number').value.trim();
    if (username && number) {
        document.getElementById('login-screen').style.display = 'none';
        document.getElementById('chat-screen').style.display = 'flex';
        document.getElementById('profile-username').innerText = username;
        document.getElementById('profile-number').innerText = number;
        socket.emit('join', { username, number });
    }
}

function showCreators() {
    alert("Creators: Alvin Pieterson - +1234567890, Spoty MTF - +0987654321");
}

function openProfile() {
    document.getElementById('profile-screen').style.display = 'flex';
}

function closeProfile() {
    document.getElementById('profile-screen').style.display = 'none';
}

function sendMessage() {
    const input = document.getElementById('message-input');
    const message = input.value.trim();
    if (message) {
        socket.emit('chat-message', { text: message, sender: socket.id });
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
                socket.emit('voice-message', { audio: audioBlob, sender: socket.id });
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
        <div class="message-content" data-sender="${data.sender}" data-id="${data.id}">
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
        <div class="message-content" data-sender="${data.sender}" data-id="${data.id}">
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

// Long press to show edit/delete popup
document.getElementById('messages').addEventListener('contextmenu', (e) => {
    e.preventDefault();
    const messageContent = e.target.closest('.message-content');
    if (messageContent) {
        const messageId = messageContent.getAttribute('data-id');
        const messageSender = messageContent.getAttribute('data-sender');
        
        if (messageSender === socket.id) {
            const popup = document.createElement('div');
            popup.className = 'edit-delete-popup';
            popup.innerHTML = `
                <button onclick="editMessage('${messageId}')">Edit</button>
                <button onclick="deleteMessage('${messageId}')">Delete</button>
            `;
            document.body.appendChild(popup);
            popup.style.left = e.pageX + 'px';
            popup.style.top = e.pageY + 'px';

            document.addEventListener('click', () => {
                popup.remove();
            }, { once: true });
        }
    }
});

function editMessage(id) {
    const messageContent = document.querySelector(`.message-content[data-id="${id}"] p`);
    const text = prompt("Edit your message:", messageContent.textContent);
    if (text !== null && text.trim() !== "") {
        socket.emit('edit-message', { id, text });
    }
}

function deleteMessage(id) {
    socket.emit('delete-message', { id });
}
