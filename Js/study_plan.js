

if (!requireAuth()) {

}


let currentDate = new Date();

let selectedDate = new Date();


const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];


let currentEventId = null;


const monthShortNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];


document.addEventListener('DOMContentLoaded', async function() {


    const selectedEventDate = sessionStorage.getItem('selectedEventDate');
    if (selectedEventDate) {
       
        const dateParts = selectedEventDate.split('-');
       
        selectedDate = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);
       
        currentDate = new Date(selectedDate); 
       
        sessionStorage.removeItem('selectedEventDate'); 
    }


   
    await loadFoldersToSidebar();
    
    
    await loadUpcomingEvents();
    
   
    const prevButton = document.querySelector('.month_arrow.prev');
   
    const nextButton = document.querySelector('.month_arrow.next');
   
    const todayButton = document.querySelector('.today_button');

    if (prevButton) {
        prevButton.addEventListener('click', async function() {
          
            currentDate.setMonth(currentDate.getMonth() - 1);
          
            await renderCalendar();
        });
    
    }

    if (nextButton) {
    
        nextButton.addEventListener('click', async function() {
    
            currentDate.setMonth(currentDate.getMonth() + 1);
    
            await renderCalendar();
        });
    }

    if (todayButton) {
        todayButton.addEventListener('click', async function() {
            currentDate = new Date();
            selectedDate = new Date();
            await renderCalendar();
            await updateSelectedDayPanel();
        });
    }


  
    const addFolderButton = document.querySelector('.add_folder_button');
    
    const createFolderModal = document.getElementById('createFolderModal');
    
    const closeFolderModalButton = document.getElementById('closeFolderModalButton');
    
    const cancelFolderModalButton = document.getElementById('cancelFolderModalButton');
    
    const createFolderForm = document.getElementById('createFolderForm');

    
    function openFolderModal() {
        if (createFolderModal) {
            createFolderModal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }
    }

   
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


    if (createFolderModal) {
 
        createFolderModal.addEventListener('click', function(e) {
 
            if (e.target === createFolderModal) {
                closeFolderModal();
            }
        });
    }

    
    if (createFolderForm) {
    
        createFolderForm.addEventListener('submit', async function(e) {
    
            e.preventDefault();


            const folderName = document.getElementById('folderName').value;
            
            const folderColor = document.querySelector('input[name="folderColor"]:checked').value;

            try {
                await createFolder({ name: folderName, color: folderColor });
            
                closeFolderModal();
            
                await loadFoldersToSidebar();

            }
             catch (error) {
            
                console.error('Error creating folder:', error);
            
                showError('Failed to create folder. Please try again.');
            
            }
        });
    }


  
    const addToDayButton = document.querySelector('.add_to_day_button');
  
    const addActivityModal = document.getElementById('addActivityModal');
  
    const closeActivityModalButton = document.getElementById('closeActivityModalButton');
  
    const cancelActivityModalButton = document.getElementById('cancelActivityModalButton');
  
    const addActivityForm = document.getElementById('addActivityForm');

  
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


    function openActivityModal() {
        if (addActivityModal) {
            addActivityModal.style.display = 'flex';
            document.body.style.overflow = 'hidden';


            const dateInput = document.getElementById('activityDate');

            if (dateInput) {
                const year = selectedDate.getFullYear();
                const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
                const day = String(selectedDate.getDate()).padStart(2, '0');
                dateInput.value = `${year}-${month}-${day}`;
            }
        }
    }


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


    if (addActivityModal) {
        addActivityModal.addEventListener('click', function(e) {
            if (e.target === addActivityModal) {
                closeActivityModal();
            }
        });
    }

   
    if (addActivityForm) {
        addActivityForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const activityTitle = document.getElementById('activityTitle').value;
           
            const activityColor = document.getElementById('activityColor').value;
           
            const activityDate = document.getElementById('activityDate').value;
           
           
            const activityStartTime = document.getElementById('activityStartTime').value;
           
            const activityEndTime = document.getElementById('activityEndTime').value;
           
            const repeatWeekly = document.getElementById('repeatWeekly').checked;
           
            const repeatUntilDate = document.getElementById('repeatUntilDate').value;


            if (!activityTitle || !activityDate) {
                showError('Title and date are required');
                return;
            }

            const activity = {
                title: activityTitle.trim(),
                color: activityColor || 'blue',
                date: activityDate,
                startTime: activityStartTime || null,
                endTime: activityEndTime || null,
                repeatWeekly: repeatWeekly,
                repeatUntil: repeatUntilDate || null
            };

            console.log('Creating activity with data:', activity);

            try {
                await saveActivity(activity);
                showSuccess('Activity created successfully!');
                
           
                addActivityForm.reset();
           
                closeActivityModal();
                
                await renderCalendar();
                
                await updateSelectedDayPanel();
                
                await loadUpcomingEvents();
                
            } catch (error) {
                console.error('Failed to create activity:', error);
                showError('Failed to create activity: ' + (error.message || 'Unknown error'));
            }
        });
    }

   
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
            showConfirmDialog('Are you sure you want to delete this event?', async () => {
                await deleteActivity(currentEventId);
                eventDetailsModal.style.display = 'none';
                document.body.style.overflow = 'auto';
                await renderCalendar();
                await updateSelectedDayPanel();
                await loadUpcomingEvents();
            });
        });
    }

  
    const editActivityModal = document.getElementById('editActivityModal');
   
    const closeEditModalButton = document.getElementById('closeEditModalButton');
   
    const cancelEditButton = document.getElementById('cancelEditButton');
   
    const editActivityForm = document.getElementById('editActivityForm');


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
        editActivityForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const activityTitle = document.getElementById('editActivityTitle').value;
            
            const activityColor = document.getElementById('editActivityColor').value;
            
            const activityDate = document.getElementById('editActivityDate').value;
            
            const activityStartTime = document.getElementById('editActivityStartTime').value;    
            
            const activityEndTime = document.getElementById('editActivityEndTime').value;
        
            const repeatWeekly = document.getElementById('editRepeatWeekly').checked;
            
            const repeatUntilDate = document.getElementById('editRepeatUntilDate').value;

            const updatedActivity = {
                id: currentEventId,
                title: activityTitle,
                color: activityColor,
                date: activityDate,
                startTime: activityStartTime,
                endTime: activityEndTime,
                repeatWeekly: repeatWeekly,
                repeatUntil: repeatUntilDate || null
            };

            await updateActivity(updatedActivity);

            console.log('Activity updated:', updatedActivity);

            closeEditModal();
            await renderCalendar();
            await updateSelectedDayPanel();
            await loadUpcomingEvents();
        });
    }

   
    const createNewButton = document.querySelector('.create_new_button');
   
    if (createNewButton) {
   
        createNewButton.addEventListener('click', function() {
   
            window.location.href = '/pages/note_editor.html';
        });
    }

   
    await renderCalendar();
});



