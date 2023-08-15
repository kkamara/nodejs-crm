'use strict';

const run = async () => {
  try {
    const token = localStorage.getItem('auth');
    if (null === token) {
      window.location.href = domain+'/admin';
    }
    const authResponse = await axios.post(
      domain+'/admin/authenticate', 
      null,
      {
        headers: {
          'Authorization': `Basic ${token}`,
        },
      },
    );
    const authData = authResponse.data;
    console.log(authData);
    document.querySelector('.fullName')
      .textContent = authData.data.auth.firstName + ' ' + authData.data.auth.lastName;

    const page = await axios.post(
      domain+'/admin/dashboard', 
      null,
      {
        headers: {
          'Authorization': `Basic ${token}`,
        },
      },
    );
    const dashboardData = page.data;
    console.log(dashboardData);
    document.querySelector('.usersCount')
      .textContent = dashboardData.data.usersCount;
  } catch (err) {
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
    console.log(message);
  }
};

run();