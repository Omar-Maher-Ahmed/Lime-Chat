

const API_BASE_URL = 'http://localhost:5000/api';
const WS_BASE_URL = 'http://localhost:5001'; // Your WebSocket server address

const socket = io(WS_BASE_URL, {
    autoConnect: true,
    transports: ['websocket', 'polling']
});

const token = localStorage.getItem("token");
let user = {};
let roomData = {}

if (token) {
    try {
        me()
    } catch (error) {
        console.error('Error decoding token:', error);
    }
}


const urlParams = new URLSearchParams(window.location.search);
const roomId = urlParams.get('room');

let mockBackendResponse = {};

function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #ef4444;
    color: white;
    padding: 1rem 1.5rem;
    border-radius: 10px;
    z-index: 1000;
    animation: slideInRight 0.3s ease-out;
    `;
    errorDiv.textContent = message;
    document.body.appendChild(errorDiv);
    setTimeout(() => errorDiv.remove(), 5000);
}

async function fetchRoomData() {
    try {
        const response = await fetch(`${API_BASE_URL}/room/${roomId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error('Error fetching room:', error);
        showError('Failed to load room. Please try again.');
        return null;
    }
}

let typingTimer;
let isTyping = false;

// document.addEventListener('DOMContentLoaded', () => {
const roomNameElement = document.getElementById('roomName');
const roomParticipantsElement = document.getElementById('roomParticipants');
const chatMessagesElement = document.getElementById('chatMessages');
const messageInput = document.getElementById('messageInput');
const sendMessageBtn = document.getElementById('sendMessageBtn');
const connectionStatus = document.getElementById('connectionStatus');
const statusIndicator = document.getElementById('statusIndicator');
const typingIndicator = document.getElementById('typingIndicator');
const userData = document.getElementById('userData');


async function me() {
    const response = await fetch(`${API_BASE_URL}/user/me`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    user = await response.json();
    userData.innerHTML = user.name + " " + user.email;
}

// Render messages
function renderMessages(messages) {
    chatMessagesElement.innerHTML = '';
    if (!messages || messages.length === 0) {
        chatMessagesElement.innerHTML = '<div class="text-center text-gray-400 mt-4">No messages yet. Start the conversation!</div>';
        return;
    }

    messages.forEach(message => {
        const messageBubble = document.createElement('div');
        messageBubble.classList.add('message-bubble');

        const isSentByCurrentUser = message.sender._id === user._id;
        messageBubble.classList.add(isSentByCurrentUser ? 'message-sent' : 'message-received');

        if (!isSentByCurrentUser) {
            const senderName = document.createElement('div');
            senderName.classList.add('message-sender-name');
            senderName.textContent = message.sender.name;
            messageBubble.appendChild(senderName);
        }

        const messageContent = document.createElement('div');
        messageContent.textContent = message.content;
        messageBubble.appendChild(messageContent);
        chatMessagesElement.appendChild(messageBubble);
    });

    chatMessagesElement.scrollTop = chatMessagesElement.scrollHeight;
}

async function loadRoomData() {
    roomData = await fetchRoomData();
    mockBackendResponse = roomData;

    if (roomData) {
        roomNameElement.textContent = roomData.name;
        const participantNames = roomData.participants.map(p => p.name).join(', ');
        roomParticipantsElement.textContent = `Participants: ${participantNames}`;
        renderMessages(roomData.messages);
    } else {
        roomNameElement.textContent = 'Room Not Found';
        roomParticipantsElement.textContent = 'Check room ID.';
        chatMessagesElement.innerHTML = '<div class="text-center text-red-400 mt-4">Failed to load room data.</div>';
    }
}

sendMessageBtn.addEventListener('click', () => {
    sendMessage()
});

messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessageBtn.click();
});

socket.on('connect', () => {
    console.log('Connected to server');
    updateConnectionStatus('Connected', '#4CAF50');
    joinRoom()
});

socket.on('disconnect', () => {
    console.log('Disconnected from server');
    updateConnectionStatus('Disconnected', '#f44336');
});

socket.on('connect_error', (error) => {
    console.error('Connection error:', error);
    updateConnectionStatus('Connection Error', '#ff9800');
});

// Message events
socket.on('message', (data) => {
    addMessage(data, data.userId === socket.id);
    // addNewMessageWithAnimation(data);
});

socket.on('roomMessage', (data) => {
    // addRoomMessage(data, data.userId === socket.id);
    addNewMessageWithAnimation(data);
});

// Typing events
socket.on('userTyping', (data) => {
    handleTypingIndicator(data);
});

function joinRoom() {
    socket.emit('joinRoom', roomId);
}

function leaveChat() {
    socket.disconnect();
    window.location.href = '/chat.html';
}

function sendMessage() {
    const message = messageInput.value.trim();
    if (!message) return;

    socket.emit('roomMessage', {
        content: message,
        room: roomId,
        sender: user._id
    });


    messageInput.value = '';
    stopTyping();
}

