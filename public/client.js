let users = [];
let loggedInUser = null;

function showSignUp() {
    document.getElementById("login-screen").style.display = "none";
    document.getElementById("sign-up-screen").style.display = "flex";
}

function showLogin() {
    document.getElementById("login-screen").style.display = "flex";
    document.getElementById("sign-up-screen").style.display = "none";
}

function signUp() {
    const username = document.getElementById("signup-username").value;
    const password = document.getElementById("signup-password").value;

    if (username && password) {
        users.push({ username, password });
        alert("Sign Up Successful!");
        showLogin();
    } else {
        alert("Please fill in all fields!");
    }
}

function login() {
    const username = document.getElementById("login-username").value;
    const password = document.getElementById("login-password").value;

    const user = users.find(
        (user) => user.username === username && user.password === password
    );

    if (user) {
        loggedInUser = user;
        document.getElementById("login-screen").style.display = "none";
        document.getElementById("chat-screen").style.display = "flex";
    } else {
        alert("Invalid credentials!");
    }
}

function sendMessage() {
    const input = document.getElementById("message-input");
    const message = input.value.trim();

    if (message) {
        // Append to messages
        input.value = "";
    }
}

function showProfile() {
    document.getElementById("chat-screen").style.display = "none";
    document.getElementById("profile-screen").style.display = "flex";
}

function logout() {
    loggedInUser = null;
    document.getElementById("profile-screen").style.display = "none";
    document.getElementById("login-screen").style.display = "flex";
}

function saveProfile() {
    const newUsername = document.getElementById("change-username").value;

    if (newUsername) {
        loggedInUser.username = newUsername;
        alert("Profile updated!");
    }
}
