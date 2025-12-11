
if (!requireAuth()) {

}


const cloudinaryCloudName = 'dbx5yulyl';

const cloudinaryUploadPreset = 'studybuddy';


function openFolderModal() {
    const createFolderModal = document.getElementById('createFolderModal');
    if (createFolderModal) {
        createFolderModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}


function closeFolderModal() {
    const createFolderModal = document.getElementById('createFolderModal');
    const createFolderForm = document.getElementById('createFolderForm');
    if (createFolderModal) {
        createFolderModal.style.display = 'none';
        document.body.style.overflow = 'auto';
        if (createFolderForm) {
            createFolderForm.reset();
        }
    }
}



document.addEventListener('DOMContentLoaded', async function() {

    await loadFoldersToSidebar();

    await loadFoldersToFilterDropdown();


    await loadFoldersToUploadModal();

    const urlParameters = new URLSearchParams(window.location.search);
    const currentFolderId = urlParameters.get('folder');


    await loadNotesFromDatabase(currentFolderId);
    await loadMaterialsFromDatabase(currentFolderId);


    const createNoteButton = document.getElementById('createNoteButton');
    if (createNoteButton && currentFolderId) {
        createNoteButton.href = `note_editor.html?folder=${currentFolderId}`;
    }


    const folderFilterDropdown = document.getElementById('folderFilter');
    if (folderFilterDropdown) {
        folderFilterDropdown.addEventListener('change', function() {
            const selectedFolderId = this.value;
            if (selectedFolderId) {
                window.location.href = `?folder=${selectedFolderId}`;
            } else {
                window.location.href = '/pages/my_notes.html';
            }
        });


        if (currentFolderId) {
            folderFilterDropdown.value = currentFolderId;
        }
    }


    const uploadModal = document.getElementById('uploadFileModal');

    const browseFilesButton = document.getElementById('browseFilesButton');

    if (browseFilesButton) {
        browseFilesButton.addEventListener('click', function(event) {
            event.stopPropagation();


            const uploadWidget = cloudinary.createUploadWidget(
                {
                    cloudName: cloudinaryCloudName,
                    uploadPreset: cloudinaryUploadPreset,
                    sources: ['local', 'url', 'camera', 'dropbox', 'google_drive'],
                    multiple: false,
                    folder: 'studybuddy/materials',
                    showUploadMoreButton: false,
                    clientAllowedFormats: ['pdf', 'doc', 'docx', 'txt', 'png', 'jpg', 'jpeg'],
                    maxFileSize: 10000000
                },
                function(uploadError, uploadResult) {
                    if (!uploadError && uploadResult && uploadResult.event === 'success') {
                        console.log('File selected:', uploadResult.info);
                        const fileUrlFromCloudinary = uploadResult.info.secure_url;
                        const originalFileName = uploadResult.info.original_filename;


                        window.open(fileUrlFromCloudinary, '_blank');
                    }

                    if (uploadError) {
                        console.error('Error:', uploadError);
                    }
                }
            );

            uploadWidget.open();
        });
    }



    const closeModalButton = document.getElementById('closeModalButton');
    const cancelModalButton = document.getElementById('cancelModalButton');

    const uploadFormElement = document.getElementById('uploadForm');
    const fileUploadArea = document.getElementById('fileUploadArea');

    const fileInputElement = document.getElementById('fileInput');
    const uploadedFileInfo = document.getElementById('uploadedFileInfo');

    const fileNameDisplay = document.getElementById('fileNameDisplay');
    const removeFileButton = document.getElementById('removeFileButton');

    const dropZoneElement = document.getElementById('dropZone');



    function openModal() {
        if (uploadModal) {
            uploadModal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }
    }


    function closeModal() {
        if (uploadModal) {
            uploadModal.style.display = 'none';
            document.body.style.overflow = 'auto';
            resetForm();
        }
    }


    function resetForm() {
        if (uploadFormElement) {
            uploadFormElement.reset();
        }
        if (uploadedFileInfo) {
            uploadedFileInfo.style.display = 'none';
        }
    }


    if (closeModalButton) {
        closeModalButton.addEventListener('click', closeModal);
    }

    if (cancelModalButton) {
        cancelModalButton.addEventListener('click', closeModal);
    }


    if (uploadModal) {
        uploadModal.addEventListener('click', function(event) {
            if (event.target === uploadModal) {
                closeModal();
            }
        });
    }


    if (fileUploadArea) {
        fileUploadArea.addEventListener('click', function() {
            fileInputElement.click();
        });
    }


    if (fileInputElement) {
        fileInputElement.addEventListener('change', function(event) {
            const selectedFile = event.target.files[0];
            if (selectedFile) {
                displayUploadedFile(selectedFile.name);
            }
        });
    }


    function displayUploadedFile(fileName) {
        if (fileNameDisplay) {
            fileNameDisplay.textContent = fileName;
        }
        if (uploadedFileInfo) {
            uploadedFileInfo.style.display = 'flex';
        }
    }


    if (removeFileButton) {
        removeFileButton.addEventListener('click', function() {
            if (fileInputElement) {
                fileInputElement.value = '';
            }
            if (uploadedFileInfo) {
                uploadedFileInfo.style.display = 'none';
            }
        });
    }


    if (uploadFormElement) {
        uploadFormElement.addEventListener('submit', function(event) {
            event.preventDefault();

            const userFileName = document.getElementById('fileName').value;
            const userFileFolder = document.getElementById('fileFolder').value;

            const userFileTags = document.getElementById('fileTags').value;
            const userFileDescription = document.getElementById('fileDescription').value;

            const selectedFile = fileInputElement.files[0];

            if (!selectedFile) {
                showWarning('Please select a file to upload');
                return;
            }

            console.log('Uploading file:', {
                name: userFileName,
                folder: userFileFolder,
                tags: userFileTags,
                description: userFileDescription,
                file: selectedFile.name
            });

            uploadToCloudinary(selectedFile, userFileName, userFileFolder, userFileTags, userFileDescription);
        });
    }


    function uploadToCloudinary(fileToUpload, titleForFile, folderForFile, tagsForFile, descriptionForFile) {
        const uploadFormData = new FormData();

        uploadFormData.append('file', fileToUpload);
        uploadFormData.append('upload_preset', cloudinaryUploadPreset);

        uploadFormData.append('folder', 'studybuddy/materials');


        showInfo('Uploading file...');

        fetch(`https://api.cloudinary.com/v1_1/${cloudinaryCloudName}/auto/upload`, {
            method: 'POST',
            body: uploadFormData
        })
        .then(serverResponse => serverResponse.json())
        .then(cloudinaryData => {
            console.log('File uploaded:', cloudinaryData);

            const determinedFileType = fileToUpload.type.includes('pdf') ? 'pdf' :
                           fileToUpload.type.includes('word') || fileToUpload.type.includes('document') ? 'doc' :
                           fileToUpload.type.includes('text') ? 'txt' :
                           fileToUpload.type.includes('image') ? 'image' : 'file';

            saveMaterialToDatabase(titleForFile, folderForFile, tagsForFile, descriptionForFile, cloudinaryData.secure_url, determinedFileType, cloudinaryData.bytes);
        })
        .catch(uploadError => {
            console.error('Upload error:', uploadError);
            showError('Upload failed. Please try again.');
        });
    }


    function saveFileToDatabase(titleText, folderText, tagsText, descriptionText, fileUrlText) {
        console.log('Saving file to database:', {
            title: titleText,
            folder: folderText,
            tags: tagsText,
            description: descriptionText,
            fileUrl: fileUrlText
        });

        showSuccess(`File "${titleText}" uploaded successfully!`);

        closeModal();

    }



    if (dropZoneElement) {
        dropZoneElement.addEventListener('click', function(event) {
            if (!event.target.classList.contains('new_note_button') &&
                !event.target.classList.contains('browse_files_button') &&
                event.target.id !== 'browseFilesButton') {
                openModal();
            }
        });


        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropZoneElement.addEventListener(eventName, preventDefaults, false);
        });

        function preventDefaults(event) {
            event.preventDefault();
            event.stopPropagation();
        }


        ['dragenter', 'dragover'].forEach(eventName => {
            dropZoneElement.addEventListener(eventName, highlight, false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            dropZoneElement.addEventListener(eventName, unhighlight, false);
        });

        function highlight() {
            dropZoneElement.style.borderColor = '#5E4DB2';
            dropZoneElement.style.backgroundColor = '#F8F8FF';
        }

        function unhighlight() {
            dropZoneElement.style.borderColor = '#CFCFCF';
            dropZoneElement.style.backgroundColor = 'white';
        }


        dropZoneElement.addEventListener('drop', handleDrop, false);

        function handleDrop(event) {
            const dataTransferObject = event.dataTransfer;
            const droppedFiles = dataTransferObject.files;

            if (droppedFiles.length > 0) {
                const droppedFile = droppedFiles[0];

                const allowedFileTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'image/png', 'image/jpeg', 'image/jpg'];

                if (allowedFileTypes.includes(droppedFile.type)) {
                    document.getElementById('fileName').value = droppedFile.name.replace(/\.[^/.]+$/, '');


                    const newDataTransfer = new DataTransfer();
                    newDataTransfer.items.add(droppedFile);
                    fileInputElement.files = newDataTransfer.files;

                    displayUploadedFile(droppedFile.name);

                    openModal();
                } else {
                    showWarning('File type not supported. Please upload PDF, DOC, DOCX, TXT, PNG, or JPG files.');
                }
            }
        }
    }



    const materialRowElements = document.querySelectorAll('.material_row');

    materialRowElements.forEach(function(rowElement) {
        rowElement.addEventListener('click', function(event) {
            if (event.target.classList.contains('more_button')) {
                return;
            }

            const clickedFileName = rowElement.querySelector('.file_name').textContent;
            console.log('Opening note:', clickedFileName);

            window.location.href = 'note_editor.html';
        });
    });



    const moreButtonElements = document.querySelectorAll('.more_button');

    moreButtonElements.forEach(function(buttonElement) {
        buttonElement.addEventListener('click', function(event) {
            event.stopPropagation();

            showInfo('More options coming soon!');
        });
    });



    const searchInputElement = document.getElementById('searchInput');

    if (searchInputElement) {
        searchInputElement.addEventListener('input', function(event) {
            const searchTerm = event.target.value.toLowerCase();
            const materialRowElements = document.querySelectorAll('.material_row');

            materialRowElements.forEach(function(rowElement) {
                const fileNameText = rowElement.querySelector('.file_name').textContent.toLowerCase();

                if (fileNameText.includes(searchTerm)) {
                    rowElement.style.display = 'grid';
                } else {
                    rowElement.style.display = 'none';
                }
            });
        });
    }



    const folderItemElements = document.querySelectorAll('.folder_item');

    folderItemElements.forEach(function(folderElement) {
        folderElement.addEventListener('click', function(event) {
            event.preventDefault();

            folderItemElements.forEach(function(itemElement) {
                itemElement.classList.remove('active');
            });

            folderElement.classList.add('active');

            const clickedFolderName = folderElement.textContent.trim();
            console.log('Loading folder:', clickedFolderName);
        });
    });



    const addFolderButton = document.querySelector('.add_folder_button');
    
    const createFolderModal = document.getElementById('createFolderModal');
    
    const closeFolderModalButton = document.getElementById('closeFolderModalButton');
    
    const cancelFolderModalButton = document.getElementById('cancelFolderModalButton');
    
    const createFolderForm = document.getElementById('createFolderForm');

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
        createFolderModal.addEventListener('click', function(event) {
            if (event.target === createFolderModal) {
                closeFolderModal();
            }
        });
    }

    if (createFolderForm) {
        createFolderForm.addEventListener('submit', async function(event) {
            event.preventDefault();

            const newFolderName = document.getElementById('folderName').value;
            const selectedFolderColor = document.querySelector('input[name="folderColor"]:checked').value;

            try {
                await createFolder({ name: newFolderName, color: selectedFolderColor });
                closeFolderModal();
                await loadFoldersToSidebar();

            } catch (creationError) {
                console.error('Error creating folder:', creationError);
                showError('Failed to create folder. Please try again.');
            }
        });
    }


    const createNewButton = document.querySelector('.create_new_button');

    if (createNewButton) {
        createNewButton.addEventListener('click', function() {
            const urlParameters = new URLSearchParams(window.location.search);
            const currentFolderId = urlParameters.get('folder');
            if (currentFolderId) {
                window.location.href = `/pages/note_editor.html?folder=${currentFolderId}`;
            } else {
                window.location.href = '/pages/note_editor.html';
            }
        });
    }

});



