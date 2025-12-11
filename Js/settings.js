if (!requireAuth()) {

}


const CLOUDINARY_CLOUD_NAME = 'dbx5yulyl';
const CLOUDINARY_UPLOAD_PRESET = 'studybuddy';


document.addEventListener('DOMContentLoaded', async function() {

    await loadFoldersToSidebar();
    await loadUserProfile();

    setupProfilePictureUpload();
    setupSettingsNavigation();
    setupProfileForm();
    setupPasswordForm();
    setupDeleteAccount();
    setupFolderModal();

    const createNewButton = document.querySelector('.create_new_button');
    if (createNewButton) {
        createNewButton.addEventListener('click', function() {
            window.location.href = '/pages/note_editor.html';
        });
    }
});


function setupFolderModal() {
    const modal = document.getElementById('createFolderModal');
    const closeButton = document.getElementById('closeFolderModalButton');
    const cancelButton = document.getElementById('cancelFolderModalButton');
    const formElement = document.getElementById('createFolderForm');

    if (closeButton) {
        closeButton.addEventListener('click', closeFolderModal);
    }

    if (cancelButton) {
        cancelButton.addEventListener('click', closeFolderModal);
    }

    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeFolderModal();
            }
        });
    }

    if (formElement) {
        formElement.addEventListener('submit', handleCreateFolder);
    }
}


async function loadUserProfile() {
    try {
        const currentUserData = getUserData();

        if (currentUserData) {

            const profileName = document.querySelector('.profile_name');
            const profileEmail = document.querySelector('.profile_email');

            if (profileName) {
                profileName.textContent = `${currentUserData.firstName || ''} ${currentUserData.lastName || ''}`.trim();
            }
            if (profileEmail) {
                profileEmail.textContent = currentUserData.email || '';
            }

            const firstNameInput = document.querySelector('#profileForm input[placeholder="Enter first name"]');
            const lastNameInput = document.querySelector('#profileForm input[placeholder="Enter last name"]');
            const emailInput = document.querySelector('#profileForm input[type="email"]');
            const bioInput = document.querySelector('#profileForm textarea');
            const profilePicture = document.getElementById('profilePicture');

            if (firstNameInput) firstNameInput.value = currentUserData.firstName || '';
            if (lastNameInput) lastNameInput.value = currentUserData.lastName || '';
            if (emailInput) emailInput.value = currentUserData.email || '';
            if (bioInput) bioInput.value = currentUserData.bio || '';

            if (profilePicture && currentUserData.profilePicture) {
                profilePicture.src = currentUserData.profilePicture;
            }
        }

    } catch (loadingError) {
        console.error('Error loading profile:', loadingError);
    }
}


function setupProfilePictureUpload() {
    const uploadButton = document.getElementById('uploadButton');
    const profilePicture = document.getElementById('profilePicture');

    if (uploadButton) {
        uploadButton.addEventListener('click', function() {
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
                async function(uploadError, uploadResult) {
                    if (!uploadError && uploadResult && uploadResult.event === 'success') {
                        const uploadedImageUrl = uploadResult.info.secure_url;

                        if (profilePicture) {
                            profilePicture.src = uploadedImageUrl;
                        }

                        try {
                            await updateUserProfile({ profilePicture: uploadedImageUrl });

                            const currentUserData = getUserData();
                            currentUserData.profilePicture = uploadedImageUrl;
                            saveUserData(currentUserData);

                            const allProfilePics = document.querySelectorAll('.profile_picture');
                            allProfilePics.forEach(pic => {
                                pic.src = uploadedImageUrl;
                            });

                            console.log('Profile picture updated successfully');

                        } catch (saveError) {
                            console.error('Error saving profile picture:', saveError);
                            showError('Failed to save profile picture');
                        }
                    }
                }
            );

            widget.open();
        });
    }
}


