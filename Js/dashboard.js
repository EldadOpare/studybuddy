

if (!requireAuth()) {

}

let currentDate = new Date();
let selectedDate = new Date();


const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

let userEvents = [];


document.addEventListener('DOMContentLoaded', async function() {

    await loadUserInfo();
    await loadUserStats();

    await loadFoldersToSidebar();
    await loadRecentMaterials();

    await loadCalendarEvents();

    initializeCalendar();
    setupEventListeners();

    displayTodayEvents();
});


async function loadUserInfo() {
    try {
        const currentUserData = getUserData();

        if (currentUserData && currentUserData.firstName) {

            const welcomeText = document.querySelector('.welcome_text');

            if (welcomeText) {
                welcomeText.textContent = `Welcome back, ${currentUserData.firstName}!`;
            }

            const profilePicture = document.querySelector('.profile_picture');

            if (profilePicture && currentUserData.profilePicture) {
                profilePicture.src = currentUserData.profilePicture;
            }

        } else {
            console.log('No user data found, using default welcome message');
        }

    } catch (loadingError) {
        console.error('Error loading user info:', loadingError);
    }
}


async function loadUserStats() {
    try {
        const serverResponse = await getUserStats();

        const stats = serverResponse.stats || {};

        if (stats.materialsCount !== undefined) {
            const materialsElement = document.querySelector('.materials_stat .stat_number');
            if (materialsElement) materialsElement.textContent = stats.materialsCount;
        }

        if (stats.quizzesTaken !== undefined) {
            const quizzesElement = document.querySelector('.quizzes_stat .stat_number');
            if (quizzesElement) quizzesElement.textContent = stats.quizzesTaken;
        }


        if (stats.averageScore !== undefined) {
            const avgElement = document.querySelector('.average_stat .stat_number');
            if (avgElement) avgElement.textContent = Math.round(stats.averageScore) + '%';
        }

    } catch (statsError) {
        console.error('Error loading user stats:', statsError);
    }
}


async function loadRecentMaterials() {
    try {
        const [notesResponse, quizzesResponse] = await Promise.all([
            getUserNotes(),
            getUserQuizzes()
        ]);

        const allNotes = notesResponse.notes || [];
        const allQuizzes = quizzesResponse.quizzes || [];


        const combinedMaterials = [
            ...allNotes.map(note => ({
                id: note.id,
                type: 'note',
                name: note.title,
                date: new Date(note.updated_at || note.created_at),
                size: calculateNoteSize(note.content)
            })),
            ...allQuizzes.map(quiz => ({
                id: quiz.id,
                type: 'quiz',
                name: quiz.title,
                date: new Date(quiz.created_at),
                size: `${quiz.question_count || 0} questions`
            }))
        ].sort((a, b) => b.date - a.date);

        displayMaterials(combinedMaterials);

    } catch (materialsError) {
        console.error('Error loading materials:', materialsError);
    }
}


function displayMaterials(materialsList) {
    const tableBody = document.querySelector('.materials_table_body');
    if (!tableBody) return;

    tableBody.innerHTML = '';

    if (materialsList.length === 0) {
        tableBody.innerHTML = '<p style="padding: 20px; text-align: center; color: #666;">No materials yet. Create your first note or quiz!</p>';
        return;
    }

    materialsList.slice(0, 10).forEach((material, index) => {
        const row = document.createElement('div');
        row.className = 'table_row';

        row.innerHTML = `
            <div class="table_cell row_number">
                <div class="material_icon ${material.type}_icon"></div>
            </div>
            <div class="table_cell material_name_cell">
                <span class="material_name">${material.name}</span>
            </div>
            <div class="table_cell material_type_cell">
                <span class="type_badge ${material.type}_badge">${material.type.toUpperCase()}</span>
            </div>
            <div class="table_cell material_date_cell">
                <span class="material_date">${formatDate(material.date)}</span>
            </div>
        `;

        row.addEventListener('click', function() {
            if (material.type === 'note') {
                window.location.href = '/pages/note_editor.html?id=' + material.id;
            } else if (material.type === 'quiz') {
                window.location.href = '/pages/take_quiz.html?id=' + material.id;
            }
        });

        tableBody.appendChild(row);
    });
}


function calculateNoteSize(noteContent) {
    if (!noteContent) return '0 KB';

    const totalBytes = new Blob([noteContent]).size;
    return totalBytes < 1024 ? totalBytes + ' B' : (totalBytes / 1024).toFixed(1) + ' KB';
}


