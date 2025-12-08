// Logout function
function logout() {
    // Clear any stored session data if you're using localStorage/sessionStorage
    // localStorage.clear();
    // sessionStorage.clear();

    // Redirect to login page
    window.location.href = 'login.html';
}

// Current date tracking
let currentDate = new Date();
let selectedDate = new Date();

// Month names
const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

// Current event being viewed/edited
let currentEventId = null;

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {

    // Month navigation buttons
    const prevButton = document.querySelector('.month_arrow.prev');
    const nextButton = document.querySelector('.month_arrow.next');
    const todayButton = document.querySelector('.today_button');

    if (prevButton) {
        prevButton.addEventListener('click', function() {
            currentDate.setMonth(currentDate.getMonth() - 1);
            renderCalendar();
        });
    }

    if (nextButton) {
        nextButton.addEventListener('click', function() {
            currentDate.setMonth(currentDate.getMonth() + 1);
            renderCalendar();
        });
    }

    if (todayButton) {
        todayButton.addEventListener('click', function() {
            currentDate = new Date();
            selectedDate = new Date();
            renderCalendar();
            updateSelectedDayPanel();
        });
    }


    // Add folder button and modal
    const addFolderButton = document.querySelector('.add_folder_button');
    const createFolderModal = document.getElementById('createFolderModal');
    const closeFolderModalButton = document.getElementById('closeFolderModalButton');
    const cancelFolderModalButton = document.getElementById('cancelFolderModalButton');
    const createFolderForm = document.getElementById('createFolderForm');

    // Open create folder modal
    function openFolderModal() {
        if (createFolderModal) {
            createFolderModal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }
    }

    // Close create folder modal
    function closeFolderModal() {
        if (createFolderModal) {
            createFolderModal.style.display = 'none';
            document.body.style.overflow = 'auto';
            if (createFolderForm) {
                createFolderForm.reset();
            }
        }
    }

    if (addFolderButton) {
        addFolderButton.addEventListener('click', function() {
            openFolderModal();
        });
    }

    if (closeFolderModalButton) {
        closeFolderModalButton.addEventListener('click', closeFolderModal);
    }

    if (cancelFolderModalButton) {
        cancelFolderModalButton.addEventListener('click', closeFolderModal);
    }

    // Close modal when clicking outside
    if (createFolderModal) {
        createFolderModal.addEventListener('click', function(e) {
            if (e.target === createFolderModal) {
                closeFolderModal();
            }
        });
    }

    // Handle folder form submission
    if (createFolderForm) {
        createFolderForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const folderName = document.getElementById('folderName').value;
            const folderColor = document.querySelector('input[name="folderColor"]:checked').value;

            console.log('Creating folder:', { name: folderName, color: folderColor });

            // Here you would create a new folder in the database
            alert(`Folder "${folderName}" created with color ${folderColor}!`);

            closeFolderModal();
        });
    }


    // Add Activity modal
    const addToDayButton = document.querySelector('.add_to_day_button');
    const addActivityModal = document.getElementById('addActivityModal');
    const closeActivityModalButton = document.getElementById('closeActivityModalButton');
    const cancelActivityModalButton = document.getElementById('cancelActivityModalButton');
    const addActivityForm = document.getElementById('addActivityForm');

    // Weekly repeat checkbox handler
    const repeatWeeklyCheckbox = document.getElementById('repeatWeekly');
    const repeatUntilGroup = document.getElementById('repeatUntilGroup');

    if (repeatWeeklyCheckbox && repeatUntilGroup) {
        repeatWeeklyCheckbox.addEventListener('change', function() {
            if (this.checked) {
                repeatUntilGroup.style.display = 'block';
            } else {
                repeatUntilGroup.style.display = 'none';
                document.getElementById('repeatUntilDate').value = '';
            }
        });
    }

    // Open add activity modal
    function openActivityModal() {
        if (addActivityModal) {
            addActivityModal.style.display = 'flex';
            document.body.style.overflow = 'hidden';

            // Pre-fill the date with selected date
            const dateInput = document.getElementById('activityDate');
            if (dateInput) {
                const year = selectedDate.getFullYear();
                const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
                const day = String(selectedDate.getDate()).padStart(2, '0');
                dateInput.value = `${year}-${month}-${day}`;
            }
        }
    }

    // Close add activity modal
    function closeActivityModal() {
        if (addActivityModal) {
            addActivityModal.style.display = 'none';
            document.body.style.overflow = 'auto';
            if (addActivityForm) {
                addActivityForm.reset();
                repeatUntilGroup.style.display = 'none';
            }
        }
    }

    if (addToDayButton) {
        addToDayButton.addEventListener('click', function() {
            openActivityModal();
        });
    }

    if (closeActivityModalButton) {
        closeActivityModalButton.addEventListener('click', closeActivityModal);
    }

    if (cancelActivityModalButton) {
        cancelActivityModalButton.addEventListener('click', closeActivityModal);
    }

    // Close modal when clicking outside
    if (addActivityModal) {
        addActivityModal.addEventListener('click', function(e) {
            if (e.target === addActivityModal) {
                closeActivityModal();
            }
        });
    }

    // Handle activity form submission
    if (addActivityForm) {
        addActivityForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const activityTitle = document.getElementById('activityTitle').value;
            const activitySubject = document.getElementById('activitySubject').value;
            const activityColor = document.getElementById('activityColor').value;
            const activityDate = document.getElementById('activityDate').value;
            const activityStartTime = document.getElementById('activityStartTime').value;
            const activityEndTime = document.getElementById('activityEndTime').value;
            const repeatWeekly = document.getElementById('repeatWeekly').checked;
            const repeatUntilDate = document.getElementById('repeatUntilDate').value;

            const activity = {
                id: Date.now().toString(),
                title: activityTitle,
                subject: activitySubject,
                color: activityColor,
                date: activityDate,
                startTime: activityStartTime,
                endTime: activityEndTime,
                repeatWeekly: repeatWeekly,
                repeatUntil: repeatUntilDate || null
            };

            saveActivity(activity);

            console.log('Activity saved:', activity);

            closeActivityModal();
            renderCalendar();
            updateSelectedDayPanel();
        });
    }

    // Event Details Modal handlers
    const eventDetailsModal = document.getElementById('eventDetailsModal');
    const closeEventDetailsButton = document.getElementById('closeEventDetailsButton');
    const editEventButton = document.getElementById('editEventButton');
    const deleteEventButton = document.getElementById('deleteEventButton');

    if (closeEventDetailsButton) {
        closeEventDetailsButton.addEventListener('click', function() {
            eventDetailsModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        });
    }

    if (eventDetailsModal) {
        eventDetailsModal.addEventListener('click', function(e) {
            if (e.target === eventDetailsModal) {
                eventDetailsModal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        });
    }

    if (editEventButton) {
        editEventButton.addEventListener('click', function() {
            eventDetailsModal.style.display = 'none';
            openEditModal(currentEventId);
        });
    }

    if (deleteEventButton) {
        deleteEventButton.addEventListener('click', function() {
            if (confirm('Are you sure you want to delete this event?')) {
                deleteEvent(currentEventId);
                eventDetailsModal.style.display = 'none';
                document.body.style.overflow = 'auto';
                renderCalendar();
                updateSelectedDayPanel();
            }
        });
    }

    // Edit Activity Modal handlers
    const editActivityModal = document.getElementById('editActivityModal');
    const closeEditModalButton = document.getElementById('closeEditModalButton');
    const cancelEditButton = document.getElementById('cancelEditButton');
    const editActivityForm = document.getElementById('editActivityForm');

    // Edit weekly repeat checkbox handler
    const editRepeatWeeklyCheckbox = document.getElementById('editRepeatWeekly');
    const editRepeatUntilGroup = document.getElementById('editRepeatUntilGroup');

    if (editRepeatWeeklyCheckbox && editRepeatUntilGroup) {
        editRepeatWeeklyCheckbox.addEventListener('change', function() {
            if (this.checked) {
                editRepeatUntilGroup.style.display = 'block';
            } else {
                editRepeatUntilGroup.style.display = 'none';
                document.getElementById('editRepeatUntilDate').value = '';
            }
        });
    }

    function closeEditModal() {
        if (editActivityModal) {
            editActivityModal.style.display = 'none';
            document.body.style.overflow = 'auto';
            if (editActivityForm) {
                editActivityForm.reset();
                editRepeatUntilGroup.style.display = 'none';
            }
        }
    }

    if (closeEditModalButton) {
        closeEditModalButton.addEventListener('click', closeEditModal);
    }

    if (cancelEditButton) {
        cancelEditButton.addEventListener('click', closeEditModal);
    }

    if (editActivityModal) {
        editActivityModal.addEventListener('click', function(e) {
            if (e.target === editActivityModal) {
                closeEditModal();
            }
        });
    }

    if (editActivityForm) {
        editActivityForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const activityTitle = document.getElementById('editActivityTitle').value;
            const activitySubject = document.getElementById('editActivitySubject').value;
            const activityColor = document.getElementById('editActivityColor').value;
            const activityDate = document.getElementById('editActivityDate').value;
            const activityStartTime = document.getElementById('editActivityStartTime').value;
            const activityEndTime = document.getElementById('editActivityEndTime').value;
            const repeatWeekly = document.getElementById('editRepeatWeekly').checked;
            const repeatUntilDate = document.getElementById('editRepeatUntilDate').value;

            const updatedActivity = {
                id: currentEventId,
                title: activityTitle,
                subject: activitySubject,
                color: activityColor,
                date: activityDate,
                startTime: activityStartTime,
                endTime: activityEndTime,
                repeatWeekly: repeatWeekly,
                repeatUntil: repeatUntilDate || null
            };

            updateActivity(updatedActivity);

            console.log('Activity updated:', updatedActivity);

            closeEditModal();
            renderCalendar();
            updateSelectedDayPanel();
        });
    }

    // Initialize calendar
    renderCalendar();
});


