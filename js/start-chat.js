const API_BASE_URL = 'http://localhost:5000/api';

const token = localStorage.getItem("token")

const roomsData = {
    groupRooms: [
        {
            id: 1,
            name: "🎮 Gaming Hub",
            description: "Discuss the latest games, share tips, and find gaming buddies",
            members: 2847,
            type: "group",
            active: true,
            lastActivity: "2 min ago",
            avatars: ["G", "M", "K", "J"]
        },
        {
            id: 2,
            name: "📚 Book Club",
            description: "Monthly book discussions and reading recommendations",
            members: 1234,
            type: "group",
            active: true,
            lastActivity: "5 min ago",
            avatars: ["B", "L", "R", "S"]
        },
        {
            id: 3,
            name: "🍳 Food & Recipes",
            description: "Share your favorite recipes and cooking adventures",
            members: 5621,
            type: "group",
            active: true,
            lastActivity: "1 min ago",
            avatars: ["F", "C", "T", "D"]
        },
        {
            id: 4,
            name: "🎵 Music Lovers",
            description: "Discover new music and discuss your favorite artists",
            members: 3456,
            type: "group",
            active: false,
            lastActivity: "1 hour ago",
            avatars: ["M", "A", "N", "P"]
        },
        {
            id: 5,
            name: "🏃‍♂️ Fitness & Health",
            description: "Workout tips, nutrition advice, and motivation",
            members: 2198,
            type: "group",
            active: true,
            lastActivity: "8 min ago",
            avatars: ["H", "F", "W", "Y"]
        },
        {
            id: 6,
            name: "💼 Tech Talk",
            description: "Latest tech news, programming discussions, and career advice",
            members: 4567,
            type: "group",
            active: true,
            lastActivity: "3 min ago",
            avatars: ["T", "E", "C", "H"]
        },
        {
            id: 7,
            name: "🎨 Creative Corner",
            description: "Share your art, get feedback, and collaborate on projects",
            members: 1876,
            type: "group",
            active: false,
            lastActivity: "2 hours ago",
            avatars: ["A", "R", "T", "I"]
        },
        {
            id: 8,
            name: "🌍 Travel Tales",
            description: "Share travel stories, tips, and plan adventures together",
            members: 3210,
            type: "group",
            active: true,
            lastActivity: "12 min ago",
            avatars: ["T", "R", "V", "L"]
        }
    ],
    personalChats: [
        {
            id: 9,
            name: "👨‍👩‍👧‍👦 Family Group",
            description: "Stay connected with family members",
            members: 8,
            type: "personal",
            active: true,
            lastActivity: "Just now",
            avatars: ["M", "D", "S", "B"]
        },
        {
            id: 10,
            name: "💼 Work Team",
            description: "Project discussions and team updates",
            members: 12,
            type: "personal",
            active: true,
            lastActivity: "4 min ago",
            avatars: ["W", "T", "P", "L"]
        },
        {
            id: 11,
            name: "🎓 Study Group",
            description: "Exam prep and assignment help",
            members: 6,
            type: "personal",
            active: false,
            lastActivity: "30 min ago",
            avatars: ["S", "T", "U", "D"]
        },
        {
            id: 12,
            name: "🏠 Roommates",
            description: "House coordination and social chat",
            members: 4,
            type: "personal",
            active: true,
            lastActivity: "7 min ago",
            avatars: ["R", "O", "O", "M"]
        },
        {
            id: 13,
            name: "🎉 Party Planning",
            description: "Organizing the birthday surprise",
            members: 15,
            type: "personal",
            active: true,
            lastActivity: "2 min ago",
            avatars: ["P", "A", "R", "T"]
        },
        {
            id: 14,
            name: "⚽ Soccer Squad",
            description: "Weekend game coordination",
            members: 11,
            type: "personal",
            active: false,
            lastActivity: "1 hour ago",
            avatars: ["S", "O", "C", "R"]
        }
    ]
};

// let allRooms = [...roomsData.groupRooms, ...roomsData.personalChats];
// let filteredRooms = allRooms;

let allRooms = [];
let filteredRooms = [];
let currentUser = null;

const loadingSection = document.getElementById('loadingSection');
const roomsContainer = document.getElementById('roomsContainer');
const searchInput = document.getElementById('searchInput');
const filterButtons = document.querySelectorAll('.filter-btn');
const groupRoomsGrid = document.getElementById('groupRoomsGrid');
const personalChatsGrid = document.getElementById('personalChatsGrid');

