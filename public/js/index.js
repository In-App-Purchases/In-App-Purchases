let reg = true;
let username = localStorage.getItem('username');
let password = localStorage.getItem('password');
const $swap = $('.swap');
let signInMode = false;

$('document').ready(() => {

  if(document.cookie.indexOf('session')) {
    $.get('/tokenVerify', (res) => {
      if(res !== 'na') window.location.href = '/crypto';
    });
  }

  $('#signInLink').on('click', () => {
    if(signInMode) {
      $('#signInLink').text('Already have an account?');
      $('#submitLogin').text('Register');
    } else {
      $('#signInLink').text('Need to make an account?');
      $('#submitLogin').text('Sign In');
    }
    $('#pass2').slideToggle();
    signInMode = !signInMode;
  });

  $('#submitLogin').on('click', () => {
    $('#emailAlert').hide();
    $('#passAlert').hide();
    $('#emailAlert').html('');
    $('#passAlert').html('');
    (signInMode) ? signIn() : register();
  });

});

const signIn = () => {
  const email = $('#inputEmail').val();
  const pass = $('#inputPassword1').val();
  $.get(`/login/${email}/${pass}`, (res) => {
    if(!res.indexOf('auth/')) {
      $('#passAlert').show();
      $('#passAlert').html('email or password invalid - please try again');
    } else {
      document.cookie = `session=${res}`;
      window.location.href='/crypto';
    }
  });
};

const register = () => {
  const email = $('#inputEmail').val();
  const pass1 = $('#inputPassword1').val();
  const pass2 = $('#inputPassword2').val();
  $.get(`register/${email}/${pass1}/${pass2}`, (res) => {
    if(res === 'pdnm') {
      $('#passAlert').show();
      $('#passAlert').html('passwords do not match');
    } else if(res === 'fep') {
      $('#emailAlert').show();
      $('#passAlert').show();
      $('#emailAlert').html('email invalid');
      $('#passAlert').html('password invalid - be sure to use 8 characters, at least one number, one uppercase, and one lowercase');
    } else if(res === 'fe') {
      $('#emailAlert').show();
      $('#emailAlert').html('email invalid');
    } else if(res === 'fp') {
      $('#passAlert').show();
      $('#passAlert').html('password invalid - be sure to use 8 characters, at least one number, one uppercase, and one lowercase');
    } else if(res === 'auth/email-already-in-use') {
      $('#emailAlert').show();
      $('#emailAlert').html('email invalid - already in use');
    } else {
      document.cookie = `session=${res}`;
      window.location.href='/crypto';
    }
  });
};