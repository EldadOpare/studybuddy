

// For the backend, I hosted it on Railway so this is the base URL
const API_BASE_URL = 'https://backend-production-80c2.up.railway.app/api';


// I built this helper to handle all my API requests in one place

// It made it easier to add auth headers and handle errors consistently
async function makeApiCall(endpoint, options = {}) {

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            }
        });

        const data = await response.json();

        if (!response.ok) {
            // I checked for both error and message properties since the backend uses 'error'
            throw new Error(data.error || data.message || 'Something went wrong');
        }

        return data;

    } catch (error) {
        throw error;
    }
}



async function loginUser(email, password) {
    return makeApiCall('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
    });
}


async function signupUser(userData) {
    return makeApiCall('/auth/signup', {
        method: 'POST',
        body: JSON.stringify(userData)
    });
}


// I stored the JWT token in localStorage so users stay logged in
function saveAuthToken(token) {
    localStorage.setItem('auth_token', token);
}


function getAuthToken() {
    return localStorage.getItem('auth_token');
}


function saveUserData(user) {
    localStorage.setItem('user_data', JSON.stringify(user));
}


function getUserData() {
    const data = localStorage.getItem('user_data');
    return data ? JSON.parse(data) : null;
}


function clearAuthToken() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
}


function isUserLoggedIn() {
    return !!getAuthToken();
}


function isAdmin() {
    const user = getUserData();
    return user && user.role === 'admin';
}


function logout() {
    clearAuthToken();
    window.location.href = '/pages/login.html';
}


// I used this at the top of every protected page to redirect unauthenticated users
function requireAuth() {
    if (!isUserLoggedIn()) {
        window.location.href = '/pages/login.html';
        return false;
    }
    return true;
}


function requireAdmin() {
    if (!requireAuth()) return false;

    if (!isAdmin()) {
        window.location.href = '/pages/dashboard.html';
        return false;
    }
    return true;
}


// I wanted the profile picture to show up everywhere automatically
// so I made this run on every page load
function loadUserProfilePicture() {
    const userData = getUserData();

    if (userData && userData.profilePicture) {
        const profilePics = document.querySelectorAll('.profile_picture');

        profilePics.forEach(pic => {
            if (pic.id !== 'profilePicture') {
                pic.src = userData.profilePicture;
            }
        });
    }
}


document.addEventListener('DOMContentLoaded', function() {
    loadUserProfilePicture();
});


// This wrapper automatically adds the auth token to requests
// saved me from repeating the same auth header code everywhere
async function makeAuthApiCall(endpoint, options = {}) {
    const token = getAuthToken();

    if (!token) {
        throw new Error('Not authenticated');
    }

    return makeApiCall(endpoint, {
        ...options,
        headers: {
            'Authorization': `Bearer ${token}`,
            ...options.headers
        }
    });
}



async function getCurrentUser() {
    return makeAuthApiCall('/auth/me');
}


async function updateUserProfile(updates) {
    return makeAuthApiCall('/users/profile', {
        method: 'PUT',
        body: JSON.stringify(updates)
    });
}


async function getUserQuizzes() {
    return makeAuthApiCall('/quizzes');
}

async function getQuizById(quizId) {
    return makeAuthApiCall(`/quizzes/${quizId}`);
}

async function createQuiz(quizData) {
    return makeAuthApiCall('/quizzes', {
        method: 'POST',
        body: JSON.stringify(quizData)
    });
}

async function deleteQuiz(quizId) {
    return makeAuthApiCall(`/quizzes/${quizId}`, {
        method: 'DELETE'
    });
}

// This calculates the score on the backend and stores the result
async function submitQuizResult(quizId, userAnswers, timeSpent) {
    return makeAuthApiCall(`/quizzes/${quizId}/submit`, {
        method: 'POST',
        body: JSON.stringify({ userAnswers, timeSpent })
    });
}

async function getQuizResults(quizId) {
    return makeAuthApiCall(`/quizzes/${quizId}/results`);
}



async function getUserNotes(folderId) {
    const queryParam = folderId ? `?folderId=${folderId}` : '';
    return makeAuthApiCall(`/notes${queryParam}`);
}

async function getNoteById(noteId) {
    return makeAuthApiCall(`/notes/${noteId}`);
}

async function createNote(noteData) {
    return makeAuthApiCall('/notes', {
        method: 'POST',
        body: JSON.stringify(noteData)
    });
}

async function updateNote(noteId, noteData) {
    return makeAuthApiCall(`/notes/${noteId}`, {
        method: 'PUT',
        body: JSON.stringify(noteData)
    });
}

async function deleteNote(noteId) {
    return makeAuthApiCall(`/notes/${noteId}`, {
        method: 'DELETE'
    });
}


async function getUserFolders() {
    return makeAuthApiCall('/folders');
}

async function createFolder(folderData) {
    return makeAuthApiCall('/folders', {
        method: 'POST',
        body: JSON.stringify(folderData)
    });
}


