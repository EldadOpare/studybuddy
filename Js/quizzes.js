// Logout function
function logout() {
    // Redirect to login page
    window.location.href = 'login.html';
}


// Run when page loads
document.addEventListener('DOMContentLoaded', function() {

    console.log('Quizzes page loaded');


    // Modal elements
    const folderModal = document.getElementById('createFolderModal');
    const addFolderButton = document.querySelector('.add_folder_button');
    const closeFolderModalButton = document.getElementById('closeFolderModalButton');
    const cancelFolderModalButton = document.getElementById('cancelFolderModalButton');
    const createFolderForm = document.getElementById('createFolderForm');


    // Open folder modal when add folder button is clicked
    if (addFolderButton) {
        addFolderButton.addEventListener('click', function() {
            folderModal.style.display = 'flex';
        });
    }


    // Close folder modal
    if (closeFolderModalButton) {
        closeFolderModalButton.addEventListener('click', function() {
            folderModal.style.display = 'none';
        });
    }

    if (cancelFolderModalButton) {
        cancelFolderModalButton.addEventListener('click', function() {
            folderModal.style.display = 'none';
        });
    }


    // Close modal when clicking outside
    if (folderModal) {
        folderModal.addEventListener('click', function(e) {
            if (e.target === folderModal) {
                folderModal.style.display = 'none';
            }
        });
    }


    // Handle folder form submission
    if (createFolderForm) {
        createFolderForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const folderName = document.getElementById('folderName').value;
            const selectedColor = document.querySelector('input[name="folderColor"]:checked').value;

            console.log('Creating folder:', folderName, 'with color:', selectedColor);

            // Close modal and reset form
            folderModal.style.display = 'none';
            createFolderForm.reset();
        });
    }

});
