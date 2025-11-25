// Logout function
function logout() {
    // Clear any stored session data if you're using localStorage/sessionStorage
    // localStorage.clear();
    // sessionStorage.clear();

    // Redirect to login page
    window.location.href = 'login.html';
}

// Current date tracking for calendar
let currentDate = new Date();
let selectedDate = new Date();

// Month names
const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {

    // Initialize calendar
    renderCalendar();

    // Filter dropdown functionality
    const filterSelect = document.querySelector('.filter_select');

    if (filterSelect) {
        filterSelect.addEventListener('change', function() {
            const selectedFilter = filterSelect.value;
            const tableRows = document.querySelectorAll('.table_row');

            console.log('Filter selected:', selectedFilter);

            // Here you would filter materials based on selection
            if (selectedFilter === 'all') {
                tableRows.forEach(function(row) {
                    row.style.display = 'grid';
                });
            } else {
                tableRows.forEach(function(row) {
                    const badge = row.querySelector('.type_badge');
                    if (badge) {
                        const materialType = badge.textContent.toLowerCase();

                        if (selectedFilter === 'pdf' && materialType === 'pdf') {
                            row.style.display = 'grid';
                        } else if (selectedFilter === 'doc' && materialType === 'doc') {
                            row.style.display = 'grid';
                        } else if (selectedFilter === 'images' && materialType === 'image') {
                            row.style.display = 'grid';
                        } else if (selectedFilter === 'recent') {
                            row.style.display = 'grid';
                        } else {
                            row.style.display = 'none';
                        }
                    }
                });
            }
        });
    }


    // Table row click handling
    const tableRows = document.querySelectorAll('.table_row');

    tableRows.forEach(function(row) {
        row.addEventListener('click', function() {
            const materialName = row.querySelector('.material_name');
            if (materialName) {
                console.log('Opening material:', materialName.textContent);

                // Navigate to material details or viewer
                alert('Opening: ' + materialName.textContent);
            }
        });
    });


    // Calendar navigation
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


    // Upcoming items click handling
    const upcomingItems = document.querySelectorAll('.upcoming_item');

    upcomingItems.forEach(function(item) {
        item.addEventListener('click', function() {
            const taskName = item.querySelector('.upcoming_task').textContent;
            const taskType = item.querySelector('.upcoming_type').textContent;

            console.log('Opening task:', taskName, taskType);

            // Navigate to study plan with selected task
            window.location.href = 'study_plan.html';
        });
    });


    // Search functionality
    const searchInput = document.querySelector('.search_input');

    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            const searchTerm = e.target.value.toLowerCase();

            // Filter material rows
            tableRows.forEach(function(row) {
                const materialName = row.querySelector('.material_name');
                if (materialName) {
                    const name = materialName.textContent.toLowerCase();

                    if (name.includes(searchTerm)) {
                        row.style.display = 'grid';
                    } else {
                        row.style.display = 'none';
                    }
                }
            });
        });
    }


    // Notification button
    const notificationButton = document.querySelector('.notification_button');

    if (notificationButton) {
        notificationButton.addEventListener('click', function() {
            alert('Notifications feature coming soon!');
        });
    }


    // Profile button
    const profileButton = document.querySelector('.profile_button');

    if (profileButton) {
        profileButton.addEventListener('click', function() {
            // Navigate to settings page
            window.location.href = 'settings.html';
        });
    }


    // Folder click handling
    const folderItems = document.querySelectorAll('.folder_item');

    folderItems.forEach(function(folder) {
        folder.addEventListener('click', function(e) {
            e.preventDefault();

            const folderName = folder.textContent.trim();
            console.log('Opening folder:', folderName);

            // Navigate to materials page with folder filter
            window.location.href = `my_notes.html?folder=${encodeURIComponent(folderName)}`;
        });
    });


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


    // Create New button
    const createNewButton = document.querySelector('.create_new_button');

    if (createNewButton) {
        createNewButton.addEventListener('click', function() {
            alert('Create: Note, Folder, Quiz, or Study Plan');
        });
    }

});


// Calendar rendering function
function renderCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // Update month display in calendar title
    const calendarTitle = document.querySelector('.calendar_title');
    if (calendarTitle) {
        calendarTitle.textContent = `${monthNames[month]} ${year}`;
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

    // Adjust firstDay (Sunday = 0, Monday = 1, etc.)
    // We want Monday to be first, so adjust
    const adjustedFirstDay = firstDay === 0 ? 6 : firstDay - 1;

    // Add previous month days
    for (let i = adjustedFirstDay - 1; i >= 0; i--) {
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
    dayElement.textContent = day;

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
        dayElement.classList.add('active');
    }

    // Add click event
    if (!isOtherMonth) {
        dayElement.addEventListener('click', function() {
            selectedDate = new Date(year, month, day);

            // Remove active class from all days
            document.querySelectorAll('.calendar_day').forEach(function(el) {
                el.classList.remove('active');
            });

            // Add active class to clicked day
            dayElement.classList.add('active');

            console.log('Selected day:', selectedDate);
        });
    }

    return dayElement;
}