async function saveActivity(activity) {

    try {

        const result = await createEvent(activity);
        
        console.log('Activity saved to database:', result);
        
        showSuccess('Activity added successfully!');
    }
    
    catch (error) {
    
        console.error('Error saving activity:', error);
    
        console.error('Activity data:', activity);
    
        showError('Failed to save activity: ' + (error.message || 'Something went wrong'));
    
        throw error;
    }
}

async function getActivities() {
    try {
        const response = await getUserEvents();
        
        return response.events || [];
    } 
    catch (error) {
    
        console.error('Error getting activities:', error);
    
        return [];
    }
}

async function updateActivity(updatedActivity) {
    try {
        await updateEvent(updatedActivity.id, updatedActivity);
        console.log('Activity updated in database');
    } catch (error) {
        console.error('Error updating activity:', error);
        showError('Failed to update activity: ' + error.message);
    }
}

async function deleteActivity(eventId) {
    try {
        await deleteEvent(eventId);
        console.log('Event deleted from database');
    } catch (error) {
        console.error('Error deleting event:', error);
        showError('Failed to delete event: ' + error.message);
    }
}


async function getEventsForDate(date) {

    const activities = await getActivities();

    return getEventsForDateSync(date, activities);

}


function getEventsForDateSync(date, activities) {
    const events = [];
    

    const targetDate = new Date(date);

    targetDate.setHours(0, 0, 0, 0);

    activities.forEach(activity => {
        
        
        let activityDate;
        
        let activityDateStr = String(activity.date || '');
        
        if (activityDateStr.includes('T')) {
            
            activityDate = new Date(activityDateStr);
        }
         else {
            

            activityDate = new Date(activityDateStr + 'T00:00:00');
        }
        
        
        if (isNaN(activityDate.getTime())) return;
        
        activityDate.setHours(0, 0, 0, 0);

        if (activity.repeatWeekly) {
            
            
            if (activityDate.getDay() === targetDate.getDay()) {
                
                
                if (targetDate >= activityDate) {
                   
                    
                    if (activity.repeatUntil) {
                        let endDateStr = String(activity.repeatUntil || '');
                        let endDate;
                        if (endDateStr.includes('T')) {
                            endDate = new Date(endDateStr);
                        } else {
                            endDate = new Date(endDateStr + 'T23:59:59');
                        }
                        if (!isNaN(endDate.getTime()) && targetDate <= endDate) {
                            events.push(activity);
                        }
                    } else {
                       
                        events.push(activity);
                    }
                }
            }
        } else {
            
            if (activityDate.toDateString() === targetDate.toDateString()) {
                events.push(activity);
            }
        }
    });

    return events;
}