async function deleteFolder(folderId) {
    return makeAuthApiCall(`/folders/${folderId}`, {
        method: 'DELETE'
    });
}



async function getUserEvents() {
    return makeAuthApiCall('/events');
}

async function getEventById(eventId) {
    return makeAuthApiCall(`/events/${eventId}`);
}

async function createEvent(eventData) {
    return makeAuthApiCall('/events', {
        method: 'POST',
        body: JSON.stringify(eventData)
    });
}

async function updateEvent(eventId, eventData) {
    return makeAuthApiCall(`/events/${eventId}`, {
        method: 'PUT',
        body: JSON.stringify(eventData)
    });
}

async function deleteEvent(eventId) {
    return makeAuthApiCall(`/events/${eventId}`, {
        method: 'DELETE'
    });
}


// Admin API calls
async function getAllUsers() {
    return makeAuthApiCall('/admin/users');
}

async function getUserById(userId) {
    return makeAuthApiCall(`/admin/users/${userId}`);
}

async function deleteUser(userId) {
    return makeAuthApiCall(`/admin/users/${userId}`, {
        method: 'DELETE'
    });
}

async function getAdminStats() {
    return makeAuthApiCall('/admin/stats');
}

async function getRecentActivity() {
    return makeAuthApiCall('/admin/activity');
}

async function getUserStats() {
    return makeAuthApiCall('/users/stats');
}



// I needed folders to show up in the sidebar on every page
// so I made this reusable function
async function loadFoldersToSidebar() {
    try {
        const response = await getUserFolders();
        const folders = response.folders || [];

        const folderList = document.querySelector('.folder_list');
        if (!folderList) return;

        folderList.innerHTML = '';


        if (folders.length > 4) {
            folderList.style.maxHeight = '200px';
            folderList.style.overflowY = 'auto';
        } else {
            folderList.style.maxHeight = 'none';
            folderList.style.overflowY = 'visible';
        }


        folders.forEach(folder => {
            const folderItem = document.createElement('div');
            folderItem.className = 'folder_item';


            const colorMap = {
                'yellow': '#FFD63A',
                'orange': '#FFA955',
                'red': '#F75A5A',
                'navy': '#0D1164',
                'purple_dark': '#640D5F',
                'pink': '#EA2264',
                'peach': '#F78D60',
                'pink_light': '#F29AAE',
                'lavender': '#C47BE4',
                'purple': '#7132CA',
                'indigo': '#301CA0',
                'blue': '#4A90E2',
                'teal': '#00B7B5',
                'green': '#50C878',
                'mint': '#98D8C8',
                'slate': '#64748B',
                'brown': '#A0522D'
            };

            const folderColor = colorMap[folder.color] || '#FFA955';


            folderItem.innerHTML = `
                <div class="folder_content">
                    <svg class="folder_icon_svg" viewBox="0 0 24 24" fill="${folderColor}" stroke="${folderColor}" stroke-width="1">
                        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
                    </svg>
                    <span class="folder_name">${folder.name}</span>
                </div>
                <button class="folder_delete_btn" data-folder-id="${folder.id}">×</button>
            `;



            folderItem.addEventListener('click', function(e) {
                if (e.target.classList.contains('folder_delete_btn')) return;


                window.location.href = '/pages/my_notes.html?folder=' + folder.id;
            });


            const deleteBtn = folderItem.querySelector('.folder_delete_btn');
            deleteBtn.addEventListener('click', async function(e) {
                e.stopPropagation();

                showConfirmDialog(
                    'Delete Folder',
                    `Are you sure you want to delete "${folder.name}"? Notes in this folder will be moved to "Uncategorized".`,
                    async function() {
                        try {
                            await deleteFolder(folder.id);
                            showSuccess('Folder deleted successfully');
                            loadFoldersToSidebar();
                        } catch (error) {
                            showError('Failed to delete folder: ' + error.message);
                        }
                    }
                );
            });

            folderList.appendChild(folderItem);
        });

    } catch (error) {
    }
}



function openFolderModal() {
    const modal = document.getElementById('createFolderModal');
    if (modal) {
        modal.style.display = 'flex';
    }
}

function closeFolderModal() {
    const modal = document.getElementById('createFolderModal');
    if (modal) {
        modal.style.display = 'none';
        const form = document.getElementById('createFolderForm');
        if (form) form.reset();
    }
}

async function handleCreateFolder(e) {
    e.preventDefault();

    const folderNameInput = document.getElementById('folderName');
    const folderColorInput = document.querySelector('input[name="folderColor"]:checked');

    const folderName = folderNameInput.value.trim();
    const folderColor = folderColorInput ? folderColorInput.value : 'orange';

    if (!folderName) {
        return;
    }

    try {
        await createFolder({ name: folderName, color: folderColor });
        closeFolderModal();
        await loadFoldersToSidebar();
    } catch (error) {
    }
}
