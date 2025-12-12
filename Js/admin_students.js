

if (!requireAdmin()) {

}



let allUsers = [];


let currentUserId = null;



async function viewStudent(studentId) {
    const modal = document.getElementById('studentDetailModal');

    try {
        const response = await getUserById(studentId);
        const student = response.user;

        if (student) {
            
            currentUserId = studentId;

            
            document.getElementById('studentName').textContent = student.firstName + ' ' + student.lastName;
            
            document.getElementById('studentEmail').textContent = student.email;
            
            document.getElementById('studentFiles').textContent = student.fileCount || 0;
            
            document.getElementById('studentNotes').textContent = student.noteCount || 0;
            
            document.getElementById('studentQuizzes').textContent = student.quizCount || 0;
            
            
            const avatarElement = document.getElementById('studentAvatar');
            
            if (avatarElement) {
            
                avatarElement.src = student.profilePicture || '../images/user.jpg';
            
            }

           
            modal.style.display = 'flex';
        }

    } 
    catch (error) {
    
        console.error('Error loading student details:', error);
    
        showError('Failed to load student details');
    }
}



document.addEventListener('DOMContentLoaded', function() {

    console.log('Admin users page loaded');


   
    const modal = document.getElementById('studentDetailModal');
   
    const closeModalButton = document.getElementById('closeStudentModal');
   
    const closeModalFooterButton = document.getElementById('closeStudentModalButton');
   
    const deleteUserButton = document.getElementById('deleteUserButton');


    
    const searchInput = document.getElementById('studentSearch');
    
    if (searchInput) {
    
    
        searchInput.addEventListener('input', function(e) {
            const searchTerm = e.target.value.toLowerCase();
    
            const rows = document.querySelectorAll('.student_row');

            rows.forEach(function(row) {
    
                const name = row.querySelector('.name_cell span').textContent.toLowerCase();
    
                const email = row.querySelectorAll('td')[1].textContent.toLowerCase();

               
                if (name.includes(searchTerm) || email.includes(searchTerm)) {
    
                    row.style.display = '';
    
                } else {
    
                    row.style.display = 'none';
                }
            });
        });
    }



    if (closeModalButton) {

        closeModalButton.addEventListener('click', function() {

            modal.style.display = 'none';

        });
    }



    if (closeModalFooterButton) {

        closeModalFooterButton.addEventListener('click', function() {

            modal.style.display = 'none';

        });
    }



    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    }


 
    if (deleteUserButton) {
        deleteUserButton.addEventListener('click', function() {
            if (!currentUserId) {
                return;
            }

            const userName = document.getElementById('studentName').textContent;

            // Confirmation dialog
            showConfirmDialog(`Are you sure you want to delete ${userName}'s account? This action cannot be undone.`, async () => {
                try {
                    await deleteUser(currentUserId);

                    // Remove the user from the table
                    const userRow = document.querySelector(`.student_row[data-student-id="${currentUserId}"]`);
                    if (userRow) {
                        userRow.remove();
                    }

                    // Close the modal
                    modal.style.display = 'none';

                    // Show success message
                    showSuccess(`${userName}'s account has been deleted successfully.`);

                    // Reset current user ID
                    currentUserId = null;

                    // Reload the users list
                    await loadAllUsers();

                } catch (error) {
                    console.error('Error deleting user:', error);
                    showError('Failed to delete user: ' + error.message);
                }
            });
        });
    }

    // Load all users on page load
    loadAllUsers();
});


// Load all users from database
async function loadAllUsers() {
    try {
        console.log('Loading all users...');
        const response = await getAllUsers();
        
        if (response && response.users) {
            allUsers = response.users;
            console.log('Users loaded:', allUsers.length, 'users found');
        } else {
            allUsers = [];
            console.log('No users data received');
        }

        const tableBody = document.querySelector('.students_table_body');
        if (!tableBody) {
            console.error('Students table body not found');
            return;
        }

        
        tableBody.innerHTML = '';

        if (allUsers.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 40px; color: #86868B;">No users found</td></tr>';
            return;
        }

       
        allUsers.forEach(user => {
            const row = document.createElement('tr');
       
            row.className = 'student_row';
       
            row.setAttribute('data-student-id', user.id);

            const firstName = user.firstName || user.first_name || '';
       
            const lastName = user.lastName || user.last_name || '';
       
            const fullName = `${firstName} ${lastName}`.trim();
            
            const initials = firstName ? firstName.charAt(0).toUpperCase() : 'U';

            row.innerHTML = `
                <td class="name_cell">
                    <div class="user_avatar">${initials}</div>
                    <span>${fullName || 'Unknown User'}</span>
                </td>
                <td>${user.email || ''}</td>
                <td>${user.noteCount || 0}</td>
                <td>${user.quizCount || 0}</td>
                <td>
                    <button class="view_button" onclick="viewStudent(${user.id})">View</button>
                </td>
            `;

            tableBody.appendChild(row);
        });

        console.log('User table populated successfully');

    } catch (error) {
        console.error('Error loading users:', error);
        
        const tableBody = document.querySelector('.students_table_body');
       
        if (tableBody) {
       
            tableBody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 40px; color: #F75A5A;">Failed to load users. Please check server connection.</td></tr>';
       
        }
    }
}
