
if (!requireAuth()) {

}


// i implemented auto-save so users don't lose their work
// waits 2 seconds after they stop typing before saving
let autoSaveTimeout;
const AUTO_SAVE_DELAY = 2000;

let currentNoteId = null;


document.addEventListener('DOMContentLoaded', async function() {

    await loadFoldersToDropdown();

    const urlParams = new URLSearchParams(window.location.search);
    currentNoteId = urlParams.get('id');

    if (currentNoteId) {
        await loadExistingNote(currentNoteId);
    }

    const noteEditor = document.getElementById('noteEditor');
    const noteTitleInput = document.getElementById('noteTitleInput');
    const publishButton = document.getElementById('publishButton');
    const formatButtons = document.querySelectorAll('.format_button');


    formatButtons.forEach(function(button) {
        button.addEventListener('click', function(e) {
            e.preventDefault();

            const formatCommand = button.getAttribute('data-command');
            const formatValue = button.getAttribute('data-value');

            if (formatCommand === 'formatBlock' && formatValue) {
                document.execCommand(formatCommand, false, formatValue);
            } else {
                document.execCommand(formatCommand, false, null);
            }

            noteEditor.focus();

            updateFormatButtonStates();
        });
    });


    function updateFormatButtonStates() {
        formatButtons.forEach(function(button) {
            const formatCommand = button.getAttribute('data-command');

            if (document.queryCommandState(formatCommand)) {
                button.classList.add('active');
            } else {
                button.classList.remove('active');
            }
        });
    }

    if (noteEditor) {
        noteEditor.addEventListener('mouseup', updateFormatButtonStates);
        noteEditor.addEventListener('keyup', updateFormatButtonStates);

        noteEditor.addEventListener('paste', function(e) {
            e.preventDefault();

            const clipboardText = (e.clipboardData || window.clipboardData).getData('text/plain');

            const currentSelection = window.getSelection();
            if (!currentSelection.rangeCount) return;

            currentSelection.deleteFromDocument();
            const textRange = currentSelection.getRangeAt(0);
            const newTextNode = document.createTextNode(clipboardText);
            textRange.insertNode(newTextNode);

            textRange.setStartAfter(newTextNode);
            textRange.setEndAfter(newTextNode);
            currentSelection.removeAllRanges();
            currentSelection.addRange(textRange);

            triggerAutoSave();
        });
    }


    if (noteEditor) {
        noteEditor.addEventListener('input', function() {
            triggerAutoSave();
        });
    }

    if (noteTitleInput) {
        noteTitleInput.addEventListener('input', function() {
            triggerAutoSave();
        });
    }


    function triggerAutoSave() {
        clearTimeout(autoSaveTimeout);

        autoSaveTimeout = setTimeout(function() {
            autoSaveNote();
        }, AUTO_SAVE_DELAY);
    }


    async function autoSaveNote() {
        const noteTitle = noteTitleInput.value || 'Untitled Note';
        const noteContent = noteEditor.innerHTML;
        const folderSelectValue = document.getElementById('folderSelect')?.value;

        const selectedFolderId = folderSelectValue && folderSelectValue !== '' ? folderSelectValue : null;

        if (!noteContent || noteContent.trim() === '' || noteContent === '<br>') {
            return;
        }

        const noteDataToSave = {
            title: noteTitle,
            content: noteContent,
            folderId: selectedFolderId,
            status: 'published'
        };

        console.log('Auto-saving note with folderId:', selectedFolderId);

        try {
            if (currentNoteId) {
                await updateNote(currentNoteId, noteDataToSave);
            } else {
                const creationResponse = await createNote(noteDataToSave);
                currentNoteId = creationResponse.note.id;
            }
        } catch (saveError) {
            console.error('Error auto-saving note:', saveError);
        }
    }


    if (publishButton) {
        publishButton.addEventListener('click', async function() {

            clearTimeout(autoSaveTimeout);

            const finalTitle = noteTitleInput.value;

            if (!finalTitle || finalTitle.trim() === '') {
                showWarning('Please enter a note title');
                noteTitleInput.focus();
                return;
            }

            const finalContent = noteEditor.innerHTML;
            const folderSelectValue = document.getElementById('folderSelect')?.value;
            const selectedFolderId = folderSelectValue && folderSelectValue !== '' ? folderSelectValue : null;
            const selectedColor = document.getElementById('colorSelect')?.value || 'blue';
            const tagsInput = document.getElementById('tagsInput')?.value || '';

            const finalNoteData = {
                title: finalTitle,
                content: finalContent,
                folderId: selectedFolderId,
                color: selectedColor,
                tags: tagsInput,
                status: 'published'
            };

            console.log('Publishing note with folderId:', selectedFolderId);

            try {
                if (currentNoteId) {
                    await updateNote(currentNoteId, finalNoteData);
                } else {
                    await createNote(finalNoteData);
                }

                showSuccess('Note saved!');

                setTimeout(function() {
                    window.location.href = '/pages/my_notes.html';
                }, 1000);

            } catch (publishError) {
                console.error('Error publishing note:', publishError);
                showError('Failed to publish note: ' + publishError.message);
            }
        });
    }


    function showSaveMessage(messageText) {
        const saveMessage = document.createElement('div');
        saveMessage.textContent = messageText;
        saveMessage.style.cssText = `
            position: fixed;
            bottom: 24px;
            right: 24px;
            padding: 12px 20px;
            background-color: #00B7B5;
            color: white;
            border-radius: 8px;
            font-size: 14px;
            z-index: 1000;
            animation: fadeInOut 2s ease-in-out;
        `;

        document.body.appendChild(saveMessage);

        setTimeout(function() {
            saveMessage.remove();
        }, 2000);
    }


    document.addEventListener('keydown', function(e) {

        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            publishButton.click();
        }

        if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
            e.preventDefault();
            document.execCommand('bold');
            updateFormatButtonStates();
        }

        if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
            e.preventDefault();
            document.execCommand('italic');
            updateFormatButtonStates();
        }

        if ((e.ctrlKey || e.metaKey) && e.key === 'u') {
            e.preventDefault();
            document.execCommand('underline');
            updateFormatButtonStates();
        }
    });

});


