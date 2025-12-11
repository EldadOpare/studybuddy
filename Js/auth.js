


function togglePassword(inputIdentifier) {
    
    const passwordInputElement = document.getElementById(inputIdentifier);
    
    const toggleButtonElement = passwordInputElement.parentElement.querySelector('.toggle_password_button');
    
    const eyeIconElement = toggleButtonElement.querySelector('.eye_icon');

    if (passwordInputElement.type === 'password') {
        
        passwordInputElement.type = 'text';
        
        eyeIconElement.innerHTML = '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line>';
    }
    
    else {
        passwordInputElement.type = 'password';
     
        eyeIconElement.innerHTML = '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle>';
    }
}



function validatePassword(passwordText) {
    const minimumLength = 8;

    const hasUppercaseLetter = /[A-Z]/.test(passwordText);
    const hasNumber = /[0-9]/.test(passwordText);

    const hasSpecialCharacter = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(passwordText);

    if (passwordText.length < minimumLength) {
        return 'Password must be at least 8 characters long';
    }

    if (!hasUppercaseLetter) {
        return 'Password must contain at least one uppercase letter';
    }

    if (!hasNumber) {
        return 'Password must contain at least one number';
    }

    if (!hasSpecialCharacter) {
        return 'Password must contain at least one special character';
    }

    return null;
}



document.addEventListener('DOMContentLoaded', function() {

    const loginFormElement = document.getElementById('loginForm');
    if (loginFormElement) {
        
        loginFormElement.addEventListener('submit', async function(formEvent) {
        
            formEvent.preventDefault();

            const userEmail = document.getElementById('email').value;
            
            const userPassword = document.getElementById('password').value;


            if (!userEmail || !userPassword) {
                showError('Please fill in all fields');
                return;
            }


            try {
                const serverResponse = await loginUser(userEmail, userPassword);

                if (serverResponse.token) {
                    
                    saveAuthToken(serverResponse.token);
                    
                    saveUserData(serverResponse.user);
                }

                showSuccess('Login successful! Redirecting...');

                setTimeout(() => {
                    if (serverResponse.user.role === 'admin') {
                        window.location.href = '/pages/admin_dashboard.html';
                    } else {
                        window.location.href = '/pages/dashboard.html';
                    }
                }, 500);

            } catch (loginError) {
                showError(loginError.message || 'Invalid email or password');
            }
        });
    }



    const signupFormElement = document.getElementById('signupForm');
    if (signupFormElement) {
        
        signupFormElement.addEventListener('submit', async function(formEvent) {
        
            formEvent.preventDefault();

            const userFirstName = document.getElementById('first_name').value;
            
            const userLastName = document.getElementById('last_name').value;

            const userEmail = document.getElementById('signup_email').value;
            
            const userPassword = document.getElementById('signup_password').value;

            const userConfirmPassword = document.getElementById('confirm_password').value;


            if (!userFirstName || !userLastName || !userEmail || !userPassword || !userConfirmPassword) {
                showError('Please fill in all fields');
                return;
            }

            if (userPassword !== userConfirmPassword) {
                showError('Passwords do not match');
                return;
            }


            const passwordValidationError = validatePassword(userPassword);
            if (passwordValidationError) {
                showError(passwordValidationError);
                return;
            }


            try {
                const serverResponse = await signupUser({
                    firstName: userFirstName,
                    lastName: userLastName,
                    email: userEmail,
                    password: userPassword
                });

                if (serverResponse.token) {
                    
                    saveAuthToken(serverResponse.token);
                    
                    saveUserData(serverResponse.user);
                }

                showSuccess('Account created successfully! Redirecting...');


                setTimeout(() => {
                    window.location.href = '/pages/dashboard.html';
                }, 500);

            } catch (signupError) {
                showError(signupError.message || 'Signup failed. Please try again');
            }
        });
    }

});
