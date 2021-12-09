jQuery(() => {
  
  $('.card').on('click', (val) => {
    const coin = val.target.id;
    $.post(`api/selection/${coin}`, () => {
      window.location.href = '/';
    })
  });

});