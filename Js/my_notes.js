// Logout function
function logout() {
    // Clear any stored session data if you're using localStorage/sessionStorage
    // localStorage.clear();
    // sessionStorage.clear();

    // Redirect to login page
    window.location.href = 'login.html';
}

// Cloudinary configuration for file uploads
const CLOUDINARY_CLOUD_NAME = 'dbx5yulyl';

const CLOUDINARY_UPLOAD_PRESET = 'studybuddy';

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {

    // Upload modal
    const modal = document.getElementById('uploadFileModal');

    // Browse Files button - Open Cloudinary Upload Widget in browse mode
    const browseFilesBtn = document.getElementById('browseFilesButton');

    if (browseFilesBtn) {
        browseFilesBtn.addEventListener('click', function(e) {
            e.stopPropagation(); // Prevent triggering dropZone click

            // Open Cloudinary Upload Widget configured for browsing existing files
            const widget = cloudinary.createUploadWidget(
                {
                    cloudName: CLOUDINARY_CLOUD_NAME,
                    uploadPreset: CLOUDINARY_UPLOAD_PRESET,
                    sources: ['local', 'url', 'camera', 'dropbox', 'google_drive'],
                    multiple: false,
                    folder: 'studybuddy/materials',
                    showUploadMoreButton: false,
                    clientAllowedFormats: ['pdf', 'doc', 'docx', 'txt', 'png', 'jpg', 'jpeg'],
                    maxFileSize: 10000000
                },
                function(error, result) {
                    if (!error && result && result.event === 'success') {
                        console.log('File selected:', result.info);
                        const fileUrl = result.info.secure_url;
                        const fileName = result.info.original_filename;

                        // You can view or download the file
                        window.open(fileUrl, '_blank');
                    }

                    if (error) {
                        console.error('Error:', error);
                    }
                }
            );

            widget.open();
        });
    }


    // Modal functionality
    const closeModalButton = document.getElementById('closeModalButton');
    
    const cancelModalButton = document.getElementById('cancelModalButton');
    
    const uploadForm = document.getElementById('uploadForm');
    
    const fileUploadArea = document.getElementById('fileUploadArea');
    
    const fileInput = document.getElementById('fileInput');
    
    const uploadedFileInfo = document.getElementById('uploadedFileInfo');
    
    const fileNameDisplay = document.getElementById('fileNameDisplay');
    
    const removeFileButton = document.getElementById('removeFileButton');
    
    const dropZone = document.getElementById('dropZone');


    // Open modal
    function openModal() {
        if (modal) {
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }
    }

    // Close modal
    function closeModal() {
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
            resetForm();
        }
    }

    // Reset form
    function resetForm() {
        if (uploadForm) {
            uploadForm.reset();
        }
        if (uploadedFileInfo) {
            uploadedFileInfo.style.display = 'none';
        }
    }

    // Close modal button
    if (closeModalButton) {
        closeModalButton.addEventListener('click', closeModal);
    }

    // Cancel button
    if (cancelModalButton) {
        cancelModalButton.addEventListener('click', closeModal);
    }

    // Close modal when clicking outside
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeModal();
            }
        });
    }

    // File upload area click
    if (fileUploadArea) {
        fileUploadArea.addEventListener('click', function() {
            fileInput.click();
        });
    }

    // File input change
    if (fileInput) {
        fileInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                displayUploadedFile(file.name);
            }
        });
    }

    // Display uploaded file
    function displayUploadedFile(fileName) {
        if (fileNameDisplay) {
            fileNameDisplay.textContent = fileName;
        }
        if (uploadedFileInfo) {
            uploadedFileInfo.style.display = 'flex';
        }
    }

    // Remove file button
    if (removeFileButton) {
        removeFileButton.addEventListener('click', function() {
            if (fileInput) {
                fileInput.value = '';
            }
            if (uploadedFileInfo) {
                uploadedFileInfo.style.display = 'none';
            }
        });
    }

    // Form submission
    if (uploadForm) {
        uploadForm.addEventListener('submit', function(e) {
            e.preventDefault();

            // Get form values
            const fileName = document.getElementById('fileName').value;
            
            const fileFolder = document.getElementById('fileFolder').value;
            
            const fileTags = document.getElementById('fileTags').value;
            
            const fileDescription = document.getElementById('fileDescription').value;
            
            const file = fileInput.files[0];

            if (!file) {
                alert('Please select a file to upload');
                return;
            }

            console.log('Uploading file:', {
                name: fileName,
                folder: fileFolder,
                tags: fileTags,
                description: fileDescription,
                file: file.name
            });

            // Upload to Cloudinary
            uploadToCloudinary(file, fileName, fileFolder, fileTags, fileDescription);
        });
    }

    // Upload to Cloudinary
    function uploadToCloudinary(file, title, folder, tags, description) {
        const formData = new FormData();
        
        formData.append('file', file);
        
        formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
        
        formData.append('folder', 'studybuddy/materials');

        // Show uploading message
        alert('Uploading file...');

        fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/auto/upload`, {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            console.log('File uploaded:', data);
            saveNoteToDatabase(title, folder, tags, description, data.secure_url);
        })
        .catch(error => {
            console.error('Upload error:', error);
            alert('Upload failed. Please try again.');
        });
    }

    // Save file to database
    function saveFileToDatabase(title, folder, tags, description, fileUrl) {
        // Here you would save to your backend
        console.log('Saving file to database:', {
            title,
            folder,
            tags,
            description,
            fileUrl
        });

        // Show success message
        alert(`File "${title}" uploaded successfully!`);

        // Close modal
        closeModal();

        // Here you would refresh the materials list or add the new item to the UI
    }


    // Click and drag-and-drop functionality for upload section
    if (dropZone) {
        // Click anywhere on upload box to open upload modal
        dropZone.addEventListener('click', function(e) {
            // Don't trigger if clicking the buttons
            if (!e.target.classList.contains('new_note_button') &&
                !e.target.classList.contains('browse_files_button') &&
                e.target.id !== 'browseFilesButton') {
                openModal();
            }
        });

        // Prevent default drag behaviors
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, preventDefaults, false);
        });

        function preventDefaults(e) {
            e.preventDefault();
            e.stopPropagation();
        }

        // Highlight drop zone when dragging over it
        ['dragenter', 'dragover'].forEach(eventName => {
            dropZone.addEventListener(eventName, highlight, false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, unhighlight, false);
        });

        function highlight() {
            dropZone.style.borderColor = '#5E4DB2';
            dropZone.style.backgroundColor = '#F8F8FF';
        }

        function unhighlight() {
            dropZone.style.borderColor = '#CFCFCF';
            dropZone.style.backgroundColor = 'white';
        }

        // Handle dropped files
        dropZone.addEventListener('drop', handleDrop, false);

        function handleDrop(e) {
            const dt = e.dataTransfer;
            const files = dt.files;

            if (files.length > 0) {
                const file = files[0];

                // Check file type
                const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'image/png', 'image/jpeg', 'image/jpg'];

                if (allowedTypes.includes(file.type)) {
                    // Auto-fill the file name
                    document.getElementById('fileName').value = file.name.replace(/\.[^/.]+$/, '');

                    // Set the file to the input
                    const dataTransfer = new DataTransfer();
                    dataTransfer.items.add(file);
                    fileInput.files = dataTransfer.files;

                    // Display uploaded file
                    displayUploadedFile(file.name);

                    // Open modal
                    openModal();
                } else {
                    alert('File type not supported. Please upload PDF, DOC, DOCX, TXT, PNG, or JPG files.');
                }
            }
        }
    }


    // Material row click handling
    const materialRows = document.querySelectorAll('.material_row');

    materialRows.forEach(function(row) {
        row.addEventListener('click', function(e) {
            // Don't trigger if clicking the more button
            if (e.target.classList.contains('more_button')) {
                return;
            }

            // Open note in editor for viewing/editing
            const fileName = row.querySelector('.file_name').textContent;
            console.log('Opening note:', fileName);

            // Navigate to note editor
            window.location.href = 'note_editor.html';
        });
    });


    // More button handling
    const moreButtons = document.querySelectorAll('.more_button');

    moreButtons.forEach(function(button) {
        button.addEventListener('click', function(e) {
            e.stopPropagation();

            // Here you would show a context menu with options like:
            // - Download
            // - Rename
            // - Move to folder
            // - Delete
            alert('More options: Download, Rename, Move, Delete');
        });
    });


    // Search functionality
    const searchInput = document.getElementById('searchInput');

    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            const searchTerm = e.target.value.toLowerCase();
            const rows = document.querySelectorAll('.material_row');

            // Filter materials based on search term
            rows.forEach(function(row) {
                const fileName = row.querySelector('.file_name').textContent.toLowerCase();

                if (fileName.includes(searchTerm)) {
                    row.style.display = 'grid';
                } else {
                    row.style.display = 'none';
                }
            });
        });
    }


    // Folder click handling
    const folderItems = document.querySelectorAll('.folder_item');

    folderItems.forEach(function(folder) {
        folder.addEventListener('click', function(e) {
            e.preventDefault();

            // Remove active class from all folders
            folderItems.forEach(function(item) {
                item.classList.remove('active');
            });

            // Add active class to clicked folder
            folder.classList.add('active');

            // Here you would load materials for the selected folder
            const folderName = folder.textContent.trim();
            console.log('Loading folder:', folderName);
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
            // Show options for what to create (note, folder, quiz, etc.)
            alert('Create: Note, Folder, Quiz, or Study Plan');
        });
    }

});


// Function to save file info to database
// This is a placeholder - you'll implement this when you have your backend
function saveFileToDatabase(fileName, fileUrl, fileType, fileSize) {
    // Example:
    // fetch('/api/materials', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({
    //         name: fileName,
    //         url: fileUrl,
    //         type: fileType,
    //         size: fileSize,
    //         folder: 'Biology 101'
    //     })
    // })
    // .then(response => response.json())
    // .then(data => {
    //     console.log('File saved to database:', data);
    //     // Refresh the materials list
    // })
    // .catch(error => console.error('Error:', error));
}