function formatDate(dateToFormat) {

    if (!dateToFormat || isNaN(dateToFormat.getTime())) {
        return 'Recently';
    }

    const currentTime = new Date();

    const timeDifference = currentTime - dateToFormat;
    const daysPassed = Math.floor(timeDifference / (1000 * 60 * 60 * 24));

    if (daysPassed === 0) return 'Today';
    if (daysPassed === 1) return 'Yesterday';

    if (daysPassed < 7) return daysPassed + ' days ago';

    return dateToFormat.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}


async function loadCalendarEvents() {
    try {
        const eventsResponse = await getUserEvents();

        userEvents = eventsResponse.events || [];

    } catch (eventsError) {
        console.error('Error loading events:', eventsError);
        userEvents = [];
    }
}


function displayTodayEvents() {
    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);


    const upcomingEventsList = userEvents
        .filter(event => {
            const eventDate = new Date(event.date);
            eventDate.setHours(0, 0, 0, 0);
            return eventDate.getTime() >= todayDate.getTime();
        })
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .slice(0, 5);

    const upcomingList = document.querySelector('.upcoming_list');
    if (!upcomingList) return;

    upcomingList.innerHTML = '';

    if (upcomingEventsList.length === 0) {
        upcomingList.innerHTML = '<p style="color: #86868B; font-size: 14px; padding: 12px;">No upcoming events</p>';
        return;
    }

    const monthShortNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];


    upcomingEventsList.forEach(evt => {
        const eventDate = new Date(evt.date);

        const dayNumber = eventDate.getDate();
        const monthAbbr = monthShortNames[eventDate.getMonth()];

        const eventItem = document.createElement('div');
        eventItem.className = 'upcoming_item';
        eventItem.dataset.eventId = evt.id;

        const dateDiv = document.createElement('div');
        dateDiv.className = 'upcoming_date';
        dateDiv.innerHTML = `
            <div class="date_day">${dayNumber}</div>
            <div class="date_month">${monthAbbr}</div>
        `;

        const detailsDiv = document.createElement('div');
        detailsDiv.className = 'upcoming_details';

        const taskDiv = document.createElement('div');
        taskDiv.className = 'upcoming_task';
        taskDiv.textContent = evt.title;

        const eventCategory = evt.type || 'task';

        let categoryClass = 'lessons_type';
        if (eventCategory === 'assignment' || eventCategory === 'assignments') {
            categoryClass = 'assignments_type';
        } else if (eventCategory === 'test' || eventCategory === 'exam') {
            categoryClass = 'test_type';
        }

        const typeDiv = document.createElement('div');
        typeDiv.className = `upcoming_type ${categoryClass}`;
        typeDiv.textContent = eventCategory.charAt(0).toUpperCase() + eventCategory.slice(1);

        detailsDiv.appendChild(taskDiv);
        detailsDiv.appendChild(typeDiv);

        eventItem.appendChild(dateDiv);
        eventItem.appendChild(detailsDiv);


        eventItem.addEventListener('click', function() {
            const eventDateStr = evt.date.includes('T') ? evt.date.split('T')[0] : evt.date;
            sessionStorage.setItem('selectedEventDate', eventDateStr);
            window.location.href = 'study_plan.html';
        });

        upcomingList.appendChild(eventItem);
    });
}


function openEditEventModal(eventToEdit) {
    const modal = document.getElementById('editEventModal') || createEditEventModal();

    document.getElementById('editEventTitle').value = eventToEdit.title;
    document.getElementById('editEventType').value = eventToEdit.type || 'task';
    document.getElementById('editEventDate').value = eventToEdit.date;
    document.getElementById('editEventTime').value = eventToEdit.time || '';
    document.getElementById('editEventDescription').value = eventToEdit.description || '';

    modal.dataset.eventId = eventToEdit.id;

    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}


