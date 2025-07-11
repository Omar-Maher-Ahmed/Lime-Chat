

const API_BASE_URL = 'http://localhost:5000/api';
const WS_BASE_URL = 'ws://localhost:5001'; // Your WebSocket server address

const socket = new WebSocket(WS_BASE_URL);

const token = localStorage.getItem("token");
let user = {};

if (token) {
    try {
        const userData = jwt_decode(token);
        user = userData;
        console.log('User data:', userData);
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

document.addEventListener('DOMContentLoaded', () => {
    const roomNameElement = document.getElementById('roomName');
    const roomParticipantsElement = document.getElementById('roomParticipants');
    const chatMessagesElement = document.getElementById('chatMessages');
    const messageInput = document.getElementById('messageInput');
    const sendMessageBtn = document.getElementById('sendMessageBtn');

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

            const isSentByCurrentUser = message.sender._id === user.id;
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
        const roomData = await fetchRoomData();
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
        const messageText = messageInput.value.trim();
        if (messageText && socket.readyState === WebSocket.OPEN) {
            const messageData = {
                sender: user.id,
                room: mockBackendResponse._id,
                content: messageText,
                type: "text",
                token,
            };
            console.log('Sending message:', messageData);
            socket.send(JSON.stringify(messageData));
            messageInput.value = '';
        }
    });

    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessageBtn.click();
    });

    // Receive messages from server
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

    loadRoomData();
});
