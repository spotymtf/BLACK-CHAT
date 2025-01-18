const socket = io();

let mediaRecorder;
let audioChunks = [];

/* AUTH FUNCTIONALITY */
function switchToLogin() {
    document.getElementById('sign-up-container').classList.add('hidden');
    document.getElementById('login-container').classList.remove('hidden');
}

function switchToSignUp() {
    document.getElementById('login-container').classList.add('hidden');
    document.getElementById('sign-up-container').classList.remove('hidden');
}

function signUp() {
    const username = document.getElementById('signup-username').value.trim();
    const number = document.getElementById('signup-number').value.trim();
    const password = document.getElementById('signup-password').value.trim();

    if (username && number && password) {
        alert('Sign Up Successful!');
        switchToLogin();
    } else {
        alert('All fields are required.');
    }
}

function logIn() {
    const usernameOrNumber = document.getElementById('login-username-or-number').value.trim();
    const password = document.getElementById('login-password').value.trim();

    if (usernameOrNumber && password) {
        alert('Log In Successful!');
        document.getElementById('auth-screen').style.display = 'none';
        document.getElementById('chat-screen').style.display = 'flex';
    } else {
        alert('Invalid credentials.');
    }
}

/* CHAT FUNCTIONALITY */
function sendMessage() {
    const input = document.getElementById('message-input');
    const message = input.value.trim();
    if (message) {
        socket.emit('chat-message', message);
        input.value = '';
    }
}

/* VOICE RECORDING */
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
                stream.getTracks().forEach((track) => track.stop());
            };

            mediaRecorder.start();
            voiceBtn.classList.add('recording');
        } catch (err) {
            console.error('Microphone access denied:', err);
        }
    } else {
        mediaRecorder.stop();
        voiceBtn.classList.remove('recording');
    }
}

/* PROFILE FUNCTIONALITY */
function showProfile() {
    document.getElementById('chat-screen').style.display = 'none';
    document.getElementById('profile-screen').style.display = 'flex';
}

function saveProfile() {
    const newUsername = document.getElementById('profile-username').value.trim();
    if (newUsername) {
        alert('Profile updated successfully.');
    } else {
        alert('Enter a valid username.');
    }
}

function logout() {
    alert('Logged out.');
    location.reload();
}

function backToChat() {
    document.getElementById('profile-screen').style.display = 'none';
    document.getElementById('chat-screen').style.display = 'flex';
}
