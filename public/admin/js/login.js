'use strict';
const form = document.querySelector('form.login-form');
form.addEventListener('submit', async function(event) {
  event.preventDefault();
  const email = event.target.elements.email.value;
  const password = event.target.elements.password.value;
  
  let res;
  try{
    res = await axios.post(domain+'/admin', {
      email, password,
    });
    res = res.data;
    localStorage.setItem(
      'auth',
      res.data.auth.token,
    );
    window.location.href='/admin/dashboard';
  } catch(err) {
    let message = err.message;
    if (err.response && err.response.data.message) {
      message = err.response.data.message;
    }
    if (err.response && err.response.data.errors) {
      message = err.response.data.errors[0];
    }
    if (err.response && err.response.data.error) {
      message = err.response.data.error;
    }
    document.querySelector('.email')
      .classList
      .add('is-invalid');
    const validationEmail = document.querySelector('#validationEmail')
    validationEmail.textContent = message;
    validationEmail.classList
      .remove('hide');
  }
});