async function showEventDetails(eventId) {

    const activities = await getActivities();

    const event = activities.find(a => a.id === eventId);

    if (!event) return;

    currentEventId = eventId;

    
    document.getElementById('eventDetailsTitle').textContent = event.title;


    
    let eventDateStr = event.date;
    
    if (typeof eventDateStr === 'string' && eventDateStr.includes('T')) {
        eventDateStr = eventDateStr.split('T')[0];
    }
    
    const eventDate = new Date(eventDateStr + 'T00:00:00');
    
    if (eventDate && !isNaN(eventDate.getTime())) {
        document.getElementById('eventDate').textContent = eventDate.toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        });
    } else {
        document.getElementById('eventDate').textContent = 'Date not available';
    }

    document.getElementById('eventTime').textContent = `${event.startTime || ''} - ${event.endTime || ''}`;

    if (event.repeatWeekly) {
        let recurringText = 'Repeats weekly';
        if (event.repeatUntil) {
            let untilDateStr = event.repeatUntil;
            if (typeof untilDateStr === 'string' && untilDateStr.includes('T')) {
                untilDateStr = untilDateStr.split('T')[0];
            }
            const untilDate = new Date(untilDateStr + 'T00:00:00');
            if (untilDate && !isNaN(untilDate.getTime())) {
                recurringText += ` until ${untilDate.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                })}`;
            }
        }
        document.getElementById('eventRecurring').textContent = recurringText;
    } else {
        document.getElementById('eventRecurring').textContent = 'Does not repeat';
    }

   
    const eventDetailsModal = document.getElementById('eventDetailsModal');
    eventDetailsModal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}


async function openEditModal(eventId) {

    const activities = await getActivities();

    const event = activities.find(a => a.id === eventId);

    if (!event) return;

    currentEventId = eventId;

    
    document.getElementById('editActivityTitle').value = event.title;
    
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

    
    const editActivityModal = document.getElementById('editActivityModal');
    editActivityModal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}


async function renderCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    
    const monthDisplay = document.querySelector('.current_month');
    if (monthDisplay) {
        monthDisplay.textContent = `${monthNames[month]} ${year}`;
    }

   
    const firstDay = new Date(year, month, 1).getDay();
   
    const daysInMonth = new Date(year, month + 1, 0).getDate();
   
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    
    const calendarGrid = document.querySelector('.calendar_grid');
    if (!calendarGrid) return;

   
    calendarGrid.innerHTML = '';

    
    const allActivities = await getActivities();

    
    for (let i = firstDay - 1; i >= 0; i--) {
        const day = daysInPrevMonth - i;
        const dayElement = createDayElement(day, true, year, month - 1, allActivities);
        calendarGrid.appendChild(dayElement);
    }

   
    for (let day = 1; day <= daysInMonth; day++) {
        const dayElement = createDayElement(day, false, year, month, allActivities);
        calendarGrid.appendChild(dayElement);
    }

   
    const totalCells = calendarGrid.children.length;
    const remainingCells = 35 - totalCells;

    for (let day = 1; day <= remainingCells; day++) {
        const dayElement = createDayElement(day, true, year, month + 1, allActivities);
        calendarGrid.appendChild(dayElement);
    }
}


