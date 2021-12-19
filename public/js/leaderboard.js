jQuery(() => {

  $.post('/initLeaderboard', (res) => { // initializes the leaderboard
    sendRequest();
    renderUsers(res);
  })

});

const sendRequest = () => { // sends a REST Hook to the server
  $.post('/leaderboardPoll', (res) => { // sends post request
    sendRequest(); // upon response, sends another REST Hook
    renderUsers(res); // re-renders the users
  });
};

const renderUsers = (data) => { // render user helper function
  $('#leaderStats').html(''); // clears leaderboard
  data = bblSort(data); // sorts data passed into function
  for(let index in data) { // loops through data
    console.log(data[index]);
    // appends a div representing a single leaderboard entry
    $('#leaderStats').append(`
    <hr />
    <div class="row">
      <div class="col-2"></div>
      <div class="col-2"><p class="lg-text">${parseInt(index)+1}</p></div>
      <div class="col-4"><p class="lg-text"><a href="mailto:${data[index].email}" style="text-decoration: underline">${data[index].email}</a></p></div>
      <div class="col-3"><p class="lg-text" style="text-align: right">${data[index].count}</p></div>
      <div class="col-1"></div>
    </div>
    <hr />
    `);
  }
}

function bblSort(arr){ // bubble sort being used to sort scores from highest to lowest
  for(var i = 0; i < arr.length; i++){
    for(var j = 0; j < ( arr.length - i -1 ); j++){
      if(parseInt(arr[j].count) < parseInt(arr[j+1].count)){
        var temp = arr[j];
        arr[j] = arr[j + 1];
        arr[j+1] = temp;
      }
    }
  }
  return arr;
}
