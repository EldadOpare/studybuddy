

// I built a custom toast notification system to show success and error messages to users

function showToast(messageText) {
    // I removed any existing toast first to avoid stacking notifications
    const existingToastElement = document.querySelector('.custom_toast');
    if (existingToastElement) {
        existingToastElement.remove();
    }

    const toastElement = document.createElement('div');
    toastElement.className = 'custom_toast';

    toastElement.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #018790;
        color: white;
        padding: 14px 20px;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        z-index: 10000;
        font-size: 14px;
        font-weight: normal;
        animation: slideIn 0.2s ease;
        max-width: 350px;
    `;

    toastElement.textContent = messageText;

    const animationStyleElement = document.createElement('style');
    animationStyleElement.textContent = `
        @keyframes slideIn {
            from {
                transform: translateY(-20px);
                opacity: 0;
            }
            to {
                transform: translateY(0);
                opacity: 1;
            }
        }
        @keyframes slideOut {
            from {
                transform: translateY(0);
                opacity: 1;
            }
            to {
                transform: translateY(-20px);
                opacity: 0;
            }
        }
    `;

    if (!document.querySelector('#toast-styles')) {
        animationStyleElement.id = 'toast-styles';
        document.head.appendChild(animationStyleElement);
    }

    document.body.appendChild(toastElement);

    setTimeout(() => {
        toastElement.style.animation = 'slideOut 0.2s ease';
        setTimeout(() => toastElement.remove(), 200);
    }, 3000);
}



function showSuccess(messageText) {
    showToast(messageText);
}

function showError(messageText) {
    showToast(messageText);
}

function showWarning(messageText) {
    showToast(messageText);
}

function showInfo(messageText) {
    showToast(messageText);
}



function showConfirmDialog(dialogTitle, dialogMessage, onConfirmCallback, onCancelCallback = null) {
    const existingDialogOverlay = document.querySelector('.confirm_dialog_overlay');
    if (existingDialogOverlay) {
        existingDialogOverlay.remove();
    }


    const overlayElement = document.createElement('div');
    overlayElement.className = 'confirm_dialog_overlay';
    overlayElement.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10001;
        animation: fadeIn 0.2s ease;
    `;


    const dialogElement = document.createElement('div');
    dialogElement.className = 'confirm_dialog';
    dialogElement.style.cssText = `
        background: white;
        border-radius: 12px;
        padding: 24px;
        max-width: 400px;
        width: 90%;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
        animation: slideUp 0.2s ease;
    `;

    dialogElement.innerHTML = `
        <h3 style="font-size: 18px; font-weight: 500; color: #1D1D1F; margin-bottom: 8px;">${dialogTitle}</h3>
        <p style="font-size: 14px; color: #86868B; margin-bottom: 24px; line-height: 1.5;">${dialogMessage}</p>
        <div style="display: flex; gap: 12px; justify-content: flex-end;">
            <button class="confirm_dialog_cancel" style="
                padding: 10px 20px;
                background: white;
                border: 1px solid #D0D0D0;
                border-radius: 8px;
                font-size: 14px;
                cursor: pointer;
                color: #1D1D1F;
            ">Cancel</button>
            <button class="confirm_dialog_confirm" style="
                padding: 10px 20px;
                background: #DC2626;
                border: none;
                border-radius: 8px;
                font-size: 14px;
                cursor: pointer;
                color: white;
            ">Delete</button>
        </div>
    `;

    const dialogStyleElement = document.createElement('style');
    dialogStyleElement.textContent = `
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        @keyframes slideUp {
            from { transform: translateY(20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
    `;
    if (!document.querySelector('#dialog-styles')) {
        dialogStyleElement.id = 'dialog-styles';
        document.head.appendChild(dialogStyleElement);
    }

    overlayElement.appendChild(dialogElement);
    document.body.appendChild(overlayElement);


    const cancelButtonElement = dialogElement.querySelector('.confirm_dialog_cancel');
    cancelButtonElement.addEventListener('click', function() {
        overlayElement.remove();
        if (onCancelCallback) onCancelCallback();
    });


    const confirmButtonElement = dialogElement.querySelector('.confirm_dialog_confirm');
    confirmButtonElement.addEventListener('click', function() {
        overlayElement.remove();
        if (onConfirmCallback) onConfirmCallback();
    });


    overlayElement.addEventListener('click', function(clickEvent) {
        if (clickEvent.target === overlayElement) {
            overlayElement.remove();
            if (onCancelCallback) onCancelCallback();
        }
    });
}
