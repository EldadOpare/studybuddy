// Password visibility toggle function
function togglePassword(inputId) {
    const passwordInput = document.getElementById(inputId);
    const button = passwordInput.parentElement.querySelector('.toggle_password_button');
    const eyeIcon = button.querySelector('.eye_icon');

    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        eyeIcon.innerHTML = '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line>';
    } else {
        passwordInput.type = 'password';
        eyeIcon.innerHTML = '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle>';
    }
}


// Password validation function
function validatePassword(password) {
    // At least 8 characters, 1 uppercase, 1 number, 1 special character
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

    if (password.length < minLength) {
        return 'Password must be at least 8 characters long';
    }

    if (!hasUpperCase) {
        return 'Password must contain at least one uppercase letter';
    }

    if (!hasNumber) {
        return 'Password must contain at least one number';
    }

    if (!hasSpecialChar) {
        return 'Password must contain at least one special character';
    }

    return null;
}


// Form submission handlers
document.addEventListener('DOMContentLoaded', function() {

    // Login form handler
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            // Basic validation
            if (!email || !password) {
                alert('Please fill in all fields');
                return;
            }

            // For now, just redirect to dashboard
            // In production, you would send this to your backend
            console.log('Login attempt:', { email });
            window.location.href = 'dashboard.html';
        });
    }


    // Signup form handler
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        signupForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const firstName = document.getElementById('first_name').value;
            
            const lastName = document.getElementById('last_name').value;
            
            const email = document.getElementById('signup_email').value;
            
            const password = document.getElementById('signup_password').value;
            
            const confirmPassword = document.getElementById('confirm_password').value;

            // Basic validation
            if (!firstName || !lastName || !email || !password || !confirmPassword) {
                alert('Please fill in all fields');
                return;
            }

            // Password match validation
            if (password !== confirmPassword) {
                alert('Passwords do not match');
                return;
            }

            // Password strength validation
            const passwordError = validatePassword(password);
            if (passwordError) {
                alert(passwordError);
                return;
            }

            // For now, just redirect to dashboard
            // In production, you would send this to your backend
            console.log('Signup attempt:', { firstName, lastName, email });
            window.location.href = 'dashboard.html';
        });
    }

});
