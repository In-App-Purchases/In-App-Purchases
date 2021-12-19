jQuery(() => {
  
  $('.card').on('click', (val) => { // handles click on all items with coin class
    // html target passed into callback as 'val'
    const coin = val.target.id; // grabs coin selection
    $.post(`api/selection/${coin}`, () => { // posts selection to the server
      window.location.href = '/'; // reloads the page
      // when page is reloaded, server will parse the cookie and send back a different html page
    })
  });

});