// Activity storage functions
function saveActivity(activity) {
    const activities = getActivities();
    activities.push(activity);
    localStorage.setItem('study_plan_activities', JSON.stringify(activities));
}

function getActivities() {
    const activities = localStorage.getItem('study_plan_activities');
    return activities ? JSON.parse(activities) : [];
}

function updateActivity(updatedActivity) {
    const activities = getActivities();
    const index = activities.findIndex(a => a.id === updatedActivity.id);
    if (index !== -1) {
        activities[index] = updatedActivity;
        localStorage.setItem('study_plan_activities', JSON.stringify(activities));
    }
}

function deleteEvent(eventId) {
    const activities = getActivities();
    const filtered = activities.filter(a => a.id !== eventId);
    localStorage.setItem('study_plan_activities', JSON.stringify(filtered));
}

// Get events for a specific date (including recurring events)
function getEventsForDate(date) {
    const activities = getActivities();
    const events = [];

    activities.forEach(activity => {
        const activityDate = new Date(activity.date + 'T00:00:00');

        if (activity.repeatWeekly) {
            // Check if this date matches the day of week
            if (activityDate.getDay() === date.getDay()) {
                // Check if date is on or after the start date
                if (date >= activityDate) {
                    // Check if there's an end date
                    if (activity.repeatUntil) {
                        const endDate = new Date(activity.repeatUntil + 'T23:59:59');
                        if (date <= endDate) {
                            events.push(activity);
                        }
                    } else {
                        // No end date, repeat indefinitely
                        events.push(activity);
                    }
                }
            }
        } else {
            // Single occurrence event
            if (activityDate.toDateString() === date.toDateString()) {
                events.push(activity);
            }
        }
    });

    return events;
}

