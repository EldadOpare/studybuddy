// Auto-save functionality
let autoSaveTimeout;
const AUTO_SAVE_DELAY = 2000; // 2 seconds

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {

    const noteEditor = document.getElementById('noteEditor');
    const noteTitleInput = document.getElementById('noteTitleInput');
    const saveDraftButton = document.getElementById('saveDraftButton');
    const publishButton = document.getElementById('publishButton');
    const formatButtons = document.querySelectorAll('.format_button');


    // Formatting toolbar buttons
    formatButtons.forEach(function(button) {
        button.addEventListener('click', function(e) {
            e.preventDefault();

            const command = button.getAttribute('data-command');
            const value = button.getAttribute('data-value');

            if (command === 'formatBlock' && value) {
                document.execCommand(command, false, value);
            } else {
                document.execCommand(command, false, null);
            }

            // Keep focus on editor
            noteEditor.focus();

            // Update button states
            updateFormatButtonStates();
        });
    });


    // Update format button active states based on cursor position
    function updateFormatButtonStates() {
        formatButtons.forEach(function(button) {
            const command = button.getAttribute('data-command');

            if (document.queryCommandState(command)) {
                button.classList.add('active');
            } else {
                button.classList.remove('active');
            }
        });
    }

    // Update button states when selection changes
    if (noteEditor) {
        noteEditor.addEventListener('mouseup', updateFormatButtonStates);
        noteEditor.addEventListener('keyup', updateFormatButtonStates);
    }


    // Auto-save on content change
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


    // Trigger auto-save with debounce
    function triggerAutoSave() {
        clearTimeout(autoSaveTimeout);

        autoSaveTimeout = setTimeout(function() {
            saveDraft(true); // true = auto-save (silent)
        }, AUTO_SAVE_DELAY);
    }


    // Save draft function
    function saveDraft(isAutoSave) {
        const title = noteTitleInput.value || 'Untitled Note';
        const content = noteEditor.innerHTML;
        const folder = document.getElementById('folderSelect').value;
        const color = document.getElementById('colorSelect').value;
        const tags = document.getElementById('tagsInput').value;

        // Save to localStorage (or send to backend)
        const noteData = {
            title: title,
            content: content,
            folder: folder,
            color: color,
            tags: tags,
            lastSaved: new Date().toISOString()
        };

        localStorage.setItem('draft_note', JSON.stringify(noteData));

        console.log('Draft saved:', noteData);

        if (!isAutoSave) {
            showSaveMessage('Draft saved!');
        }
    }


    // Save draft button
    if (saveDraftButton) {
        saveDraftButton.addEventListener('click', function() {
            saveDraft(false);
        });
    }


    // Publish note button
    if (publishButton) {
        publishButton.addEventListener('click', function() {
            const title = noteTitleInput.value;

            if (!title || title.trim() === '') {
                alert('Please enter a note title');
                noteTitleInput.focus();
                return;
            }

            const content = noteEditor.innerHTML;
            const folder = document.getElementById('folderSelect').value;
            const color = document.getElementById('colorSelect').value;
            const tags = document.getElementById('tagsInput').value;

            const noteData = {
                title: title,
                content: content,
                folder: folder,
                color: color,
                tags: tags,
                dateCreated: new Date().toISOString(),
                type: 'note'
            };

            console.log('Publishing note:', noteData);

            // Here you would send to your backend
            // fetch('/api/notes', {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify(noteData)
            // })
            // .then(response => response.json())
            // .then(data => {
            //     console.log('Note published:', data);
            //     window.location.href = 'my_notes.html';
            // })
            // .catch(error => console.error('Error:', error));

            // For now, show success and redirect
            alert(`Note "${title}" published successfully!`);
            localStorage.removeItem('draft_note'); // Clear draft
            window.location.href = 'my_notes.html';
        });
    }


    // Show save message
    function showSaveMessage(message) {
        const saveMessage = document.createElement('div');
        saveMessage.textContent = message;
        saveMessage.style.cssText = `
            position: fixed;
            bottom: 24px;
            right: 24px;
            padding: 12px 20px;
            background-color: #4E3D92;
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


    // Load draft if exists
    function loadDraft() {
        const savedDraft = localStorage.getItem('draft_note');

        if (savedDraft) {
            const noteData = JSON.parse(savedDraft);

            if (confirm('You have a saved draft. Would you like to continue editing it?')) {
                noteTitleInput.value = noteData.title;
                noteEditor.innerHTML = noteData.content;
                document.getElementById('folderSelect').value = noteData.folder;
                if (noteData.color) {
                    document.getElementById('colorSelect').value = noteData.color;
                }
                document.getElementById('tagsInput').value = noteData.tags;
            } else {
                localStorage.removeItem('draft_note');
            }
        }
    }

    loadDraft();


    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // Ctrl/Cmd + S to save
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            saveDraft(false);
        }

        // Ctrl/Cmd + B for bold
        if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
            e.preventDefault();
            document.execCommand('bold');
            updateFormatButtonStates();
        }

        // Ctrl/Cmd + I for italic
        if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
            e.preventDefault();
            document.execCommand('italic');
            updateFormatButtonStates();
        }

        // Ctrl/Cmd + U for underline
        if ((e.ctrlKey || e.metaKey) && e.key === 'u') {
            e.preventDefault();
            document.execCommand('underline');
            updateFormatButtonStates();
        }
    });

});


// Add fade in/out animation
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeInOut {
        0% { opacity: 0; transform: translateY(10px); }
        10% { opacity: 1; transform: translateY(0); }
        90% { opacity: 1; transform: translateY(0); }
        100% { opacity: 0; transform: translateY(-10px); }
    }
`;
document.head.appendChild(style);