function createDayElement(day, isOtherMonth, year, month, allActivities) {
    const dayElement = document.createElement('div');
    dayElement.className = 'calendar_day';

    if (isOtherMonth) {
        dayElement.classList.add('other_month');
    }

   
    const today = new Date();
    const isToday = !isOtherMonth &&
                    day === today.getDate() &&
                    month === today.getMonth() &&
                    year === today.getFullYear();

    if (isToday) {
        dayElement.classList.add('today');
    }

 
    const dayNumber = document.createElement('span');
 
    dayNumber.className = 'day_number';
 
    dayNumber.textContent = day;
 
    dayElement.appendChild(dayNumber);


    const dayDate = new Date(year, month, day);
    const events = getEventsForDateSync(dayDate, allActivities);

    if (events.length > 0) {
        const eventDotsContainer = document.createElement('div');
        eventDotsContainer.className = 'event_dots';
        eventDotsContainer.style.display = 'flex';
        eventDotsContainer.style.gap = '3px';
        eventDotsContainer.style.justifyContent = 'center';
        eventDotsContainer.style.marginTop = '4px';

        
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

   
    dayElement.addEventListener('click', async function() {
        selectedDate = new Date(year, month, day);
        await updateSelectedDayPanel();

       
        document.querySelectorAll('.calendar_day').forEach(el => {
            el.style.outline = 'none';
        });

       
        dayElement.style.outline = '2px solid #00B7B5';
    });

    return dayElement;
}


async function updateSelectedDayPanel() {
    const dayTitle = document.querySelector('.day_details_widget .widget_title');

    if (dayTitle) {
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      

        const dayName = dayNames[selectedDate.getDay()];
      
        const monthName = monthNames[selectedDate.getMonth()];
      
        const date = selectedDate.getDate();

        dayTitle.textContent = `${dayName}, ${monthName} ${date}`;
    }



    const activitiesList = document.querySelector('.activities_list');

    if (activitiesList) {

        const events = await getEventsForDate(selectedDate);

        if (events.length === 0) {
            activitiesList.innerHTML = '<p style="color: #86868B; text-align: center; padding: 20px;">No activities scheduled for this day.</p>';
        } else {
            activitiesList.innerHTML = '';

            events.forEach(event => {
                const activityItem = document.createElement('div');
                
                
                const colorClassMap = {
                    '#6366F1': 'blue_activity',
                    '#FB923C': 'orange_activity', 
                    '#EC4899': 'pink_activity',
                    '#22C55E': 'green_activity',
                    'blue': 'blue_activity',
                    'orange': 'orange_activity',
                    'pink': 'pink_activity',
                    'green': 'green_activity'
                };
                const colorClass = colorClassMap[event.color] || 'blue_activity';
                
                activityItem.className = `activity_item ${colorClass}`;
               
                activityItem.style.cursor = 'pointer';

                activityItem.innerHTML = `
                    <div class="activity_info">
                        <div class="activity_title">${event.title}</div>
                        <div class="activity_subject">${event.startTime} - ${event.endTime}</div>
                    </div>
                `;

               
                activityItem.addEventListener('click', async function() {
               
                    await showEventDetails(event.id);
               
                });

                activitiesList.appendChild(activityItem);
            });
        }
    }
}



async function loadUpcomingEvents() {
    try {
        const response = await getUserEvents();
        const events = response.events || [];
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        
        const upcomingEvents = events
            .filter(event => {
                const eventDate = new Date(event.date);
                eventDate.setHours(0, 0, 0, 0);
                return eventDate.getTime() >= today.getTime();
            })
            .sort((a, b) => new Date(a.date) - new Date(b.date))
            .slice(0, 5); 
        
        const deadlinesList = document.querySelector('.deadlines_list');
        if (!deadlinesList) return;
        
        
        deadlinesList.innerHTML = '';
        
       
        if (upcomingEvents.length === 0) {
            deadlinesList.innerHTML = '<p style="color: #86868B; font-size: 14px; padding: 12px;">No upcoming events</p>';
            return;
        }
        
       
        upcomingEvents.forEach(evt => {
           
            let dateStr = evt.date;
            if (typeof dateStr === 'string' && dateStr.includes('T')) {
                dateStr = dateStr.split('T')[0];
            }
            const eventDate = new Date(dateStr + 'T00:00:00');
            
            
            if (isNaN(eventDate.getTime())) return;
            
            const day = eventDate.getDate();
            const month = monthShortNames[eventDate.getMonth()];
            
            const deadlineItem = document.createElement('div');
            
            deadlineItem.className = 'deadline_item';
            
            deadlineItem.dataset.eventId = evt.id;
            
            
            const dateDiv = document.createElement('div');
            dateDiv.className = 'deadline_date';
            dateDiv.innerHTML = `
                <div class="date_day">${day}</div>
                <div class="date_month">${month}</div>
            `;
            
           
            const infoDiv = document.createElement('div');
           
            infoDiv.className = 'deadline_info';
            
            const titleDiv = document.createElement('div');
           
            titleDiv.className = 'deadline_title';
           
            titleDiv.textContent = evt.title;
            
          
            const eventType = evt.type || 'task';
            let typeClass = 'lessons_type'; 
            if (eventType === 'assignment' || eventType === 'assignments') {
                typeClass = 'assignments_type'; 
            } else if (eventType === 'test' || eventType === 'exam') {
                typeClass = 'test_type';
            }
            
            const typeDiv = document.createElement('div');
            typeDiv.className = `deadline_type ${typeClass}`;
            typeDiv.textContent = eventType.charAt(0).toUpperCase() + eventType.slice(1);
            
            infoDiv.appendChild(titleDiv);
            infoDiv.appendChild(typeDiv);
            
            deadlineItem.appendChild(dateDiv);
            deadlineItem.appendChild(infoDiv);
            
           
            deadlineItem.addEventListener('click', async function() {
                await showEventDetails(evt.id);
            });
            
            deadlinesList.appendChild(deadlineItem);
        });
        
    } catch (error) {
        console.error('Error loading upcoming events:', error);
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
