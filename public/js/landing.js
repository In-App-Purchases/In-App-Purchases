let reg = true;
let username = localStorage.getItem('username');
let password = localStorage.getItem('password');

$('document').ready(() => {
    $('#submitLogin').on('click', ()=>{
        register($('#inputEmail1').val(), $('#inputPassword1').val(), $('#inputPassword2').val());
    });
    if(username!=null && password!=null) {
        switchToLogin();
    }
    $('#inputPassword1').on('keyup', () => {
        $('#passAlert').slideUp();
        $('#passAlert2').slideUp();
    });
    $('#inputPassword2').on('keyup', () => {
        $('#passAlert').slideUp();
        $('#passAlert2').slideUp();
    });
    $('#inputEmail1').on('keyup', () => {
        $('#emailAlert').slideUp();
    });
    $('#signInLink').on('click', () => {
        switchToLogin();
    });
    $('#cryptoAltButton').on('click', () => {
        window.location = './crypto2.html';
    });
});

const register = (email, p1, p2) => {
    if(!validate(email, p1, p2)) {
        localStorage.setItem('username', email);
        localStorage.setItem('password', p2);
        addNavButtonFunc();
        loggedIn();
    }
};

const validate = (email, p1, p2) => {
    let fail = 0;
    let pa = "";
    let ea = "";
    if(!checkEmail(email)) {
        ea = ('Invalid Email');
        fail = 1;
    }
    if(!checkPassword(p1)) {
        pa = ('Password must have at least eight characters, with at least one uppercase, one lowercase, and one number.');
        fail = 1;
    }
    if(p1!=p2) {
        pa = ('Passwords Do Not Match');
        fail = 1;
    }
    passAlert(pa);
    emailAlert(ea);
    return fail;
}

const checkEmail = (email) => {
    const regex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return regex.test(email);
};

const checkPassword = (pass) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
    return regex.test(pass);
}

const passAlert = (alert) => {
    if(alert==="") return;
    $('#passAlert').html(alert);
    $('#passAlert2').html(alert);
    $('#passAlert').slideDown();
    $('#passAlert2').slideDown();
}

const emailAlert = (alert) => {
    if(alert==="") return;
    $('#emailAlert').html(alert);
    $('#emailAlert').slideDown();
}

const switchToLogin = () => {
    $('#pass2').slideToggle();
    $('#passAlert').slideUp();
    reg=!reg;
    if(reg) {
        $('#submitLogin').html('Register');
        $('#signInLink').html('Already Have An Account?');
        $('#submitLogin').off();
        $('#submitLogin').on('click', () => {
            console.log('b');
            register($('#inputEmail1').val(), $('#inputPassword1').val(), $('#inputPassword2').val());
        });
    } else {
        $('#submitLogin').html('Login');
        $('#signInLink').html('Need To Make An Account?');
        $('#submitLogin').off();
        $('#submitLogin').on('click', () => {
            login($('#inputEmail1').val(), $('#inputPassword1').val());
        });
    }
};

const login = (email, pass) => {
    if(username === email && pass == password) {
        $('#register').hide();
        $('#landing').show();
        addNavButtonFunc();
        loggedIn();
    } else {
        console.log('aaaaa');
        console.log(username, email);
        console.log(pass, password);
        emailAlert('Incorrect Email or Password, Please Try Again');
    }
};

const addNavButtonFunc = () => {
    $('#clickerLink').removeClass('disabled');
    $('#investLink').removeClass('disabled');
}

const loggedIn = () => {
    $('#loginPage').slideUp();
    $('#getStarted').slideDown();
}