function saveFileToDatabase(fileName, fileUrl, fileType, fileSize) {

}



async function saveMaterialToDatabase(materialTitle, materialFolderId, materialTags, materialDescription, materialFileUrl, materialFileType, materialFileSize) {
    try {
        console.log('Saving material to database...');

        const serverResponse = await uploadMaterial({
            name: materialTitle,
            fileType: materialFileType,
            fileUrl: materialFileUrl,
            fileSize: materialFileSize,
            folderId: materialFolderId || null
        });

        console.log('Material saved successfully:', serverResponse);
        showSuccess(`File "${materialTitle}" uploaded successfully!`);

        const uploadModal = document.getElementById('uploadFileModal');
        if (uploadModal) {
            uploadModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }

        const uploadFormElement = document.getElementById('uploadForm');
        if (uploadFormElement) {
            uploadFormElement.reset();
        }


        const urlParameters = new URLSearchParams(window.location.search);
        const currentFolderId = urlParameters.get('folder');

        const materialsContainer = document.querySelector('.materials_grid');
        if (materialsContainer) {
            materialsContainer.innerHTML = '';
        }

        await loadNotesFromDatabase(currentFolderId);
        await loadMaterialsFromDatabase(currentFolderId);

    } catch (savingError) {
        console.error('Error saving material:', savingError);
        showError('Failed to save material to database. Please try again.');
    }
}