function addMessage(data, isOwnMessage) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isOwnMessage ? 'own' : 'other'}`;

    messageDiv.innerHTML = `
                <div class="message-header">${data.username} • ${formatTime(data.timestamp)}</div>
                <div class="message-content">${escapeHtml(data.message)}</div>
            `;

    chatMessagesElement.appendChild(messageDiv);
    scrollToBottom();
}

function findParticipantById(participantId) {
    return roomData?.participants?.find(p => p._id === participantId)?.name || "Unknown";
}

function addNewMessage(message) {
    console.log(message);

    // If this is the first message, clear the "no messages" placeholder
    if (chatMessagesElement.innerHTML.includes('No messages yet')) {
        chatMessagesElement.innerHTML = '';
    }

    const messageBubble = document.createElement('div');
    messageBubble.classList.add('message-bubble');

    const isSentByCurrentUser = message.sender._id === user._id;
    messageBubble.classList.add(isSentByCurrentUser ? 'message-sent' : 'message-received');

    if (!isSentByCurrentUser) {
        const senderName = document.createElement('div');
        senderName.classList.add('message-sender-name');
        senderName.textContent = findParticipantById(message.sender);
        messageBubble.appendChild(senderName);
    }

    const messageContent = document.createElement('div');
    messageContent.textContent = message.content;
    messageBubble.appendChild(messageContent);

    // Add the message to the chat
    chatMessagesElement.appendChild(messageBubble);

    // Scroll to bottom to show the new message
    chatMessagesElement.scrollTop = chatMessagesElement.scrollHeight;
}

// Alternative version with animation
function addNewMessageWithAnimation(message) {
    console.log(message);

    // If this is the first message, clear the "no messages" placeholder
    if (chatMessagesElement.innerHTML.includes('No messages yet')) {
        chatMessagesElement.innerHTML = '';
    }

    const messageBubble = document.createElement('div');
    messageBubble.classList.add('message-bubble');

    const isSentByCurrentUser = message.sender === user._id;
    messageBubble.classList.add(isSentByCurrentUser ? 'message-sent' : 'message-received');

    if (!isSentByCurrentUser) {
        const senderName = document.createElement('div');
        senderName.classList.add('message-sender-name');
        senderName.textContent = findParticipantById(message.sender);
        messageBubble.appendChild(senderName);
    }

    const messageContent = document.createElement('div');
    messageContent.textContent = message.message;
    messageBubble.appendChild(messageContent);

    // Add fade-in animation
    messageBubble.style.opacity = '0';
    messageBubble.style.transform = 'translateY(20px)';
    messageBubble.style.transition = 'opacity 0.3s ease, transform 0.3s ease';

    chatMessagesElement.appendChild(messageBubble);

    // Trigger animation
    setTimeout(() => {
        messageBubble.style.opacity = '1';
        messageBubble.style.transform = 'translateY(0)';
    }, 10);

    // Scroll to bottom to show the new message
    chatMessagesElement.scrollTop = chatMessagesElement.scrollHeight;
}

// Usage examples:
// addNewMessage(newMessage);
// addNewMessageWithAnimation(newMessage);

function addRoomMessage(data, isOwnMessage) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isOwnMessage ? 'own' : 'other'}`;

    messageDiv.innerHTML = `
                <div class="message-header">${data.username} in ${data.room} • ${formatTime(data.timestamp)}</div>
                <div class="message-content">${escapeHtml(data.message)}</div>
            `;

    chatMessagesElement.appendChild(messageDiv);
    scrollToBottom();
}

function handleTypingIndicator(data) {
    const typingId = `typing-${data.userId}`;
    let typingElement = document.getElementById(typingId);

    if (data.isTyping) {
        if (!typingElement) {
            typingElement = document.createElement('div');
            typingElement.id = typingId;
            typingElement.className = 'typing-indicator';
            typingElement.textContent = `${data.username} is typing...`;
            chatMessagesElement.appendChild(typingElement);
            scrollToBottom();
        }
    } else {
        if (typingElement) {
            typingElement.remove();
        }
    }
}

function scrollToBottom() {
    chatMessagesElement.scrollTop = chatMessagesElement.scrollHeight;
}

function formatTime(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function updateConnectionStatus(status, color) {
    connectionStatus.textContent = status;
    statusIndicator.style.backgroundColor = color;
}

function stopTyping() {
    if (isTyping) {
        isTyping = false;
        socket.emit('typing', { isTyping: false, username: user.name, room: roomId });
    }
    typingIndicator.style.display = 'none';
}

loadRoomData();
// });

function handleKeyPress(event) {
    if (event.key === 'Enter') {
        sendMessage();
    } else {
        handleTyping();
    }
};

function handleTyping() {
    if (!isTyping) {
        isTyping = true;
        typingIndicator.style.display = 'block';
        socket.emit('typing', { isTyping: true, username: user.name, room: roomId });
    }

    clearTimeout(typingTimer);
    typingTimer = setTimeout(() => {
        stopTyping();
    }, 1000);
}
/*
  socket.addEventListener('message', (event) => {
        try {
            const message = JSON.parse(event.data);
            if (message.room === roomId) {
                mockBackendResponse.messages.push(message);
                renderMessages(mockBackendResponse.messages);
            }
        } catch (err) {
            console.warn('Invalid message received:', event.data);
        }
    });

    socket.addEventListener('open', () => {
        console.log('✅ Connected to WebSocket');
    });

    socket.addEventListener('error', (err) => {
        console.error('WebSocket error:', err);
        showError('WebSocket connection error.');
    });

    socket.addEventListener('close', () => {
        console.warn('WebSocket connection closed');
        showError('Disconnected from chat server.');
    });

    */