async function fetchRooms() {
    try {
        const response = await fetch(`${API_BASE_URL}/room`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching rooms:', error);
        showError('Failed to load rooms. Please try again.');
        return [];
    }
}

async function createRoom(roomData) {
    try {
        const response = await fetch(`${API_BASE_URL}/room`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(roomData)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const newRoom = await response.json();
        return newRoom;
    } catch (error) {
        console.error('Error creating room:', error);
        showError('Failed to create room. Please try again.');
        return null;
    }
}

async function joinRoom(roomId) {
    try {
        const response = await fetch(`${API_BASE_URL}/room/${roomId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Error joining room:', error);
        showError('Failed to join room. Please try again.');
        return null;
    }
}

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

    setTimeout(() => {
        errorDiv.remove();
    }, 5000);
}

function showSuccess(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: #32d74b;
                color: white;
                padding: 1rem 1.5rem;
                border-radius: 10px;
                z-index: 1000;
                animation: slideInRight 0.3s ease-out;
            `;
    successDiv.textContent = message;
    document.body.appendChild(successDiv);

    setTimeout(() => {
        successDiv.remove();
    }, 3000);
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now - date;
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
}

function generateAvatar(name) {
    if (!name) return 'R';
    return name.charAt(0).toUpperCase();
}

function generateAvatars(participants) {
    if (!participants || participants.length === 0) return ['R'];
    return participants.slice(0, 4).map(participant => {
        if (typeof participant === 'string') return generateAvatar(participant);
        return generateAvatar(participant.name || participant.username || participant.email);
    });
}

function transformRoomData(rooms) {
    return rooms.map(room => ({
        id: room._id,
        name: room.name || (room.isGroup ? 'Unnamed Group' : 'Personal Chat'),
        description: room.isGroup ? 'Group chat room' : 'Personal conversation',
        members: room.participants ? room.participants.length : 0,
        type: room.isGroup ? 'group' : 'personal',
        active: Math.random() > 0.3, // Simulate active status - you can implement real logic
        lastActivity: formatDate(room.updatedAt),
        avatars: generateAvatars(room.participants),
        createdBy: room.createdBy,
        createdAt: room.createdAt,
        updatedAt: room.updatedAt,
        participants: room.participants
    }));
}
function createRoomCard(room) {
    const avatarElements = room.avatars.map(avatar =>
        `<div class="avatar">${avatar}</div>`
    ).join('');

    return `
                <div class="room-card" data-room-id="${room.id}" data-type="${room.type}" data-active="${room.active}">
                    <div class="room-header">
                        <div class="room-info">
                            <div class="room-type ${room.type}">${room.type === 'group' ? 'Group' : 'Personal'}</div>
                            <div class="room-name">${room.name}</div>
                            <div class="room-description">${room.description}</div>
                        </div>
                    </div>
                    <div class="room-stats">
                        <div class="room-members">
                            👥 ${room.members} ${room.members === 1 ? 'member' : 'members'}
                        </div>
                        <div class="room-activity">
                            ${room.active ? '<div class="online-indicator"></div>' : ''}
                            ${room.lastActivity}
                        </div>
                    </div>
                    <div class="room-avatars">
                        ${avatarElements}
                    </div>
                </div>
            `;
}

// Render rooms
function renderRooms() {
    const groupRooms = filteredRooms.filter(room => room.type === 'group');
    const personalChats = filteredRooms.filter(room => room.type === 'personal');

    groupRoomsGrid.innerHTML = groupRooms.map(createRoomCard).join('');
    personalChatsGrid.innerHTML = personalChats.map(createRoomCard).join('');

    // Show/hide sections based on content
    document.getElementById('groupRooms').style.display = groupRooms.length > 0 ? 'block' : 'none';
    document.getElementById('personalChats').style.display = personalChats.length > 0 ? 'block' : 'none';

    // Add click handlers to room cards
    document.querySelectorAll('.room-card').forEach(card => {
        card.addEventListener('click', async () => {
            const roomId = card.dataset.roomId;
            const room = allRooms.find(r => r.id === roomId);

            // Show loading state
            card.style.opacity = '0.7';
            card.style.pointerEvents = 'none';

            // const result = await joinRoom(roomId);
            window.location.href = `rooms.html?room=${roomId}`;

            // if (result) {
            //     showSuccess(`Successfully joined ${room.name}!`);
            //     // Redirect to chat interface
            // } else {
            //     // Reset card state on error
            //     card.style.opacity = '1';
            //     card.style.pointerEvents = 'auto';
            // }
        });
    });
}

// Filter rooms
function filterRooms(filterType) {
    switch (filterType) {
        case 'all':
            filteredRooms = allRooms;
            break;
        case 'group':
            filteredRooms = allRooms.filter(room => room.type === 'group');
            break;
        case 'personal':
            filteredRooms = allRooms.filter(room => room.type === 'personal');
            break;
        case 'active':
            filteredRooms = allRooms.filter(room => room.active);
            break;
    }
    renderRooms();
}

// Search rooms
function searchRooms(searchTerm) {
    if (!searchTerm.trim()) {
        renderRooms();
        return;
    }

    const searchLower = searchTerm.toLowerCase();
    const searchResults = filteredRooms.filter(room =>
        room.name.toLowerCase().includes(searchLower) ||
        room.description.toLowerCase().includes(searchLower)
    );

    const groupRooms = searchResults.filter(room => room.type === 'group');
    const personalChats = searchResults.filter(room => room.type === 'personal');

    groupRoomsGrid.innerHTML = groupRooms.map(createRoomCard).join('');
    personalChatsGrid.innerHTML = personalChats.map(createRoomCard).join('');

    document.getElementById('groupRooms').style.display = groupRooms.length > 0 ? 'block' : 'none';
    document.getElementById('personalChats').style.display = personalChats.length > 0 ? 'block' : 'none';

    // Add click handlers
    document.querySelectorAll('.room-card').forEach(card => {
        card.addEventListener('click', () => {
            const roomId = card.dataset.roomId;
            const room = allRooms.find(r => r.id == roomId);
            alert(`Joining ${room.name}...`);
        });
    });
}

async function initApp() {
    try {
        // Show loading
        loadingSection.style.display = 'block';
        roomsContainer.style.display = 'none';

        // Fetch rooms from backend
        const roomsFromBackend = await fetchRooms();

        // Transform and set room data
        allRooms = transformRoomData(roomsFromBackend);
        filteredRooms = allRooms;

        // Hide loading and show rooms
        loadingSection.style.display = 'none';
        roomsContainer.style.display = 'block';

        // Render rooms
        renderRooms();

    } catch (error) {
        console.error('Error initializing app:', error);
        loadingSection.innerHTML = `
                    <div style="text-align: center; padding: 2rem; color: white;">
                        <h3>Failed to load rooms</h3>
                        <p>Please check your connection and try again.</p>
                        <button onclick="initApp()" style="
                            background: #32d74b;
                            color: white;
                            border: none;
                            padding: 0.75rem 1.5rem;
                            border-radius: 25px;
                            cursor: pointer;
                            margin-top: 1rem;
                        ">Retry</button>
                    </div>
                `;
    }
}

// Create room modal functionality
function showCreateRoomModal() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 1000;
            `;

    modal.innerHTML = `
                <div class="modal-content" style="
                    background: white;
                    padding: 2rem;
                    border-radius: 20px;
                    max-width: 500px;
                    width: 90%;
                    max-height: 90vh;
                    overflow-y: auto;
                ">
                    <h2 style="margin-bottom: 1.5rem; color: #333;">Create New Room</h2>
                    <form id="createRoomForm">
                        <div style="margin-bottom: 1rem;">
                            <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Room Name</label>
                            <input type="text" id="roomName" required style="
                                width: 100%;
                                padding: 0.75rem;
                                border: 2px solid #e5e7eb;
                                border-radius: 10px;
                                font-size: 1rem;
                                outline: none;
                            ">
                        </div>
                        <div style="margin-bottom: 1.5rem;">
                            <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Room Type</label>
                            <div style="display: flex; gap: 1rem;">
                                <label style="display: flex; align-items: center; gap: 0.5rem;">
                                    <input type="radio" name="roomType" value="group" checked>
                                    <span>Group Chat</span>
                                </label>
                                <label style="display: flex; align-items: center; gap: 0.5rem;">
                                    <input type="radio" name="roomType" value="personal">
                                    <span>Personal Chat</span>
                                </label>
                            </div>
                        </div>
                        <div style="display: flex; gap: 1rem; justify-content: flex-end;">
                            <button type="button" onclick="closeModal()" style="
                                background: #6b7280;
                                color: white;
                                border: none;
                                padding: 0.75rem 1.5rem;
                                border-radius: 10px;
                                cursor: pointer;
                            ">Cancel</button>
                            <button type="submit" style="
                                background: #32d74b;
                                color: white;
                                border: none;
                                padding: 0.75rem 1.5rem;
                                border-radius: 10px;
                                cursor: pointer;
                            ">Create Room</button>
                        </div>
                    </form>
                </div>
            `;

    document.body.appendChild(modal);

    // Handle form submission
    document.getElementById('createRoomForm').addEventListener('submit', async (e) => {
        e.preventDefault();

        const roomName = document.getElementById('roomName').value;
        const roomType = document.querySelector('input[name="roomType"]:checked').value;

        const roomData = {
            name: roomName,
            isGroup: roomType === 'group'
        };

        const newRoom = await createRoom(roomData);

        if (newRoom) {
            showSuccess(`Room "${roomName}" created successfully!`);
            closeModal();
            // Refresh the rooms list
            initApp();
        }
    });

    // Close modal when clicking outside
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });
}

function closeModal() {
    const modal = document.querySelector('.modal-overlay');
    if (modal) {
        modal.remove();
    }
}

filterButtons.forEach(button => {
    button.addEventListener('click', () => {
        filterButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        filterRooms(button.dataset.filter);
    });
});

searchInput.addEventListener('input', (e) => {
    searchRooms(e.target.value);
});

document.querySelector('.create-room-btn').addEventListener('click', () => {
    showCreateRoomModal();
});

// Initialize the application when page loads
document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

// Auto-refresh rooms every 30 seconds
// setInterval(() => {
//     initApp();
// }, 30000);
