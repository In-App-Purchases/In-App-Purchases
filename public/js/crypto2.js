$('document').ready(() => {

    let costs = [10,100,200,400, 1000,100,200,400,800,1200];
    let speedUp = [2,10,50,100,200,1,2,5,7,10];

    let count = +($("#counter").text()); // initial count value
    let delta = 1; // initial change in count per click
    let rate = 0;

    $("#coinIcon").click(function(){
        playAudio2('coin_click')
        count = count + delta;
        $("#counter").text(`coins: ${count}`);
    });

    const purchaseUpgrade = (upNum) => {
        if(count >= costs[upNum]){
            count = count - costs[upNum];
            delta = delta + speedUp[upNum];
            costs[upNum] = Math.ceil(costs[upNum] * 1.03);
        }
        else{
            alert("insufficient currency");
        }
        $("#counter").text(`coins: ${count}`);
        var upLoc = "#costSpeed" + (upNum+1);
        console.log(upLoc);
        $(upLoc).text(costs[upNum]);
    }

    const purchaseSpeed = (upNum) => {
        if(count >= costs[upNum]){
            count = count - costs[upNum];
            rate = rate + speedUp[upNum];
            costs[upNum] = Math.ceil(costs[upNum] * 1.03);
        }
        else{
            alert("insufficient currency");
        }
        $("#counter").text(`coins: ${count}`);
        var upLoc = "#costSpeed" + (upNum+1);
        console.log(upLoc);
        $(upLoc).text(costs[upNum]);
    }



    setInterval(function(){
        count = count + rate;
        $("#counter").text(`coins: ${count}`);
    },500);

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

