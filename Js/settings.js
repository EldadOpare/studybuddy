// Logout function
function logout() {
    // Clear any stored session data if you're using localStorage/sessionStorage
    // localStorage.clear();
    // sessionStorage.clear();

    // Redirect to login page
    window.location.href = 'login.html';
}

// Cloudinary configuration for profile pictures
const CLOUDINARY_CLOUD_NAME = 'dbx5yulyl';
const CLOUDINARY_UPLOAD_PRESET = 'studybuddy';

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {

    // Profile picture upload button
    const uploadButton = document.getElementById('uploadButton');
    const profilePicture = document.getElementById('profilePicture');

    if (uploadButton) {
        uploadButton.addEventListener('click', function() {
            // Create Cloudinary upload widget
            const widget = cloudinary.createUploadWidget(
                {
                    cloudName: CLOUDINARY_CLOUD_NAME,
                    uploadPreset: CLOUDINARY_UPLOAD_PRESET,
                    sources: ['local', 'camera'],
                    multiple: false,
                    maxFileSize: 5000000,
                    clientAllowedFormats: ['png', 'jpg', 'jpeg'],
                    cropping: true,
                    croppingAspectRatio: 1,
                    croppingShowDimensions: true,
                    showSkipCropButton: false
                },
                function(error, result) {
                    if (!error && result && result.event === 'success') {
                        // Update profile picture with uploaded image
                        profilePicture.src = result.info.secure_url;
                        console.log('Image uploaded successfully:', result.info.secure_url);

                        // Here you would save the image URL to your database
                        // saveProfilePicture(result.info.secure_url);
                    }
                }
            );

            widget.open();
        });
    }


    // Settings menu navigation
    const menuItems = document.querySelectorAll('.settings_menu_item');
    const profileSection = document.getElementById('profileSection');
    const securitySection = document.getElementById('securitySection');

    menuItems.forEach(function(item) {
        item.addEventListener('click', function(e) {
            e.preventDefault();

            // Remove active class from all items
            menuItems.forEach(function(el) {
                el.classList.remove('active');
            });

            // Add active class to clicked item
            item.classList.add('active');

            // Show/hide sections based on which menu item was clicked
            const href = item.getAttribute('href');

            if (href === '#profile') {
                profileSection.style.display = 'block';
                securitySection.style.display = 'none';
            } else if (href === '#security') {
                profileSection.style.display = 'none';
                securitySection.style.display = 'block';
            }
        });
    });


    // Profile form submission
    const profileForm = document.getElementById('profileForm');

    if (profileForm) {
        profileForm.addEventListener('submit', function(e) {
            e.preventDefault();

            // Get form values
            const firstName = profileForm.querySelector('input[placeholder="Enter first name"]').value;
            const lastName = profileForm.querySelector('input[placeholder="Enter last name"]').value;
            const email = profileForm.querySelector('input[type="email"]').value;
            const bio = profileForm.querySelector('textarea').value;

            // Here you would save the data to your database
            console.log('Saving profile:', { firstName, lastName, email, bio });

            alert('Profile updated successfully!');
        });
    }


    // Password form submission
    const passwordForm = document.getElementById('passwordForm');

    if (passwordForm) {
        passwordForm.addEventListener('submit', function(e) {
            e.preventDefault();

            // Get password values
            const inputs = passwordForm.querySelectorAll('input[type="password"]');
            const currentPassword = inputs[0].value;
            const newPassword = inputs[1].value;
            const confirmPassword = inputs[2].value;

            // Basic validation
            if (!currentPassword || !newPassword || !confirmPassword) {
                alert('Please fill in all password fields');
                return;
            }

            if (newPassword !== confirmPassword) {
                alert('New passwords do not match');
                return;
            }

            if (newPassword.length < 8) {
                alert('New password must be at least 8 characters long');
                return;
            }

            // Here you would send the password update to your backend
            console.log('Updating password...');
            alert('Password updated successfully!');

            // Clear the form
            passwordForm.reset();
        });
    }


    // Cancel buttons
    const cancelButtons = document.querySelectorAll('.cancel_button');

    cancelButtons.forEach(function(button) {
        button.addEventListener('click', function() {
            const form = button.closest('form');
            if (form) {
                form.reset();
            }
        });
    });


    // Delete account button
    const deleteButton = document.querySelector('.delete_account_button');

    if (deleteButton) {
        deleteButton.addEventListener('click', function() {
            const confirmed = confirm('Are you sure you want to delete your account? This action cannot be undone.');

            if (confirmed) {
                // Here you would call your API to delete the account
                console.log('Deleting account...');
                alert('Account deletion would happen here');
            }
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

});


// Function to save profile picture URL to database
// This is a placeholder - you'll implement this when you have your backend
function saveProfilePicture(imageUrl) {
    // Example:
    // fetch('/api/user/profile-picture', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({ profilePicture: imageUrl })
    // })
    // .then(response => response.json())
    // .then(data => console.log('Profile picture saved:', data))
    // .catch(error => console.error('Error:', error));
}
