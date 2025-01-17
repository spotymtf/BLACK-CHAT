function toggleAuth(authType) {
    const signupForm = document.getElementById('signup-form');
    const loginForm = document.getElementById('login-form');

    if (authType === 'signup') {
        signupForm.style.display = 'block';
        loginForm.style.display = 'none';
    } else {
        loginForm.style.display = 'block';
        signupForm.style.display = 'none';
    }
}

function toggleProfile() {
    const profileScreen = document.getElementById('profile-screen');
    profileScreen.classList.toggle('show');
}

function saveProfile() {
    const newUsername = document.getElementById('profile-username').value.trim();
    const profilePicture = document.getElementById('profile-picture').files[0];

    if (newUsername || profilePicture) {
        // Send updates to server or save locally
        console.log('Profile updated:', { newUsername, profilePicture });
    }
}

function logout() {
    // Reset UI and show login screen
    document.getElementById('login-screen').style.display = 'flex';
    document.getElementById('chat-screen').style.display = 'none';
    document.getElementById('profile-screen').classList.remove('show');
}

function uploadMedia(type) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = type === 'image' ? 'image/*' : 'audio/*';
    input.onchange = () => {
        const file = input.files[0];
        if (file) {
            socket.emit(type === 'image' ? 'image-upload' : 'audio-upload', file);
        }
    };
    input.click();
}

function contactCreators() {
    alert('Alvin Pieterson: https://wa.me/233533255746\nBlaise Dave: https://wa.me/50946904797');
}