function createEditEventModal() {
    const modal = document.createElement('div');
    modal.id = 'editEventModal';
    modal.className = 'modal';

    const modalHTML = '<div class="modal_content">' +
        '<div class="modal_header">' +
            '<h2>Edit Event</h2>' +
            '<button class="close_button" id="closeEditEventModal">&times;</button>' +
        '</div>' +
        '<form id="editEventForm">' +
            '<div class="form_group">' +
                '<label>Event Title</label>' +
                '<input type="text" id="editEventTitle" required>' +
            '</div>' +
            '<div class="form_group">' +
                '<label>Type</label>' +
                '<select id="editEventType">' +
                    '<option value="task">Task</option>' +
                    '<option value="quiz">Quiz</option>' +
                    '<option value="study">Study Session</option>' +
                    '<option value="deadline">Deadline</option>' +
                '</select>' +
            '</div>' +
            '<div class="form_group">' +
                '<label>Date</label>' +
                '<input type="date" id="editEventDate" required>' +
            '</div>' +
            '<div class="form_group">' +
                '<label>Time (optional)</label>' +
                '<input type="time" id="editEventTime">' +
            '</div>' +
            '<div class="form_group">' +
                '<label>Description</label>' +
                '<textarea id="editEventDescription" rows="3"></textarea>' +
            '</div>' +
            '<div class="modal_actions">' +
                '<button type="button" class="delete_event_button">Delete</button>' +
                '<button type="button" class="cancel_button">Cancel</button>' +
                '<button type="submit" class="save_button">Save Changes</button>' +
            '</div>' +
        '</form>' +
    '</div>';

    modal.innerHTML = modalHTML;
    document.body.appendChild(modal);

    modal.querySelector('#closeEditEventModal').addEventListener('click', closeEditEventModal);
    modal.querySelector('.cancel_button').addEventListener('click', closeEditEventModal);
    modal.querySelector('.delete_event_button').addEventListener('click', handleDeleteEvent);
    modal.querySelector('#editEventForm').addEventListener('submit', handleUpdateEvent);

    modal.addEventListener('click', function(e) {
        if (e.target === modal) closeEditEventModal();
    });

    return modal;
}