async function loadNotesFromDatabase(folderIdFilter) {
    try {
        console.log('Loading notes from database...');
        const serverResponse = await getUserNotes();
        let userNotes = serverResponse.notes || [];

        if (folderIdFilter) {
            userNotes = userNotes.filter(noteItem => noteItem.folderId == folderIdFilter);
            console.log(`Filtered to ${userNotes.length} notes for folder ${folderIdFilter}`);
        }

        const materialsContainer = document.querySelector('.materials_grid');

        if (!materialsContainer) {
            console.log('Materials container not found');
            return;
        }

        materialsContainer.innerHTML = '';


        if (userNotes.length === 0) {
            showEmptyState(materialsContainer, folderIdFilter);
            return;
        }

        createMaterialsTable(materialsContainer, userNotes);

        console.log(`Displayed ${userNotes.length} notes successfully`);

    } catch (loadingError) {
        console.error('Error loading notes:', loadingError);
        const materialsContainer = document.querySelector('.materials_grid');
        if (materialsContainer) {
            materialsContainer.innerHTML = '<div class="error_state">Failed to load materials. Please try again.</div>';
        }
    }
}


function showEmptyState(containerElement, folderIdFilter) {
    const emptyStateElement = document.createElement('div');
    emptyStateElement.className = 'empty_state_container';

    const folderDescriptionText = folderIdFilter ? 'this folder' : 'your library';
    const createNoteLinkUrl = folderIdFilter ? `note_editor.html?folder=${folderIdFilter}` : 'note_editor.html';

    emptyStateElement.innerHTML = `
        <div class="empty_state_icon">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#86868B" stroke-width="1.5">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
        </div>
        <h3 class="empty_state_title">No materials in ${folderDescriptionText} yet</h3>
        <p class="empty_state_subtitle">Start by creating your first note or uploading a file!</p>
        <div class="empty_state_actions">
            <a href="${createNoteLinkUrl}" class="empty_action_button primary">+ Create Note</a>
            <button class="empty_action_button secondary" onclick="document.getElementById('browseFilesButton').click()">Upload File</button>
        </div>
    `;

    containerElement.appendChild(emptyStateElement);
}


