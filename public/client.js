const socket = io();
let mediaRecorder;
let audioChunks = [];
let editingMessageId = null;

// Function to handle sign-up
function signUp() {
    const name = document.getElementById('name').value.trim();
    const number = document.getElementById('number').value.trim();

    if (name && number) {
        document.getElementById('signup-screen').style.display = 'none';
        document.getElementById('chat-screen').style.display = 'flex';
        socket.emit('signup', { name, number });
    }
}

// Function to open the profile management interface
function openProfile() {
    alert("Profile management feature is under development.");
}

// Function to send a regular text message
function sendMessage() {
    const input = document.getElementById('message-input');
    const message = input.value.trim();
    if (message) {
        socket.emit('chat-message', message);
        input.value = '';
    }
}

// Function to toggle voice recording
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

// Function to open the edit message modal
function openEditModal(messageId, messageText) {
    editingMessageId = messageId;
    document.getElementById('edit-message-content').value = messageText;
    document.getElementById('edit-message-modal').style.display = 'flex';
}

// Function to close the edit message modal
function closeEditModal() {
    editingMessageId = null;
    document.getElementById('edit-message-content').value = '';
    document.getElementById('edit-message-modal').style.display = 'none';
}

// Function to save the edited message
function saveEditedMessage() {
    const editedText = document.getElementById('edit-message-content').value.trim();
    if (editedText && editingMessageId) {
        socket.emit('edit-message', { messageId: editingMessageId, newText: editedText });
        closeEditModal();
    }
}

// Function to delete a message
function deleteMessage(messageId) {
    socket.emit('delete-message', messageId);
}

// Listen for incoming chat messages
socket.on('chat-message', (data) => {
    displayMessage(data, 'chat-message');
});

// Listen for incoming voice messages
socket.on('voice-message', (data) => {
    displayMessage(data, 'voice-message');
});

// Listen for incoming system messages (edit/delete)
socket.on('system-message', (data) => {
    displaySystemMessage(data);
});

// Function to display a chat message
function displayMessage(data, type) {
    const messages = document.getElementById('messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${data.sender === socket.id ? 'sent' : 'received'}`;
    
    let content = '';
    if (type === 'chat-message') {
        content = `
            <div class="message-content">
                <strong>${data.username}:</strong>
                <p>${data.text}</p>
                <div class="timestamp">${data.timestamp}</div>
                <button onclick="openEditModal('${data.messageId}', '${data.text}')">Edit</button>
                <button onclick="deleteMessage('${data.messageId}')">Delete</button>
            </div>
        `;
    } else if (type === 'voice-message') {
        const audio = new Audio(URL.createObjectURL(new Blob([data.audio], { type: 'audio/ogg; codecs=opus' })));
        content = `
            <div class="message-content">
                <strong>${data.username}:</strong>
                <p>
                    <button onclick="this.nextElementSibling.play()">
                        <i class="fas fa-play"></i>
                    </button>
                    <audio style="display:none"></audio>
                </p>
                <div class="timestamp">${data.timestamp}</div>
                <button onclick="openEditModal('${data.messageId}', '${data.text}')">Edit</button>
                <button onclick="deleteMessage('${data.messageId}')">Delete</button>
            </div>
        `;
        messageDiv.querySelector('audio').src = URL.createObjectURL(new Blob([data.audio], { type: 'audio/ogg; codecs=opus' }));
    }

    messageDiv.innerHTML = content;
    messages.appendChild(messageDiv);
    messages.scrollTop = messages.scrollHeight
