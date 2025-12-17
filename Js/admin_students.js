
// I made sure only admins can access this page
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
    
    
        showError('Failed to load student details');
    }
}



document.addEventListener('DOMContentLoaded', function() {


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

            
            showConfirmDialog(
                'Delete User Account',
                `Are you sure you want to delete <b>${userName}</b>'s account? This action cannot be undone.`,
                async () => {
                    try {
                        await deleteUser(currentUserId);

                        
                        const userRow = document.querySelector(`.student_row[data-student-id="${currentUserId}"]`);
                        if (userRow) {
                            userRow.remove();
                        }

                        
                        modal.style.display = 'none';

                       
                        showSuccess(`${userName}'s account has been deleted successfully.`);

                        
                        currentUserId = null;

                        
                        await loadAllUsers();

                    } catch (error) {
                        showError('Failed to delete user: ' + error.message);
                    }
                }
            );
        });
    }

    // Load all users on page load
    loadAllUsers();
});



async function loadAllUsers() {
    try {
        const response = await getAllUsers();
        
        if (response && response.users) {
            allUsers = response.users;
        } else {
            allUsers = [];
        }

        const tableBody = document.querySelector('.students_table_body');
        if (!tableBody) {
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

            // I created each table row with the user's information
            row.innerHTML = `
                <td class="name_cell">
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


    } catch (error) {
        
        const tableBody = document.querySelector('.students_table_body');
       
        if (tableBody) {
       
            tableBody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 40px; color: #F75A5A;">Failed to load users. Please check server connection.</td></tr>';
       
        }
    }
}