function createMaterialsTable(containerElement, notesArray) {
    const tableWrapperElement = document.createElement('div');
    tableWrapperElement.className = 'materials_table_wrapper';


    const tableHeaderElement = document.createElement('div');
    tableHeaderElement.className = 'materials_table_header';
    tableHeaderElement.innerHTML = `
        <div class="header_col name_col">Name</div>
        <div class="header_col date_col">Last Modified</div>
        <div class="header_col actions_col">Actions</div>
    `;

    const tableBodyElement = document.createElement('div');
    tableBodyElement.className = 'materials_table_body';

    notesArray.forEach((noteItem, noteIndex) => {
        const materialRowElement = createMaterialRow(noteItem, noteIndex);
        tableBodyElement.appendChild(materialRowElement);
    });

    tableWrapperElement.appendChild(tableHeaderElement);
    tableWrapperElement.appendChild(tableBodyElement);
    containerElement.appendChild(tableWrapperElement);
}


function createMaterialRow(noteData, rowIndex) {
    const rowElement = document.createElement('div');
    rowElement.className = 'material_row';
    rowElement.dataset.noteId = noteData.id;

    const noteDateObject = new Date(noteData.updatedAt || noteData.createdAt || noteData.updated_at || noteData.created_at);
    const humanReadableDate = getHumanReadableDate(noteDateObject);

    const previewTextContent = getSimplePreview(noteData.content);


    const noteColorOptions = ['#7132CA', '#4A90E2', '#50C878', '#FB923C', '#EC4899', '#6366F1', '#22C55E', '#F59E0B'];
    const assignedNoteColor = noteData.color || noteColorOptions[noteData.id % noteColorOptions.length];

    rowElement.innerHTML = `
        <div class="material_name_section">
            <div class="material_icon" style="background-color: ${assignedNoteColor}; border-radius: 6px;"></div>
            <div class="material_info">
                <div class="material_title">${noteData.title || 'Untitled Note'}</div>
                <div class="material_preview">${previewTextContent}</div>
            </div>
        </div>

        <div class="material_date_section">
            <span class="date_text">${humanReadableDate}</span>
        </div>

        <div class="material_actions_section">
            <button class="material_action_btn edit_btn" onclick="editNote(${noteData.id})" title="Edit note">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
                Edit
            </button>
            <button class="material_action_btn delete_btn" onclick="confirmDeleteNote(${noteData.id}, '${(noteData.title || 'Untitled Note').replace(/'/g, "\\'")}')" title="Delete note">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
                Delete
            </button>
        </div>
    `;

    rowElement.addEventListener('click', function(event) {
        if (event.target.classList.contains('material_action_btn')) return;

        window.location.href = `/pages/note_editor.html?id=${noteData.id}`;
    });

    return rowElement;
}


