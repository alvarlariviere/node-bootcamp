/* eslint-disable */
import '@babel/polyfill';
import { displayMap } from './mapbox';
import { login, logout } from './login';
import { updateSettings } from './updateSettings';
import { bookTour } from './stripe';
import { showAlert } from './alerts';

// DOM ELEMENTS
const alertMessage = document.querySelector('body').dataset.alert;
const mapBox = document.getElementById('map');
const loginForm = document.querySelector('.form--login');
const logoutBtn = document.querySelector('.nav__el--logout');
const userDataForm = document.querySelector('.form-user-data');
const userPasswordForm = document.querySelector('.form-user-password');
const bookBtn = document.getElementById('book-tour');

// HELPER
const setButton = (btn, enable, textContent, toggleClass) => {
  btn.classList.toggle(toggleClass.fromClass);
  btn.classList.toggle(toggleClass.toClass);
  btn.textContent = textContent;
  btn.disabled = !enable;
};

// DELEGATION
if (alertMessage) {
  showAlert('success', alertMessage, 20);
}

if (mapBox) {
  const locations = JSON.parse(mapBox.dataset.locations);
  displayMap(locations);
}

if (loginForm) {
  loginForm.addEventListener('submit', e => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
  });
}

if (logoutBtn) {
  logoutBtn.addEventListener('click', logout);
}

if (userDataForm) {
  userDataForm.addEventListener('submit', async e => {
    e.preventDefault();
    // const name = document.getElementById('name').value;
    // const email = document.getElementById('email').value;
    const btn = document.querySelector('.btn--save-data');
    const form = new FormData();
    form.append('name', document.getElementById('name').value);
    form.append('email', document.getElementById('email').value);
    form.append('photo', document.getElementById('photo').files[0]);

    setButton(btn, false /* disabled */, 'Saving...', { fromClass: 'btn--green', toClass: 'btn--white' });
    // await updateSettings({ name, email }, 'data');
    await updateSettings(form, 'data');
    setButton(btn, true /* enable */, 'Save settings', { fromClass: 'btn--white', toClass: 'btn--green' });
    window.setTimeout(() => location.reload(true), 1500);
  });
}

if (userPasswordForm) {
  userPasswordForm.addEventListener('submit', async e => {
    e.preventDefault();

    const passwordCurrent = document.getElementById('password-current').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;
    const btn = document.querySelector('.btn--save-password');

    setButton(btn, false /* disabled */, 'Saving...', { fromClass: 'btn--green', toClass: 'btn--white' });
    await updateSettings({ passwordCurrent, password, passwordConfirm }, 'password');
    setButton(btn, true /* enable */, 'Save password', { fromClass: 'btn--white', toClass: 'btn--green' });

    document.getElementById('password-current').value = '';
    document.getElementById('password').value = '';
    document.getElementById('password-confirm').value = '';
  });
}

if (bookBtn) {
  bookBtn.addEventListener('click', async e => {
    const { tourId } = e.target.dataset;
    setButton(bookBtn, false /* disabled */, 'Processing...', { fromClass: 'btn--green', toClass: 'btn--white' });
    await bookTour(tourId);
    setButton(bookBtn, true /* enable */, 'Book tour now!', { fromClass: 'btn--white', toClass: 'btn--green' });
  });
}
