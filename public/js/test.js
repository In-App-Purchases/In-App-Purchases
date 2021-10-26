$('document').ready(() => {

    $('#submitSignUp').on('click', () => {
        const email = $('#email').val();
        const pass = $('#pass').val();
        $.post(`/register/${email}/${pass}`, (res) => {
            console.log(res);
        });
    });

});