function closeEditEventModal() {
    const modal = document.getElementById('editEventModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}


async function handleUpdateEvent(e) {
    e.preventDefault();

    const modal = document.getElementById('editEventModal');
    const eventId = modal.dataset.eventId;

    const updatedEventData = {
        title: document.getElementById('editEventTitle').value,
        type: document.getElementById('editEventType').value,
        date: document.getElementById('editEventDate').value,
        time: document.getElementById('editEventTime').value,
        description: document.getElementById('editEventDescription').value
    };

    try {
        await updateEvent(eventId, updatedEventData);

        closeEditEventModal();
        await loadCalendarEvents();
        displayTodayEvents();
        renderCalendar();

    } catch (updateError) {
        console.error('Error updating event:', updateError);
        showError('Failed to update event: ' + updateError.message);
    }
}


async function handleDeleteEvent() {
    showConfirmDialog('Are you sure you want to delete this event?', async () => {
        const modal = document.getElementById('editEventModal');
        const eventId = modal.dataset.eventId;

        try {
            await deleteEvent(eventId);

            closeEditEventModal();
            await loadCalendarEvents();
            displayTodayEvents();
            renderCalendar();

        } catch (deleteError) {
            console.error('Error deleting event:', deleteError);
            showError('Failed to delete event: ' + deleteError.message);
        }
    });
}


function setupEventListeners() {

    const logoutButtons = document.querySelectorAll('[onclick="logout()"]');
    logoutButtons.forEach(btn => {
        btn.onclick = logout;
    });


    const profileButton = document.querySelector('.profile_button');
    if (profileButton) {
        profileButton.addEventListener('click', function() {
            window.location.href = '/pages/settings.html';
        });
    }


    const searchInput = document.querySelector('.search_input');
    if (searchInput) {
        searchInput.addEventListener('input', handleSearch);
    }


    const filterSelect = document.querySelector('.filter_select');
    if (filterSelect) {
        filterSelect.addEventListener('change', handleFilter);
    }


    const notificationButton = document.querySelector('.notification_button');
    if (notificationButton) {
        notificationButton.addEventListener('click', function() {
            showInfo('Notifications feature coming soon!');
        });
    }


    const createNewButton = document.querySelector('.create_new_button');
    if (createNewButton) {
        createNewButton.addEventListener('click', function() {
            window.location.href = '/pages/note_editor.html';
        });
    }

    setupFolderModal();
}


function handleSearch(e) {
    const searchTerm = e.target.value.toLowerCase();
    const materialRows = document.querySelectorAll('.table_row');

    materialRows.forEach(row => {
        const materialName = row.querySelector('.material_name').textContent.toLowerCase();
        row.style.display = materialName.includes(searchTerm) ? 'grid' : 'none';
    });
}


function handleFilter(e) {
    const selectedFilter = e.target.value;
    const materialRows = document.querySelectorAll('.table_row');

    materialRows.forEach(row => {
        const typeBadge = row.querySelector('.type_badge');
        if (!typeBadge) return;

        if (selectedFilter === 'all') {
            row.style.display = 'grid';
        } else {
            const materialType = typeBadge.textContent.toLowerCase();
            row.style.display = materialType === selectedFilter ? 'grid' : 'none';
        }
    });
}


function setupFolderModal() {
    const createFolderModal = document.getElementById('createFolderModal');
    const closeFolderModalButton = document.getElementById('closeFolderModalButton');
    const cancelFolderModalButton = document.getElementById('cancelFolderModalButton');
    const createFolderForm = document.getElementById('createFolderForm');

    if (closeFolderModalButton) {
        closeFolderModalButton.addEventListener('click', closeFolderModal);
    }

    if (cancelFolderModalButton) {
        cancelFolderModalButton.addEventListener('click', closeFolderModal);
    }

    if (createFolderModal) {
        createFolderModal.addEventListener('click', function(e) {
            if (e.target === createFolderModal) {
                closeFolderModal();
            }
        });
    }

    if (createFolderForm) {
        createFolderForm.addEventListener('submit', handleCreateFolder);
    }
}


function openFolderModal() {
    const modal = document.getElementById('createFolderModal');
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}


function closeFolderModal() {
    const modal = document.getElementById('createFolderModal');
    const formElement = document.getElementById('createFolderForm');

    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }

    if (formElement) {
        formElement.reset();
    }
}


async function handleCreateFolder(e) {
    e.preventDefault();

    const folderNameInput = document.getElementById('folderName').value;
    const selectedFolderColor = document.querySelector('input[name="folderColor"]:checked')?.value || 'orange';

    try {
        await createFolder({
            name: folderNameInput,
            color: selectedFolderColor
        });

        closeFolderModal();
        await loadFoldersToSidebar();

    } catch (folderCreationError) {
        console.error('Failed to create folder:', folderCreationError);
    }
}


function initializeCalendar() {
    renderCalendar();

    const prevMonthButton = document.querySelector('.prev_month');
    const nextMonthButton = document.querySelector('.next_month');

    if (prevMonthButton) {
        prevMonthButton.addEventListener('click', function() {
            currentDate.setMonth(currentDate.getMonth() - 1);
            renderCalendar();
        });
    }

    if (nextMonthButton) {
        nextMonthButton.addEventListener('click', function() {
            currentDate.setMonth(currentDate.getMonth() + 1);
            renderCalendar();
        });
    }
}


function renderCalendar() {
    const yearNumber = currentDate.getFullYear();
    const monthNumber = currentDate.getMonth();

    const calendarTitle = document.querySelector('.calendar_title');
    if (calendarTitle) {
        calendarTitle.textContent = `${monthNames[monthNumber]} ${yearNumber}`;
    }

    const firstDayOfMonth = new Date(yearNumber, monthNumber, 1).getDay();
    const totalDaysInMonth = new Date(yearNumber, monthNumber + 1, 0).getDate();
    const daysInPreviousMonth = new Date(yearNumber, monthNumber, 0).getDate();

    const calendarGrid = document.querySelector('.calendar_grid');
    if (!calendarGrid) return;

    calendarGrid.innerHTML = '';

    const adjustedFirstDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

    for (let i = adjustedFirstDay - 1; i >= 0; i--) {
        const dayNumber = daysInPreviousMonth - i;
        const dayElement = createDayElement(dayNumber, true, yearNumber, monthNumber - 1);
        calendarGrid.appendChild(dayElement);
    }

    for (let dayNumber = 1; dayNumber <= totalDaysInMonth; dayNumber++) {
        const dayElement = createDayElement(dayNumber, false, yearNumber, monthNumber);
        calendarGrid.appendChild(dayElement);
    }

    const totalCellsUsed = calendarGrid.children.length;
    const remainingCells = 35 - totalCellsUsed;

    for (let dayNumber = 1; dayNumber <= remainingCells; dayNumber++) {
        const dayElement = createDayElement(dayNumber, true, yearNumber, monthNumber + 1);
        calendarGrid.appendChild(dayElement);
    }
}


function createDayElement(dayNumber, isOtherMonth, yearValue, monthValue) {
    const dayElement = document.createElement('div');
    dayElement.className = 'calendar_day';
    dayElement.textContent = dayNumber;

    if (isOtherMonth) {
        dayElement.classList.add('other_month');
    }

    const todayDate = new Date();

    const isToday = !isOtherMonth &&
                    dayNumber === todayDate.getDate() &&
                    monthValue === todayDate.getMonth() &&
                    yearValue === todayDate.getFullYear();

    if (isToday) {
        dayElement.classList.add('active');
    }

    if (!isOtherMonth) {
        dayElement.addEventListener('click', function() {
            selectedDate = new Date(yearValue, monthValue, dayNumber);

            document.querySelectorAll('.calendar_day').forEach(function(el) {
                el.classList.remove('active');
            });

            dayElement.classList.add('active');
        });
    }

    return dayElement;
}