function getHumanReadableDate(dateObject) {
    if (!dateObject || isNaN(dateObject.getTime())) {
        return 'Recently';
    }

    const currentDate = new Date();
    const timeDifference = currentDate - dateObject;
    const daysDifference = Math.floor(timeDifference / (1000 * 60 * 60 * 24));

    if (daysDifference === 0) return 'Today';
    if (daysDifference === 1) return 'Yesterday';
    if (daysDifference < 7) return `${daysDifference} days ago`;
    if (daysDifference < 30) return `${Math.floor(daysDifference / 7)} weeks ago`;


    return dateObject.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: dateObject.getFullYear() !== currentDate.getFullYear() ? 'numeric' : undefined
    });
}


function getSimplePreview(contentHtml) {
    if (!contentHtml) return 'No content yet...';

    const tempDivElement = document.createElement('div');
    tempDivElement.innerHTML = contentHtml;
    const plainTextContent = tempDivElement.textContent || tempDivElement.innerText || '';

    const previewText = plainTextContent.trim().substring(0, 50);
    return previewText ? (previewText + (plainTextContent.length > 50 ? '...' : '')) : 'No content yet...';
}


function editNote(noteIdentifier) {
    window.location.href = `/pages/note_editor.html?id=${noteIdentifier}`;
}


