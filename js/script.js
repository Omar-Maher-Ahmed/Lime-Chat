function isLoggedIn() {
    return !!localStorage.getItem("token");
}

function startChat(roomId) {
    if (isLoggedIn()) {
        window.location.href = `/chat/${roomId}`;
    } else {
        // Save target path to return to after login
        localStorage.setItem("redirectAfterLogin", `/chat/${roomId}`);
        window.location.href = "/login.html";
    }
}