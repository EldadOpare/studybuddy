// Logout function
function logout() {
    // Redirect to login page
    window.location.href = 'login.html';
}


// Mock user data for details
const studentsData = {
    1: {
        name: 'John Mensah',
        email: 'john.mensah@student.com',
        files: 12,
        notes: 8,
        quizzes: 5
    },
    2: {
        name: 'Ama Asante',
        email: 'ama.asante@student.com',
        files: 18,
        notes: 15,
        quizzes: 9
    },
    3: {
        name: 'Kwame Boateng',
        email: 'kwame.boateng@student.com',
        files: 7,
        notes: 5,
        quizzes: 3
    },
    4: {
        name: 'Efua Owusu',
        email: 'efua.owusu@student.com',
        files: 21,
        notes: 18,
        quizzes: 12
    },
    5: {
        name: 'Yaw Agyeman',
        email: 'yaw.agyeman@student.com',
        files: 9,
        notes: 6,
        quizzes: 4
    }
};


// Variable to store current viewing user ID
let currentUserId = null;


// View user details function
function viewStudent(studentId) {
    const modal = document.getElementById('studentDetailModal');
    const student = studentsData[studentId];

    if (student) {
        // Store current user ID for delete functionality
        currentUserId = studentId;

        // Fill in the modal with user data
        document.getElementById('studentName').textContent = student.name;
        document.getElementById('studentEmail').textContent = student.email;
        document.getElementById('studentFiles').textContent = student.files;
        document.getElementById('studentNotes').textContent = student.notes;
        document.getElementById('studentQuizzes').textContent = student.quizzes;

        // Show the modal
        modal.style.display = 'flex';
    }
}


// Run when page loads
document.addEventListener('DOMContentLoaded', function() {

    console.log('Admin users page loaded');


    // Modal elements
    const modal = document.getElementById('studentDetailModal');
    const closeModalButton = document.getElementById('closeStudentModal');
    const closeModalFooterButton = document.getElementById('closeStudentModalButton');
    const deleteUserButton = document.getElementById('deleteUserButton');


    // Search functionality
    const searchInput = document.getElementById('studentSearch');
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            const searchTerm = e.target.value.toLowerCase();
            const rows = document.querySelectorAll('.student_row');

            rows.forEach(function(row) {
                const name = row.querySelector('.name_cell span').textContent.toLowerCase();
                const email = row.querySelectorAll('td')[1].textContent.toLowerCase();

                // Show or hide row based on search match
                if (name.includes(searchTerm) || email.includes(searchTerm)) {
                    row.style.display = '';
                } else {
                    row.style.display = 'none';
                }
            });
        });
    }


    // Close modal when X button is clicked
    if (closeModalButton) {
        closeModalButton.addEventListener('click', function() {
            modal.style.display = 'none';
        });
    }


    // Close modal when footer close button is clicked
    if (closeModalFooterButton) {
        closeModalFooterButton.addEventListener('click', function() {
            modal.style.display = 'none';
        });
    }


    // Close modal when clicking outside
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    }


    // Delete user functionality
    if (deleteUserButton) {
        deleteUserButton.addEventListener('click', function() {
            if (!currentUserId) {
                return;
            }

            const user = studentsData[currentUserId];
            const userName = user ? user.name : 'this user';

            // Confirmation dialog
            const confirmed = confirm(`Are you sure you want to delete ${userName}'s account? This action cannot be undone.`);

            if (confirmed) {
                // Here you would call your API to delete the user
                console.log('Deleting user with ID:', currentUserId);

                // Remove the user from the table
                const userRow = document.querySelector(`.student_row[data-student-id="${currentUserId}"]`);
                if (userRow) {
                    userRow.remove();
                }

                // Remove from data
                delete studentsData[currentUserId];

                // Close the modal
                modal.style.display = 'none';

                // Show success message
                alert(`${userName}'s account has been deleted successfully.`);

                // Reset current user ID
                currentUserId = null;
            }
        });
    }

});