function confirmDeleteNote(noteIdentifier, noteTitle) {
    showConfirmDialog(
        'Delete Note',
        `Are you sure you want to delete "${noteTitle || 'this note'}"? This action cannot be undone.`,
        function() {
            deleteNoteById(noteIdentifier);
        }
    );
}


async function deleteNoteById(noteIdentifier) {
    try {
        await deleteNote(noteIdentifier);
        showSuccess('Note deleted successfully');

        const urlParameters = new URLSearchParams(window.location.search);
        const currentFolderId = urlParameters.get('folder');
        await loadNotesFromDatabase(currentFolderId);

    } catch (deletionError) {
        console.error('Error deleting note:', deletionError);
        showError('Failed to delete note: ' + deletionError.message);
    }
}



async function loadFoldersToFilterDropdown() {
    try {
        const serverResponse = await getUserFolders();
        const userFolders = serverResponse.folders || [];

        const folderFilterDropdown = document.getElementById('folderFilter');
        if (!folderFilterDropdown) return;

        folderFilterDropdown.innerHTML = '<option value="">All Folders</option>';


        userFolders.forEach(folderItem => {
            const optionElement = document.createElement('option');
            optionElement.value = folderItem.id;
            optionElement.textContent = folderItem.name;
            folderFilterDropdown.appendChild(optionElement);
        });

        console.log(`Loaded ${userFolders.length} folders into filter dropdown`);

    } catch (loadingError) {
        console.error('Error loading folders for filter:', loadingError);
    }
}



async function loadMaterialsFromDatabase(folderIdFilter) {
    try {
        console.log('Loading materials from database...');

        const serverResponse = await getUserMaterials(folderIdFilter);
        const userMaterials = serverResponse.materials || [];

        console.log(`Found ${userMaterials.length} materials`);

        const materialsContainer = document.querySelector('.materials_grid');
        if (!materialsContainer) {
            console.log('Materials container not found');
            return;
        }


        if (userMaterials.length === 0) {
            return;
        }

        let tableBodyElement = document.querySelector('.materials_table_body');

        if (!tableBodyElement) {
            const tableWrapperElement = document.createElement('div');
            tableWrapperElement.className = 'materials_table_wrapper';

            const tableHeaderElement = document.createElement('div');
            tableHeaderElement.className = 'materials_table_header';
            tableHeaderElement.innerHTML = `
                <div class="header_col name_col">Name</div>
                <div class="header_col date_col">Last Modified</div>
                <div class="header_col actions_col">Actions</div>
            `;

            tableBodyElement = document.createElement('div');
            tableBodyElement.className = 'materials_table_body';

            tableWrapperElement.appendChild(tableHeaderElement);
            tableWrapperElement.appendChild(tableBodyElement);
            materialsContainer.appendChild(tableWrapperElement);
        }

        userMaterials.forEach((materialItem, materialIndex) => {
            const materialRowElement = createPdfMaterialRow(materialItem, materialIndex);
            tableBodyElement.appendChild(materialRowElement);
        });

        console.log(`Displayed ${userMaterials.length} materials successfully`);

    } catch (loadingError) {
        console.error('Error loading materials:', loadingError);
    }
}