// Show event details modal
function showEventDetails(eventId) {
    const activities = getActivities();
    const event = activities.find(a => a.id === eventId);

    if (!event) return;

    currentEventId = eventId;

    // Update modal content
    document.getElementById('eventDetailsTitle').textContent = event.title;
    document.getElementById('eventSubject').textContent = event.subject;

    const eventDate = new Date(event.date + 'T00:00:00');
    document.getElementById('eventDate').textContent = eventDate.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    });

    document.getElementById('eventTime').textContent = `${event.startTime} - ${event.endTime}`;

    if (event.repeatWeekly) {
        let recurringText = 'Repeats weekly';
        if (event.repeatUntil) {
            const untilDate = new Date(event.repeatUntil + 'T00:00:00');
            recurringText += ` until ${untilDate.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            })}`;
        }
        document.getElementById('eventRecurring').textContent = recurringText;
    } else {
        document.getElementById('eventRecurring').textContent = 'Does not repeat';
    }

    // Show modal
    const eventDetailsModal = document.getElementById('eventDetailsModal');
    eventDetailsModal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

// Open edit modal with pre-filled data
function openEditModal(eventId) {
    const activities = getActivities();
    const event = activities.find(a => a.id === eventId);

    if (!event) return;

    currentEventId = eventId;

    // Pre-fill form
    document.getElementById('editActivityTitle').value = event.title;
    document.getElementById('editActivitySubject').value = event.subject;
    document.getElementById('editActivityColor').value = event.color;
    document.getElementById('editActivityDate').value = event.date;
    document.getElementById('editActivityStartTime').value = event.startTime;
    document.getElementById('editActivityEndTime').value = event.endTime;
    document.getElementById('editRepeatWeekly').checked = event.repeatWeekly;

    if (event.repeatWeekly) {
        document.getElementById('editRepeatUntilGroup').style.display = 'block';
        document.getElementById('editRepeatUntilDate').value = event.repeatUntil || '';
    } else {
        document.getElementById('editRepeatUntilGroup').style.display = 'none';
    }

    // Show modal
    const editActivityModal = document.getElementById('editActivityModal');
    editActivityModal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}


function renderCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // Update month display
    const monthDisplay = document.querySelector('.current_month');
    if (monthDisplay) {
        monthDisplay.textContent = `${monthNames[month]} ${year}`;
    }

    // Get first day of month and number of days
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    // Get calendar grid
    const calendarGrid = document.querySelector('.calendar_grid');
    if (!calendarGrid) return;

    // Clear existing calendar
    calendarGrid.innerHTML = '';

    // Add previous month days
    for (let i = firstDay - 1; i >= 0; i--) {
        const day = daysInPrevMonth - i;
        const dayElement = createDayElement(day, true, year, month - 1);
        calendarGrid.appendChild(dayElement);
    }

    // Add current month days
    for (let day = 1; day <= daysInMonth; day++) {
        const dayElement = createDayElement(day, false, year, month);
        calendarGrid.appendChild(dayElement);
    }

    // Add next month days to fill the grid
    const totalCells = calendarGrid.children.length;
    const remainingCells = 35 - totalCells;

    for (let day = 1; day <= remainingCells; day++) {
        const dayElement = createDayElement(day, true, year, month + 1);
        calendarGrid.appendChild(dayElement);
    }
}


function createDayElement(day, isOtherMonth, year, month) {
    const dayElement = document.createElement('div');
    dayElement.className = 'calendar_day';

    if (isOtherMonth) {
        dayElement.classList.add('other_month');
    }

    // Check if this is today
    const today = new Date();
    const isToday = !isOtherMonth &&
                    day === today.getDate() &&
                    month === today.getMonth() &&
                    year === today.getFullYear();

    if (isToday) {
        dayElement.classList.add('today');
    }

    // Day number
    const dayNumber = document.createElement('span');
    dayNumber.className = 'day_number';
    dayNumber.textContent = day;
    dayElement.appendChild(dayNumber);

    // Check for events on this day
    const dayDate = new Date(year, month, day);
    const events = getEventsForDate(dayDate);

    if (events.length > 0) {
        const eventDotsContainer = document.createElement('div');
        eventDotsContainer.className = 'event_dots';
        eventDotsContainer.style.display = 'flex';
        eventDotsContainer.style.gap = '3px';
        eventDotsContainer.style.justifyContent = 'center';
        eventDotsContainer.style.marginTop = '4px';

        // Show up to 3 event dots
        events.slice(0, 3).forEach(event => {
            const dot = document.createElement('span');
            dot.style.width = '6px';
            dot.style.height = '6px';
            dot.style.borderRadius = '50%';
            dot.style.backgroundColor = event.color;
            dot.style.display = 'inline-block';
            eventDotsContainer.appendChild(dot);
        });

        dayElement.appendChild(eventDotsContainer);
    }

    // Add click event
    dayElement.addEventListener('click', function() {
        selectedDate = new Date(year, month, day);
        updateSelectedDayPanel();

        // Remove previous selection highlight
        document.querySelectorAll('.calendar_day').forEach(el => {
            el.style.outline = 'none';
        });

        // Highlight selected day
        dayElement.style.outline = '2px solid #00B7B5';
    });

    return dayElement;
}


function updateSelectedDayPanel() {
    const dayTitle = document.querySelector('.day_details_widget .widget_title');

    if (dayTitle) {
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const dayName = dayNames[selectedDate.getDay()];
        const monthName = monthNames[selectedDate.getMonth()];
        const date = selectedDate.getDate();

        dayTitle.textContent = `${dayName}, ${monthName} ${date}`;
    }

    // Load activities for the selected date
    const activitiesList = document.querySelector('.activities_list');
    if (activitiesList) {
        const events = getEventsForDate(selectedDate);

        if (events.length === 0) {
            activitiesList.innerHTML = '<p style="color: #86868B; text-align: center; padding: 20px;">No activities scheduled for this day.</p>';
        } else {
            activitiesList.innerHTML = '';

            events.forEach(event => {
                const activityItem = document.createElement('div');
                activityItem.className = 'activity_item';
                activityItem.style.cursor = 'pointer';

                activityItem.innerHTML = `
                    <div class="activity_time_marker" style="background-color: ${event.color};"></div>
                    <div class="activity_details">
                        <div class="activity_title">${event.title}</div>
                        <div class="activity_meta">${event.startTime} - ${event.endTime} • ${event.subject}</div>
                    </div>
                `;

                // Add click event to show details
                activityItem.addEventListener('click', function() {
                    showEventDetails(event.id);
                });

                activitiesList.appendChild(activityItem);
            });
        }
    }
}


function clearForm() {
    const inputs = document.querySelectorAll('.form_input');
    inputs.forEach(input => {
        input.value = '';
    });

    const selects = document.querySelectorAll('.form_select');
    selects.forEach(select => {
        select.selectedIndex = 0;
    });
}
