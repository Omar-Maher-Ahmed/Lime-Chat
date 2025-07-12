// const API_BASE_URL = 'http://localhost:5000/api';
const API_BASE_URL = 'https://lime-chat-back-production.up.railway.app/api';
const WS_BASE_URL = 'https://lime-chat-back-production.up.railway.app/';
// const token = localStorage.getItem("token")

let allRooms = [];
let filteredRooms = [];
let user = {};

const loadingSection = document.getElementById('loadingSection');
const roomsContainer = document.getElementById('roomsContainer');
const searchInput = document.getElementById('searchInput');
const filterButtons = document.querySelectorAll('.filter-btn');
const groupRoomsGrid = document.getElementById('groupRoomsGrid');
const personalChatsGrid = document.getElementById('personalChatsGrid');
const logoutBtn = document.getElementById('logoutBtn');
const userName = document.getElementById("userName")

if (token) {
    try {
        const userData = jwt_decode(token);
        user = userData;

        userName.textContent = userData.name;
    } catch (error) {
        console.error('Error decoding token:', error);
    }
}

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
        console.error('Error fetching rooms:', { ...error });
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

async function getUsers() {
    try {
        const response = await fetch(`${API_BASE_URL}/user/values`, {
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

// Create room modal functionality
async function showCreateRoomModal() {
    let loading = false;
    let selectedParticipants = new Set();
    const users = await getUsers();
    console.log({ users });

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
            max-width: 600px;
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
                        box-sizing: border-box;
                    ">
                </div>
                
                <div style="margin-bottom: 1.5rem;">
                    <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Room Type</label>
                    <div style="display: flex; gap: 1rem;">
                        <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                            <input type="radio" name="roomType" value="group" checked onchange="toggleParticipantsSection()">
                            <span>Group Chat</span>
                        </label>
                        <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                            <input type="radio" name="roomType" value="personal" onchange="toggleParticipantsSection()">
                            <span>Personal Chat</span>
                        </label>
                    </div>
                </div>

                <div id="participantsSection" style="margin-bottom: 1.5rem;">
                    <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">
                        Select Participants
                        <span id="participantCount" style="color: #666; font-weight: normal;">(0 selected)</span>
                    </label>
                    
                    <!-- Search participants -->
                    <div style="margin-bottom: 1rem;">
                        <input type="text" id="participantSearch" placeholder="Search participants..." style="
                            width: 100%;
                            padding: 0.5rem;
                            border: 1px solid #e5e7eb;
                            border-radius: 8px;
                            font-size: 0.9rem;
                            outline: none;
                            box-sizing: border-box;
                        ">
                    </div>

                    <!-- Select All / Clear All buttons -->
                    <div style="margin-bottom: 1rem; display: flex; gap: 0.5rem;">
                        <button type="button" onclick="selectAllParticipants()" style="
                            background: #e5e7eb;
                            color: #374151;
                            border: none;
                            padding: 0.5rem 1rem;
                            border-radius: 6px;
                            cursor: pointer;
                            font-size: 0.8rem;
                        ">Select All</button>
                        <button type="button" onclick="clearAllParticipants()" style="
                            background: #fee2e2;
                            color: #dc2626;
                            border: none;
                            padding: 0.5rem 1rem;
                            border-radius: 6px;
                            cursor: pointer;
                            font-size: 0.8rem;
                        ">Clear All</button>
                    </div>

                    <!-- Participants list -->
                    <div id="participantsList" style="
                        max-height: 200px;
                        overflow-y: auto;
                        border: 1px solid #e5e7eb;
                        border-radius: 8px;
                        padding: 0.5rem;
                        background: #f9fafb;
                    ">
                        ${generateParticipantsList(users)}
                    </div>

                    <!-- Selected participants preview -->
                    <div id="selectedParticipants" style="
                        margin-top: 1rem;
                        padding: 0.75rem;
                        background: #f0f9ff;
                        border-radius: 8px;
                        border: 1px solid #bfdbfe;
                        display: none;
                    ">
                        <div style="font-weight: 600; margin-bottom: 0.5rem; color: #1e40af;">Selected Participants:</div>
                        <div id="selectedParticipantsList" style="display: flex; flex-wrap: wrap; gap: 0.5rem;"></div>
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

    // Initialize participant selection functionality
    initializeParticipantSelection();

    // Handle form submission
    document.getElementById('createRoomForm').addEventListener('submit', async (e) => {
        e.preventDefault();

        const roomName = document.getElementById('roomName').value;
        const roomType = document.querySelector('input[name="roomType"]:checked').value;
        const participantIds = Array.from(selectedParticipants);

        // Validation
        if (roomType === 'personal' && participantIds.length !== 1) {
            showError('Personal chat requires exactly one participant.');
            return;
        }

        if (roomType === 'group' && participantIds.length === 0) {
            showError('Group chat requires at least one participant.');
            return;
        }

        const roomData = {
            name: roomName,
            // isGroup: roomType === 'group',
            participants: participantIds
        };

        try {
            loading = true;
            const submitBtn = document.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Creating...';

            const newRoom = await createRoom(roomData);

            if (newRoom) {
                showSuccess(`Room "${roomName}" created successfully!`);
                closeModal();
                // Refresh the rooms list
                initApp();
            }
        } catch (error) {
            showError('Failed to create room. Please try again.');
            console.error('Error creating room:', error);
        } finally {
            loading = false;
            const submitBtn = document.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Create Room';
            }
        }
    });

    // Close modal when clicking outside
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    // Helper function to generate participants list HTML
    function generateParticipantsList(users) {
        if (!users || users.length === 0) {
            return '<div style="text-align: center; color: #666; padding: 1rem;">No participants available</div>';
        }

        return users.map(user => `
            <div class="participant-item" data-user-id="${user._id}" style="
                display: flex;
                align-items: center;
                gap: 0.75rem;
                padding: 0.5rem;
                border-radius: 6px;
                cursor: pointer;
                transition: background-color 0.2s;
                margin-bottom: 0.25rem;
            " onmouseover="this.style.backgroundColor='#e5e7eb'" onmouseout="this.style.backgroundColor='transparent'">
                <input type="checkbox" class="participant-checkbox" data-user-id="${user._id}" style="
                    width: 16px;
                    height: 16px;
                    cursor: pointer;
                ">
                <div style="
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-weight: 600;
                    font-size: 0.9rem;
                ">${user.name ? user.name.charAt(0).toUpperCase() : 'U'}</div>
                <div style="flex: 1;">
                    <div style="font-weight: 500; color: #333;">${user.name || 'Unknown User'}</div>
                    <div style="font-size: 0.8rem; color: #666;">${user.email || 'No email'}</div>
                </div>
                <div style="
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    background: ${user.isOnline ? '#10b981' : '#d1d5db'};
                " title="${user.isOnline ? 'Online' : 'Offline'}"></div>
            </div>
        `).join('');
    }

    // Initialize participant selection functionality
    function initializeParticipantSelection() {
        const participantSearch = document.getElementById('participantSearch');
        const participantsList = document.getElementById('participantsList');

        // Search functionality
        participantSearch.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const participantItems = participantsList.querySelectorAll('.participant-item');

            participantItems.forEach(item => {
                const username = item.querySelector('div:last-child div:first-child').textContent.toLowerCase();
                const email = item.querySelector('div:last-child div:last-child').textContent.toLowerCase();

                if (username.includes(searchTerm) || email.includes(searchTerm)) {
                    item.style.display = 'flex';
                } else {
                    item.style.display = 'none';
                }
            });
        });

        // Checkbox change handlers
        participantsList.addEventListener('change', (e) => {
            if (e.target.classList.contains('participant-checkbox')) {
                const userId = e.target.dataset.userId;
                const isChecked = e.target.checked;

                if (isChecked) {
                    selectedParticipants.add(userId);
                } else {
                    selectedParticipants.delete(userId);
                }

                updateSelectedParticipants();
            }
        });

        // Click on participant item to toggle checkbox
        participantsList.addEventListener('click', (e) => {
            const participantItem = e.target.closest('.participant-item');
            if (participantItem && !e.target.classList.contains('participant-checkbox')) {
                const checkbox = participantItem.querySelector('.participant-checkbox');
                checkbox.checked = !checkbox.checked;
                checkbox.dispatchEvent(new Event('change'));
            }
        });
    }

    // Update selected participants display
    function updateSelectedParticipants() {
        const count = selectedParticipants.size;
        const participantCount = document.getElementById('participantCount');
        const selectedParticipantsDiv = document.getElementById('selectedParticipants');
        const selectedParticipantsList = document.getElementById('selectedParticipantsList');

        participantCount.textContent = `(${count} selected)`;

        if (count > 0) {
            selectedParticipantsDiv.style.display = 'block';

            const selectedUsers = users.filter(user => selectedParticipants.has(user._id));
            selectedParticipantsList.innerHTML = selectedUsers.map(user => `
                <span style="
                    background: #dbeafe;
                    color: #1e40af;
                    padding: 0.25rem 0.5rem;
                    border-radius: 4px;
                    font-size: 0.8rem;
                    display: inline-flex;
                    align-items: center;
                    gap: 0.25rem;
                ">${user.name || 'Unknown'}
                    <button type="button" onclick="removeParticipant('${user._id}')" style="
                        background: none;
                        border: none;
                        color: #1e40af;
                        cursor: pointer;
                        padding: 0;
                        margin-left: 0.25rem;
                    ">×</button>
                </span>
            `).join('');
        } else {
            selectedParticipantsDiv.style.display = 'none';
        }
    }

    // Global functions for the modal
    window.toggleParticipantsSection = function () {
        const roomType = document.querySelector('input[name="roomType"]:checked').value;
        const participantsSection = document.getElementById('participantsSection');

        if (roomType === 'personal') {
            participantsSection.style.display = 'block';
            // Clear current selections and limit to 1
            selectedParticipants.clear();
            const checkboxes = document.querySelectorAll('.participant-checkbox');
            checkboxes.forEach(cb => cb.checked = false);
            updateSelectedParticipants();
        } else {
            participantsSection.style.display = 'block';
        }
    };

    window.selectAllParticipants = function () {
        const roomType = document.querySelector('input[name="roomType"]:checked').value;
        const checkboxes = document.querySelectorAll('.participant-checkbox');

        if (roomType === 'personal') {
            // For personal chat, select only the first visible participant
            const visibleCheckboxes = Array.from(checkboxes).filter(cb =>
                cb.closest('.participant-item').style.display !== 'none'
            );
            if (visibleCheckboxes.length > 0) {
                selectedParticipants.clear();
                checkboxes.forEach(cb => cb.checked = false);
                visibleCheckboxes[0].checked = true;
                selectedParticipants.add(visibleCheckboxes[0].dataset.userId);
            }
        } else {
            // For group chat, select all visible participants
            checkboxes.forEach(checkbox => {
                if (checkbox.closest('.participant-item').style.display !== 'none') {
                    checkbox.checked = true;
                    selectedParticipants.add(checkbox.dataset.userId);
                }
            });
        }

        updateSelectedParticipants();
    };

    window.clearAllParticipants = function () {
        selectedParticipants.clear();
        const checkboxes = document.querySelectorAll('.participant-checkbox');
        checkboxes.forEach(cb => cb.checked = false);
        updateSelectedParticipants();
    };

    window.removeParticipant = function (userId) {
        selectedParticipants.delete(userId);
        const checkbox = document.querySelector(`input[data-user-id="${userId}"]`);
        if (checkbox) {
            checkbox.checked = false;
        }
        updateSelectedParticipants();
    };

    // Add constraint for personal chat (max 1 participant)
    const originalUpdateSelected = updateSelectedParticipants;
    updateSelectedParticipants = function () {
        const roomType = document.querySelector('input[name="roomType"]:checked').value;

        if (roomType === 'personal' && selectedParticipants.size > 1) {
            // Keep only the last selected participant
            const participantsArray = Array.from(selectedParticipants);
            const lastSelected = participantsArray[participantsArray.length - 1];

            selectedParticipants.clear();
            selectedParticipants.add(lastSelected);

            // Update checkboxes
            const checkboxes = document.querySelectorAll('.participant-checkbox');
            checkboxes.forEach(cb => {
                cb.checked = cb.dataset.userId === lastSelected;
            });
        }

        originalUpdateSelected();
    };
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

logoutBtn.addEventListener('click', function () {
    localStorage.removeItem('token');
    logoutBtn.disabled = true;
    window.location.href = '/';
})
