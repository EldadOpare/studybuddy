if (!requireAuth()) {
}


function openFolderModal() {
    const modal = document.getElementById('createFolderModal');
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

function closeFolderModal() {
    const modal = document.getElementById('createFolderModal');
    const form = document.getElementById('createFolderForm');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        if (form) {
            form.reset();
        }
    }
}


document.addEventListener('DOMContentLoaded', async function () {

    await loadFoldersToSidebar();
    await loadFoldersToDropdown();


    const urlParams = new URLSearchParams(window.location.search);
    const folderId = urlParams.get('folder');


    await loadNotesFromDatabase(folderId);


    const folderFilter = document.getElementById('folderFilter');
    if (folderFilter) {
        folderFilter.addEventListener('change', function () {
            const selectedFolderId = this.value;
            if (selectedFolderId) {

                window.location.href = `/pages/my_notes.html?folder=${selectedFolderId}`;
            }

            else {

                window.location.href = '/pages/my_notes.html';
            }
        });


        if (folderId) {
            folderFilter.value = folderId;
        }
    }


    const createNoteButton = document.getElementById('createNoteButton');
    if (createNoteButton && folderId) {
        createNoteButton.href = `note_editor.html?folder=${folderId}`;
    }


    const moreButtons = document.querySelectorAll('.more_button');

    moreButtons.forEach(function (button) {

        button.addEventListener('click', function (e) {
            e.stopPropagation();
            alert('More options: Download, Rename, Move, Delete');

        });
    });


    // Search functionality
    const searchInput = document.getElementById('searchInput');

    if (searchInput) {
        searchInput.addEventListener('input', function (e) {
            const searchTerm = e.target.value.toLowerCase();
            const rows = document.querySelectorAll('.material_row');

            // Filter materials based on search term
            rows.forEach(function (row) {

                const titleElement = row.querySelector('.material_title');
                const previewElement = row.querySelector('.material_preview');

                if (titleElement) {

                    const title = titleElement.textContent.toLowerCase();
                    const preview = previewElement ? previewElement.textContent.toLowerCase() : '';

                    if (title.includes(searchTerm) || preview.includes(searchTerm)) {
                        row.style.display = 'grid';
                    } else {
                        row.style.display = 'none';
                    }
                }
            });
        });
    }


    // Folder click handling
    const folderItems = document.querySelectorAll('.folder_item');

    folderItems.forEach(function (folder) {
        folder.addEventListener('click', function (e) {
            e.preventDefault();

          
            folderItems.forEach(function (item) {
                item.classList.remove('active');
            });

           
            folder.classList.add('active');
        });
    });



    const addFolderButton = document.querySelector('.add_folder_button_small');
    
    const createFolderModal = document.getElementById('createFolderModal');
    
    const closeFolderModalButton = document.getElementById('closeFolderModalButton');
    
    const cancelFolderModalButton = document.getElementById('cancelFolderModalButton');
    
    const createFolderForm = document.getElementById('createFolderForm');

    if (addFolderButton) {
        addFolderButton.addEventListener('click', function () {
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
        createFolderModal.addEventListener('click', function (e) {
            if (e.target === createFolderModal) {
                closeFolderModal();
            }
        });
    }

    // Handle folder form submission
    if (createFolderForm) {
        createFolderForm.addEventListener('submit', async function (e) {
            e.preventDefault();

            const folderName = document.getElementById('folderName').value;
            const folderColor = document.querySelector('input[name="folderColor"]:checked').value;

            try {
                await createFolder({ name: folderName, color: folderColor });
                closeFolderModal();
                await loadFoldersToSidebar();
                await loadFoldersToDropdown();
                showSuccess('Folder created successfully!');
            } catch (error) {
                console.error('Error creating folder:', error);
                showError('Failed to create folder. Please try again.');
            }
        });
    }


    // Create New button
    const createNewButton = document.querySelector('.create_new_button');

    if (createNewButton) {
        createNewButton.addEventListener('click', function () {
            window.location.href = '/pages/note_editor.html';
        });
    }

});




async function loadNotesFromDatabase(folderId) {
    try {
        const response = await getUserNotes(folderId);
        let notes = response.notes || [];

        const notesContainer = document.querySelector('.notes_grid') || document.querySelector('.materials_grid');

        if (!notesContainer) {
            return;
        }


        notesContainer.innerHTML = '';

        if (notes.length === 0) {
            const emptyMessage = document.createElement('div');
            emptyMessage.className = 'empty_state';
            emptyMessage.innerHTML = `
                <p class="empty_text">No notes yet</p>
            `;
            notesContainer.appendChild(emptyMessage);
            return;
        }


        const tableContainer = document.createElement('div');

        tableContainer.className = 'materials_table_container';

        const tableHeader = document.createElement('div');

        tableHeader.className = 'materials_table_header';

        tableHeader.innerHTML = `
            <div class="header_cell">Name</div>
            <div class="header_cell">Modified</div>
            <div class="header_cell">Actions</div>
        `;

        const tableBody = document.createElement('div');
        tableBody.className = 'materials_table_body';


        notes.forEach(note => {
            const noteRow = document.createElement('div');
            noteRow.className = 'material_row';
            noteRow.dataset.noteId = note.id;

            // I formatted the date to show when the note was last modified
            const dateString = note.updated_at || note.created_at;
            let formattedDate = 'Recently';

            if (dateString) {
                const noteDate = new Date(dateString);
                if (!isNaN(noteDate.getTime())) {
                    formattedDate = formatDateHuman(noteDate);
                }
            }


            const tempDiv = document.createElement('div');

            tempDiv.innerHTML = note.content || '';

            const textContent = tempDiv.textContent || tempDiv.innerText || '';

            const preview = textContent.substring(0, 60) + (textContent.length > 60 ? '...' : '');


            noteRow.innerHTML = `
                <div class="material_name_section">
                    <div class="material_info">
                        <div class="material_title">${note.title || 'Untitled Note'}</div>
                        <div class="material_preview">${preview || 'No content yet...'}</div>
                    </div>
                </div>
                <div class="material_date_section">
                    <span class="date_text">${formattedDate || 'Recently'}</span>
                </div>
                <div class="material_actions_section">
                    <button class="material_action_btn edit_btn">Edit</button>
                    <button class="material_action_btn delete_btn">Delete</button>
                </div>
            `;


  
            noteRow.addEventListener('click', function(e) {
                if (e.target.classList.contains('edit_btn') || e.target.classList.contains('delete_btn')) {
                    return;
                }
                window.location.href = '/pages/note_editor.html?id=' + note.id;
            });

            const deleteBtn = noteRow.querySelector('.delete_btn');
            deleteBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                e.preventDefault();
                deleteNoteById(note.id);
            });

            const editBtn = noteRow.querySelector('.edit_btn');
            editBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                e.preventDefault();
                window.location.href = '/pages/note_editor.html?id=' + note.id;
            });

            tableBody.appendChild(noteRow);
        });

        tableContainer.appendChild(tableHeader);

        tableContainer.appendChild(tableBody);

        notesContainer.appendChild(tableContainer);

    } catch (error) {
        console.error('Error loading notes:', error);
    }
}