const styleElement = document.createElement('style');
styleElement.textContent = `
    @keyframes fadeInOut {
        0% { opacity: 0; transform: translateY(10px); }
        10% { opacity: 1; transform: translateY(0); }
        90% { opacity: 1; transform: translateY(0); }
        100% { opacity: 0; transform: translateY(-10px); }
    }
`;
document.head.appendChild(styleElement);


async function loadFoldersToDropdown() {
    try {
        const foldersResponse = await getUserFolders();
        const allFolders = foldersResponse.folders || [];
        const folderSelect = document.getElementById('folderSelect');

        if (!folderSelect) return;

        folderSelect.innerHTML = '';

        const noFolderOption = document.createElement('option');
        noFolderOption.value = '';
        noFolderOption.textContent = 'No Folder';
        folderSelect.appendChild(noFolderOption);

        allFolders.forEach(folder => {
            const folderOption = document.createElement('option');
            folderOption.value = folder.id;
            folderOption.textContent = folder.name;
            folderSelect.appendChild(folderOption);
        });

        const urlParams = new URLSearchParams(window.location.search);
        const preselectedFolderId = urlParams.get('folder');

        if (preselectedFolderId) {
            folderSelect.value = preselectedFolderId;
        }

    } catch (folderLoadError) {
        console.error('Error loading folders:', folderLoadError);
    }
}


async function loadExistingNote(noteId) {
    try {
        const noteData = await getNoteById(noteId);

        document.getElementById('noteTitleInput').value = noteData.title || '';
        document.getElementById('noteEditor').innerHTML = noteData.content || '';

        if (noteData.folderId) {
            const folderSelect = document.getElementById('folderSelect');
            if (folderSelect) {
                folderSelect.value = noteData.folderId;
            }
        }

        if (noteData.color) {
            const colorSelect = document.getElementById('colorSelect');
            if (colorSelect) {
                colorSelect.value = noteData.color;
            }
        }

        if (noteData.tags) {
            const tagsInput = document.getElementById('tagsInput');
            if (tagsInput) {
                tagsInput.value = noteData.tags;
            }
        }

    } catch (noteLoadError) {
        console.error('Error loading note:', noteLoadError);
        showError('Failed to load note: ' + noteLoadError.message);
        window.location.href = '/pages/my_notes.html';
    }
}
