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

            console.log('Creating activity:', {
                title: activityTitle,
                subject: activitySubject,
                color: activityColor,
                date: activityDate,
                startTime: activityStartTime,
                endTime: activityEndTime
            });

            // Here you would save the activity to the database
            alert('Activity saved! (This will connect to database later)');

            closeActivityModal();
        });
    }


    // Initialize calendar
    renderCalendar();
});


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

    // Here you would load activities for the selected date from the database
    // For now, we'll just show a message if there are no activities
    const activitiesList = document.querySelector('.activities_list');
    if (activitiesList) {
        // Check if it's the sample date (October 25) to show sample activities
        if (selectedDate.getMonth() === 9 && selectedDate.getDate() === 25) {
            // Keep the existing sample activities
        } else {
            // Show empty state for other dates
            activitiesList.innerHTML = '<p style="color: #86868B; text-align: center; padding: 20px;">No activities scheduled for this day.</p>';
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
