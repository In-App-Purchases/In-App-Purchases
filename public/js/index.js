let signInMode = false; // global variable controlling whether the user is registering or signing in

$('document').ready(() => {

  if(document.cookie.indexOf('session')) { // finds if a cookie called 'session' exists
    $.get('/tokenVerify', (res) => { // sends authentication request to server using JWT stored in session cookie
      if(res !== 'na') window.location.href = '/'; // if response != 'na', changes url
      // the above if statement should never be true... in the initial get request the cookie
      // is read and the appropriate html page is sent back based on authentication and session state
    });
  }

  $('#signInLink').on('click', () => { // alternates between signing in and registering
    if(signInMode) {
      $('#signInLink').text('Already have an account?');
      $('#submitLogin').text('Register');
    } else {
      $('#signInLink').text('Need to make an account?');
      $('#submitLogin').text('Sign In');
    }
    $('#pass2').slideToggle();
    signInMode = !signInMode; // this is the control variable
  });

  $('#submitLogin').on('click', () => { // handles login submission
    $('#emailAlert').hide();
    $('#passAlert').hide();
    $('#emailAlert').html('');
    $('#passAlert').html('');
    (signInMode) ? signIn() : register(); // determines whether to sign in or register
  });
  
});

const signIn = () => { // signs user in
  const email = $('#inputEmail').val(); // grabs email input
  const pass = $('#inputPassword1').val(); // grabs password input
  $.get(`/login/${email}/${pass}`, (res) => { // requests login using email and password
    if(!res.indexOf('auth/')) { // if signing in doesnt work show alert
      $('#passAlert').show();
      $('#passAlert').html('email or password invalid - please try again');
    } else {
      document.cookie = `session=${res}`; // holds signed JWT holding user id in cookies
      window.location.href='/'; // reloads the page
      // when page is reloaded, server will parse the cookie and send back a different html page
    }
  });
};

const register = () => {
  const email = $('#inputEmail').val(); // grabs email from user input
  const pass1 = $('#inputPassword1').val(); // grabs first password from user input
  const pass2 = $('#inputPassword2').val(); // grabs confirmed password from user input
  $.get(`register/${email}/${pass1}/${pass2}`, (res) => { // requests a new account
    if(res === 'pdnm') { // shows alert if passwords do not match
      $('#passAlert').show();
      $('#passAlert').html('passwords do not match');
    } else if(res === 'fep') { // shows alert if email and password fail server side regex
      $('#emailAlert').show();
      $('#passAlert').show();
      $('#emailAlert').html('email invalid');
      $('#passAlert').html('password invalid - be sure to use 8 characters, at least one number, one uppercase, and one lowercase');
    } else if(res === 'fe') { // shows alert if email fails server regex
      $('#emailAlert').show();
      $('#emailAlert').html('email invalid');
    } else if(res === 'fp') { // shows alert if password fails server regex
      $('#passAlert').show();
      $('#passAlert').html('password invalid - be sure to use 8 characters, at least one number, one uppercase, and one lowercase');
    } else if(res === 'auth/email-already-in-use') { // shows alert if email is already being used
      $('#emailAlert').show();
      $('#emailAlert').html('email invalid - already in use');
    } else { // otherwise, it works, and the JTW with UID is stored in cookies, and page is reloaded
      document.cookie = `session=${res}`;
      window.location.href='/';
      // when page is reloaded, server will parse the cookie and send back a different html page
    }
  });
};