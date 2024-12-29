// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    sendEmailVerification,
    sendPasswordResetEmail,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";
import { getFirestore, setDoc, doc } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyChSIshhZrWUEvOmdOdiH-61xGInE4DzI8",
    authDomain: "gamerz-bd1b5.firebaseapp.com",
    projectId: "gamerz-bd1b5",
    storageBucket: "gamerz-bd1b5.firebasestorage.app",
    messagingSenderId: "553132072060",
    appId: "1:553132072060:web:2dbe3627d15464c4c7bdf9",
    measurementId: "G-0NE8PGPSZW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

function showMessage(message, type) {
    const existingAlert = document.querySelector('.alert-container');
    if (existingAlert) {
        existingAlert.remove();
    }

    const alertContainer = document.createElement('div');
    alertContainer.className = `alert-container ${type}`;

    const icon = document.createElement('span');
    icon.className = 'alert-icon';
    icon.innerHTML = type === 'success' ? '✓' : '✕';

    const messageText = document.createElement('p');
    messageText.className = 'alert-message';
    messageText.textContent = message;

    alertContainer.appendChild(icon);
    alertContainer.appendChild(messageText);
    document.body.appendChild(alertContainer);

    setTimeout(() => {
        alertContainer.classList.add('slide-in');
    }, 10);

    setTimeout(() => {
        alertContainer.classList.add('slide-out');
        setTimeout(() => {
            alertContainer.remove();
        }, 300);
    }, 2000);
}

const signUp = document.getElementById('submitSignUp');
signUp.addEventListener('click', (event) => {
    event.preventDefault();
    const email = document.getElementById('rEmail').value;
    const password = document.getElementById('rPassword').value;
    const firstName = document.getElementById('fName').value;
    const lastName = document.getElementById('lName').value;

    const auth = getAuth();
    const db = getFirestore();

    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            
            sendEmailVerification(user)
                .then(() => {
                    showMessage('Verification email sent! Please check your inbox', 'success');
                })
                .catch((error) => {
                    showMessage('Error sending verification email', 'error');
                });

            const userData = {
                email: email,
                firstName: firstName,
                lastName: lastName,
                emailVerified: false
            };

            const docRef = doc(db, "users", user.uid);
            setDoc(docRef, userData)
                .then(() => {
                    showMessage('Account created successfully!', 'success');
                    setTimeout(() => {
                        window.location.href = 'index.html';
                    }, 2500);
                })
                .catch((error) => {
                    showMessage('Error creating account', 'error');
                });
        })
        .catch((error) => {
            const errorCode = error.code;
            if (errorCode == 'auth/email-already-in-use') {
                showMessage('Email Address Already Exists!', 'error');
            } else {
                showMessage('Unable to create User', 'error');
            }
        });
});

const signIn = document.getElementById('submitSignIn');
signIn.addEventListener('click', (event) => {
    event.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const auth = getAuth();

    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            
            if (user.emailVerified) {
                showMessage('Login successful!', 'success');
                localStorage.setItem('loggedInUserId', user.uid);
                setTimeout(() => {
                    window.location.href = 'homepage.html';
                }, 2500);
            } else {
                showMessage('Please verify your email before logging in', 'error');
                sendEmailVerification(user)
                    .then(() => {
                        showMessage('New verification email sent', 'success');
                    })
                    .catch((error) => {
                        showMessage('Error sending verification email', 'error');
                    });
            }
        })
        .catch((error) => {
            const errorCode = error.code;
            if (errorCode === 'auth/invalid-credential') {
                showMessage('Incorrect Email or Password', 'error');
            } else {
                showMessage('Account does not Exist', 'error');
            }
        });
});

// Forgot Password functionality
const forgotPasswordLink = document.getElementById('forgotPasswordLink');

// When the "Forgot Password?" link is clicked
forgotPasswordLink.addEventListener('click', (event) => {
    event.preventDefault();

    const email = prompt("Please enter your email to reset your password:");

    if (email) {
        const auth = getAuth();

        // Send password reset email
        sendPasswordResetEmail(auth, email)
            .then(() => {
                showMessage('Password reset email sent! Please check your inbox', 'success');
            })
            .catch((error) => {
                showMessage('Error sending password reset email: ' + error.message, 'error');
            });
    } else {
        showMessage('Please enter a valid email address', 'error');
    }
});

// Check auth state changes
onAuthStateChanged(getAuth(), (user) => {
    if (user) {
        if (window.location.pathname.includes('homepage.html') && !user.emailVerified) {
            window.location.href = 'index.html';
        }
    } else {
        if (window.location.pathname.includes('homepage.html')) {
            window.location.href = 'index.html';
        }
    }
});