function createPdfMaterialRow(materialData, rowIndex) {
    const rowElement = document.createElement('div');
    rowElement.className = 'material_row pdf_material_row';
    rowElement.dataset.materialId = materialData.id;

    const materialDateObject = new Date(materialData.createdAt);
    const humanReadableDate = getHumanReadableDate(materialDateObject);


    const pdfIconColor = '#E63946';

    const materialFileType = materialData.fileType || 'pdf';
    const fileTypeUppercase = materialFileType.toUpperCase();

    rowElement.innerHTML = `
        <div class="material_name_section">
            <div class="material_icon pdf_icon" style="background-color: ${pdfIconColor}; border-radius: 6px;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <text x="7" y="17" font-size="6" fill="${pdfIconColor}" font-weight="bold">${fileTypeUppercase}</text>
                </svg>
            </div>
            <div class="material_info">
                <div class="material_title">${materialData.name || 'Untitled Document'}</div>
                <div class="material_preview">${fileTypeUppercase} Document</div>
            </div>
        </div>

        <div class="material_date_section">
            <span class="date_text">${humanReadableDate}</span>
        </div>

        <div class="material_actions_section">
            <button class="material_action_btn view_pdf_btn" onclick="openPdfViewer('${materialData.fileUrl}', '${(materialData.name || 'Document').replace(/'/g, "\\'")}', '${materialFileType}')" title="View document">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                </svg>
                View
            </button>
            <button class="material_action_btn delete_btn" onclick="confirmDeleteMaterial(${materialData.id}, '${(materialData.name || 'this document').replace(/'/g, "\\'")}')" title="Delete document">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
                Delete
            </button>
        </div>
    `;

    rowElement.addEventListener('click', function(event) {
        if (event.target.classList.contains('material_action_btn') ||
            event.target.closest('.material_action_btn')) {
            return;
        }

        openPdfViewer(materialData.fileUrl, materialData.name, materialFileType);
    });

    return rowElement;
}



function openPdfViewer(documentUrl, documentName, documentType) {
    const viewerModal = document.getElementById('pdfViewerModal');
    const viewerIframe = document.getElementById('pdfViewerFrame');
    const viewerTitleElement = document.getElementById('pdfViewerTitle');

    if (!viewerModal || !viewerIframe) {
        console.error('PDF viewer modal not found');
        return;
    }

    if (viewerTitleElement) {
        viewerTitleElement.textContent = documentName || 'Document';
    }

    if (documentType === 'pdf' || documentUrl.toLowerCase().includes('.pdf')) {
        viewerIframe.src = documentUrl;
    } else {
        window.open(documentUrl, '_blank');
        return;
    }

    viewerModal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}



function closePdfViewer() {
    const viewerModal = document.getElementById('pdfViewerModal');
    const viewerIframe = document.getElementById('pdfViewerFrame');

    if (viewerModal) {
        viewerModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }

    if (viewerIframe) {
        viewerIframe.src = '';
    }
}



function downloadPdf() {
    const viewerIframe = document.getElementById('pdfViewerFrame');
    if (viewerIframe && viewerIframe.src) {
        window.open(viewerIframe.src, '_blank');
    }
}



function confirmDeleteMaterial(materialIdentifier, materialName) {
    showConfirmDialog(
        'Delete Document',
        `Are you sure you want to delete "${materialName}"? This action cannot be undone.`,
        function() {
            deleteMaterialById(materialIdentifier);
        }
    );
}



async function deleteMaterialById(materialIdentifier) {
    try {
        await deleteMaterial(materialIdentifier);
        showSuccess('Document deleted successfully');

        const urlParameters = new URLSearchParams(window.location.search);
        
        const currentFolderId = urlParameters.get('folder');

        const materialsContainer = document.querySelector('.materials_grid');
        if (materialsContainer) {
            materialsContainer.innerHTML = '';
        }

        await loadNotesFromDatabase(currentFolderId);
        await loadMaterialsFromDatabase(currentFolderId);

    } catch (deletionError) {
        console.error('Error deleting material:', deletionError);
        showError('Failed to delete document: ' + deletionError.message);
    }
}



async function loadFoldersToUploadModal() {
    try {
        const serverResponse = await getUserFolders();
        
        const userFolders = serverResponse.folders || [];

        const fileFolderDropdownElement = document.getElementById('fileFolder');
        if (!fileFolderDropdownElement) return;

        fileFolderDropdownElement.innerHTML = '<option value="">No Folder</option>';

        userFolders.forEach(folderItem => {
            
            const optionElement = document.createElement('option');
            
            optionElement.value = folderItem.id;
            
            optionElement.textContent = folderItem.name;
            
            fileFolderDropdownElement.appendChild(optionElement);
        });

        console.log(`Loaded ${userFolders.length} folders into upload modal`);

    } catch (loadingError) {
        
        console.error('Error loading folders for upload modal:', loadingError);
    }
}