function setupSettingsNavigation() {
    const menuItems = document.querySelectorAll('.settings_menu_item');
    const profileSection = document.getElementById('profileSection');
    const securitySection = document.getElementById('securitySection');

    menuItems.forEach(function(menuItem) {
        menuItem.addEventListener('click', function(e) {
            e.preventDefault();

            menuItems.forEach(function(item) {
                item.classList.remove('active');
            });

            menuItem.classList.add('active');

            const sectionLink = menuItem.getAttribute('href');

            if (sectionLink === '#profile') {
                profileSection.style.display = 'block';
                securitySection.style.display = 'none';
            } else if (sectionLink === '#security') {
                profileSection.style.display = 'none';
                securitySection.style.display = 'block';
            }
        });
    });
}


function setupProfileForm() {
    const profileForm = document.getElementById('profileForm');

    if (profileForm) {
        profileForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const updatedFirstName = profileForm.querySelector('input[placeholder="Enter first name"]').value;
            const updatedLastName = profileForm.querySelector('input[placeholder="Enter last name"]').value;
            const updatedEmail = profileForm.querySelector('input[type="email"]').value;
            const updatedBio = profileForm.querySelector('textarea').value;

            try {
                await updateUserProfile({
                    firstName: updatedFirstName,
                    lastName: updatedLastName,
                    email: updatedEmail,
                    bio: updatedBio
                });

                const currentUserData = getUserData();
                currentUserData.firstName = updatedFirstName;
                currentUserData.lastName = updatedLastName;
                currentUserData.email = updatedEmail;
                currentUserData.bio = updatedBio;
                saveUserData(currentUserData);

                showSuccess('Profile updated successfully!');

            } catch (updateError) {
                console.error('Error updating profile:', updateError);
                showError('Failed to update profile: ' + updateError.message);
            }
        });
    }


    const cancelButtons = document.querySelectorAll('.cancel_button');
    cancelButtons.forEach(function(cancelButton) {
        cancelButton.addEventListener('click', function() {
            const parentForm = cancelButton.closest('form');
            if (parentForm) {
                loadUserProfile();
            }
        });
    });
}


function setupPasswordForm() {
    const passwordForm = document.getElementById('passwordForm');

    if (passwordForm) {
        passwordForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const passwordInputs = passwordForm.querySelectorAll('input[type="password"]');
            const existingPassword = passwordInputs[0].value;
            const newPasswordValue = passwordInputs[1].value;
            const confirmPasswordValue = passwordInputs[2].value;

            if (!existingPassword || !newPasswordValue || !confirmPasswordValue) {
                showWarning('Please fill in all password fields');
                return;
            }

            if (newPasswordValue !== confirmPasswordValue) {
                showWarning('New passwords do not match');
                return;
            }

            if (newPasswordValue.length < 8) {
                showWarning('New password must be at least 8 characters long');
                return;
            }

            try {
                await updateUserProfile({
                    currentPassword: existingPassword,
                    newPassword: newPasswordValue
                });

                showSuccess('Password updated successfully!');
                passwordForm.reset();

            } catch (passwordUpdateError) {
                console.error('Error updating password:', passwordUpdateError);
                showError('Failed to update password: ' + passwordUpdateError.message);
            }
        });
    }
}


function setupDeleteAccount() {
    const deleteButton = document.querySelector('.delete_account_button');

    if (deleteButton) {
        deleteButton.addEventListener('click', function() {
            showConfirmDialog('Are you sure you want to delete your account? This action cannot be undone.', () => {
                showConfirmDialog('This will permanently delete all your data. Are you absolutely sure?', async () => {
                    try {

                        await makeAuthApiCall('/users/delete', {
                            method: 'DELETE'
                        });

                        showSuccess('Account deleted successfully');
                        logout();

                    } catch (deletionError) {
                        console.error('Error deleting account:', deletionError);
                        showError('Failed to delete account: ' + deletionError.message);
                    }
                });
            });
        });
    }
}
