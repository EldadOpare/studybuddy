
// My check to validate if the account has admin access
if (!requireAdmin()) {
    
}

// Cloudinary configuration for the profile pictures
const CLOUDINARY_CLOUD_NAME = 'dbx5yulyl';

const CLOUDINARY_UPLOAD_PRESET = 'studybuddy';



document.addEventListener('DOMContentLoaded', function() {

    
    loadAdminProfile();

    // Profile picture upload button
    const uploadButton = document.getElementById('uploadButton');
    
    const profilePicture = document.getElementById('profilePicture');

    if (uploadButton) {
        uploadButton.addEventListener('click', function() {

            // This is a Cloudinary upload widget I created
            const widget = cloudinary.createUploadWidget(
                {
                    cloudName: CLOUDINARY_CLOUD_NAME,
                    
                    uploadPreset: CLOUDINARY_UPLOAD_PRESET,
                    
                    sources: ['local', 'camera'],
                    
                    multiple: false,
                    
                    maxFileSize: 5000000,
                    clientAllowedFormats: ['png', 'jpg', 'jpeg','avg','gif', 'avif'],
                    
                    cropping: true,
                    
                    croppingAspectRatio: 1,
                    
                    croppingShowDimensions: true,
                    
                    showSkipCropButton: false
                },
                
                async function(error, result) {
                    
                    if (!error && result && result.event === 'success') {
                        
                        profilePicture.src = result.info.secure_url;
                        
                        console.log('Image uploaded successfully:', result.info.secure_url);

                        // Saving the user's profile picture URL to the database
                        await saveProfilePicture(result.info.secure_url);
                    }
                }
            );

            widget.open();
        });
    }


    
    const menuItems = document.querySelectorAll('.settings_menu_item');
    
    const profileSection = document.getElementById('profileSection');
    
    const securitySection = document.getElementById('securitySection');

    menuItems.forEach(function(item) {
    
        item.addEventListener('click', function(e) {
    
            e.preventDefault();

          
            menuItems.forEach(function(el) {
                el.classList.remove('active');
            });

            
            item.classList.add('active');

            
            const href = item.getAttribute('href');

            if (href === '#profile') {
                profileSection.style.display = 'block';
                
                securitySection.style.display = 'none';
            }
            
            else if (href === '#security') {
                profileSection.style.display = 'none';
                
                securitySection.style.display = 'block';
            }
        });
    });


    
    const profileForm = document.getElementById('profileForm');

    if (profileForm) {
        
        profileForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            
            const firstName = profileForm.querySelector('input[placeholder="Enter first name"]').value;
            const lastName = profileForm.querySelector('input[placeholder="Enter last name"]').value;
            const email = profileForm.querySelector('input[type="email"]').value;
            const bio = profileForm.querySelector('textarea').value;

            try {
                await updateUserProfile({
                    firstName,
                    lastName,
                    email,
                    bio
                });

                
                const userData = getUserData();
                
                userData.firstName = firstName;
                
                userData.lastName = lastName;
                
                userData.email = email;
                
                userData.bio = bio;
                
                saveUserData(userData);

                showSuccess('Profile updated successfully!');

                
                window.location.reload();

            } catch (error) {
                console.error('Error updating admin profile:', error);
                showError('Failed to update profile: ' + error.message);
            }
        });
    }


   
    const passwordForm = document.getElementById('passwordForm');

    if (passwordForm) {
        passwordForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            
            const inputs = passwordForm.querySelectorAll('input[type="password"]');
            
            const currentPassword = inputs[0].value;
            
            const newPassword = inputs[1].value;
            
            const confirmPassword = inputs[2].value;

            
            if (!currentPassword || !newPassword || !confirmPassword) {
                showWarning('Please fill in all password fields');
                return;
            }

            if (newPassword !== confirmPassword) {
                showWarning('New passwords do not match');
                return;
            }

            if (newPassword.length < 8) {
                showWarning('New password must be at least 8 characters long');
                return;
            }

            try {
                await updateUserProfile({
                    currentPassword,
                    newPassword
                });

                showSuccess('Password updated successfully!');
                passwordForm.reset();

            } catch (error) {
                console.error('Error updating password:', error);
                showError('Failed to update password: ' + error.message);
            }
        });
    }



    const cancelButtons = document.querySelectorAll('.cancel_button');

    cancelButtons.forEach(function(button) {
        button.addEventListener('click', function() {
            const form = button.closest('form');
            if (form && form.id === 'profileForm') {
                loadAdminProfile();
            } else if (form) {
                form.reset();
            }
        });
    });


    // Delete account button
    const deleteButton = document.querySelector('.delete_account_button');

    if (deleteButton) {
        deleteButton.addEventListener('click', function() {
            showConfirmDialog('Are you sure you want to delete your admin account? This action cannot be undone.', () => {
                // Here you would call your API to delete the account
                console.log('Deleting admin account...');
                showInfo('Account deletion would happen here');
            });
        });
    }

});


// Load admin profile data from database
async function loadAdminProfile() {
    try {
        const userData = getUserData();

        if (userData) {
            // Update profile display at top
            const profileName = document.querySelector('.profile_name');
            const profileEmail = document.querySelector('.profile_email');

            if (profileName) {
                profileName.textContent = `${userData.firstName || ''} ${userData.lastName || ''}`.trim();
            }
            if (profileEmail) {
                profileEmail.textContent = userData.email || '';
            }

            // Populate form fields
            const firstNameInput = document.querySelector('#profileForm input[placeholder="Enter first name"]');
            const lastNameInput = document.querySelector('#profileForm input[placeholder="Enter last name"]');
            const emailInput = document.querySelector('#profileForm input[type="email"]');
            const bioInput = document.querySelector('#profileForm textarea');
            const profilePicture = document.getElementById('profilePicture');

            if (firstNameInput) firstNameInput.value = userData.firstName || '';
            if (lastNameInput) lastNameInput.value = userData.lastName || '';
            if (emailInput) emailInput.value = userData.email || '';
            if (bioInput) bioInput.value = userData.bio || '';

            if (profilePicture && userData.profilePicture) {
                profilePicture.src = userData.profilePicture;
            }
        }

    } catch (error) {
        console.error('Error loading admin profile:', error);
    }
}


// Function to save profile picture URL to database
async function saveProfilePicture(imageUrl) {
    try {
        await updateUserProfile({ profilePicture: imageUrl });

        const userData = getUserData();
        userData.profilePicture = imageUrl;
        saveUserData(userData);

        console.log('Profile picture saved successfully');
    } catch (error) {
        console.error('Error saving profile picture:', error);
        showError('Failed to save profile picture');
    }
}