async function loadFoldersToDropdown() {
    try {
        const response = await getUserFolders();
        const folders = response.folders || [];

        const folderFilter = document.getElementById('folderFilter');
        if (!folderFilter) return;


        folderFilter.innerHTML = '<option value="">All Folders</option>';


        folders.forEach(folder => {
            const option = document.createElement('option');
            option.value = folder.id;
            option.textContent = folder.name;
            folderFilter.appendChild(option);
        });

    } catch (error) {
        console.error('Error loading folders to dropdown:', error);
    }
}


function formatDateHuman(date) {

    const now = new Date();

    const diffTime = now - date;

    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';

    if (diffDays === 1) return 'Yesterday';

    if (diffDays < 7) return `${diffDays} days ago`;

    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;

    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
}

// Helper functions for note actions
function editNote(noteId) {
    window.location.href = '/pages/note_editor.html?id=' + noteId;
}

async function deleteNoteById(noteId) {
    showConfirmDialog(
        'Delete Note',
        'Are you sure you want to delete this note? This action cannot be undone.',
        async function() {
            try {
                await deleteNote(noteId);
                showSuccess('Note deleted successfully!');

                const urlParams = new URLSearchParams(window.location.search);
                const folderId = urlParams.get('folder');

                await loadNotesFromDatabase(folderId);
            } catch (error) {
                showError('Failed to delete note: ' + error.message);
            }
        }
    );
}
