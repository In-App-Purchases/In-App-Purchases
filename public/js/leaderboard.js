jQuery(() => {

  $.post('/initLeaderboard', (res) => {
    sendRequest();
    renderUsers(res);
  })

});

let users;

const sendRequest = () => {
  $.post('/leaderboardPoll', (res) => {
    sendRequest();
    renderUsers(res);
  });
};

const renderUsers = (data) => {
  $('#leaderStats').html('');
  data = bblSort(data);
  for(let index in data) {
    console.log(data[index]);
    $('#leaderStats').append(`
    <hr />
    <div class="row">
      <div class="col-2"></div>
      <div class="col-2"><p class="lg-text">${parseInt(index)+1}</p></div>
      <div class="col-4"><p class="lg-text"><a href="mailto:${data[index].email}" style="text-decoration: underline">${data[index].email}</a></p></div>
      <div class="col-3"><p class="lg-text" style="text-align: left">${data[index].count}</p></div>
      <div class="col-1"></div>
    </div>
    <hr />
    `);
  }
}

function bblSort(arr){
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
