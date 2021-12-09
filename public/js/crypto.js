let a = 0;

jQuery(() => {
    
    $.get('/coin', (res) => {
        $('#coinImg').attr('src',`/img/${res}.png`);
    });

    let costs = [10,100,200,400, 1000,100,200,400,800,1200];
    let speedUp = [2,10,50,100,200,1,2,5,7,10];
    let timer = 60;
    let count = +($("#counter").text()); // initial count value
    let delta = 1; // initial change in count per click
    let rate = 0;
    let randomUp = 0;
    var eventOn = false;
    var eventCountdown = 0;
    var eventID = 0;
    let saveData = {manual: {up1: 0,up2: 0,up3: 0,up4: 0,up5: 0}, auto: {up1: 0,up2: 0,up3: 0,up4: 0,up5: 0}, event: {}, money: count};
    let events = {};

    $("#coinImg").click(function(){
        playAudio2('coin_click')
        count = count + delta;
        $("#counter").text(`coins: ${count}`);
        randomUp++;
    });

    $('#signOutLink').on('click', () => {
      document.cookie = 'session=none';
      window.location.href = '/';
    });

    const purchaseUpgrade = (upNum) => {
        if(count >= costs[upNum]){
            count = count - costs[upNum];
            delta = delta + speedUp[upNum];
            costs[upNum] = Math.ceil(costs[upNum] * 1.5);
            $("#banner").text('');
        }
        else{
            $("#banner").text('Insufficient Currency');
        }
        $("#counter").text(`coins: ${count}`);
        var upLoc = "#costSpeed" + (upNum+1);
        var upSave = "up" + (upNum + 1).toString();
        saveData.manual[upSave] = saveData.manual[upSave] + 1;
        console.log(saveData);
        $(upLoc).text(costs[upNum]);
    }

    const purchaseSpeed = (upNum) => {
        if(count >= costs[upNum]){
            count = count - costs[upNum];
            rate = rate + speedUp[upNum];
            costs[upNum] = Math.ceil(costs[upNum] * 1.5);
            $("#banner").text('');
        }
        else{
            $("#banner").text('Insufficient Currency');
        }
        $("#counter").text(`coins: ${count}`);
        var upLoc = "#costSpeed" + (upNum+1);
        var upSave = "up" + (upNum  - 4).toString();
        saveData.auto[upSave] = saveData.auto[upSave] + 1;
        console.log(saveData);
        $(upLoc).text(costs[upNum]);
    }

    setInterval(function(){
        var chance =  Math.floor(Math.random() * 10);
        $("#time-remaining").text(`Time Remaining: ${timer}`);
        timer--;
        if(timer == 0){
            alert("game over");
            //submit score here
            window.location.href = '/leaderboard';
        }
        if(eventOn == true){
            $("#eventSign").text(`Event is Happening! Time Remaining: ${eventCountdown}`);
            eventCountdown--;
            if(eventCountdown == 0){
                eventOn = false;
                eventID = 0;
            }
            switch(eventID){
                case 0:
                    count = count + (rate *  2);
                    console.log("influencer");
                    $("#eventSign").text(`Influencer event(Growth Rate x2) Time Remaining: ${eventCountdown}`);
                    break;
                case 1:
                    count = count + Math.floor(rate /  2);
                    console.log("crash");
                    $("#eventSign").text(`Market crash(Growth Rate x0.5) Time Remaining: ${eventCountdown}`);
                    break;
            }
            
            $("#counter").text(`coins: ${count}`);
        }
        else{
            $("#eventSign").text('');
            if(chance == 9 || randomUp >= 9){
                randomUp = 0;
                eventID =  Math.floor(Math.random() * 2);
                console.log(eventID);
                eventOn = true;
                eventCountdown = 10;
                console.log("event happens");
            }
            else{
                console.log("no event");
            }
            count = count + rate;
            $("#counter").text(`coins: ${count}`);
        }
        
    }, 1000);

    $("#upgrade1").click(function(){
        playAudio2('pick_upgrade');
       purchaseUpgrade(0);
    });
    $("#upgrade2").click(function(){
        playAudio2('pick_upgrade');
        purchaseUpgrade(1);
     });
     $("#upgrade3").click(function(){
         playAudio2('pick_upgrade');
        purchaseUpgrade(2);
     });
     $("#upgrade4").click(function(){
         playAudio2('pick_upgrade');
        purchaseUpgrade(3);
     });
     $("#upgrade5").click(function(){
         playAudio2('pick_upgrade');
        purchaseUpgrade(4);
     });

    $("#speed1").click(function(){
        playAudio2('gpu_upgrade');
        purchaseSpeed(5);
     });
     $("#speed2").click(function(){
         playAudio2('gpu_upgrade');
        purchaseSpeed(6);
     });
     $("#speed3").click(function(){
         playAudio2('gpu_upgrade');
        purchaseSpeed(7);
     });
     $("#speed4").click(function(){
         playAudio2('gpu_upgrade');
        purchaseSpeed(8);
     });
     $("#speed5").click(function(){
         playAudio2('gpu_upgrade');
        purchaseSpeed(9);
     });


    $("#saveButton").click(function(){
        localStorage.setItem('Count', count);
        localStorage.setItem('Delta', delta);
        $.ajax({
            contentType: 'application/json',
            data: saveData,
            dataType: 'json',
            url: '/api/savedata',
            type: post,
            success: function(result){
                console.log("Posted");
                console.log(result);
            },
            error: function (result){
                console.log(result)
            }
        })
    });

    $("#loadButton").click(function(){
        count = +(localStorage.getItem('Count'));
        delta = +(localStorage.getItem('Delta'));
        $("#counter").text(`coins: ${count}`);
    });

});

function playAudio(url){ //deprecated
    new Audio(url).play();
}

function playAudio2(id){
    var x = document.getElementById(id);
    x.play();
}

