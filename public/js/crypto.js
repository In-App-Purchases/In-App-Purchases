let a = 0;

let costs = [10,100,200,400,1000,100,200,400,800,1200];
let speedUp = [2,10,50,100,200,1,2,5,7,10];
let count = +($("#counter").text()); // initial count value
let delta = 1; // initial change in count per click
let rate = 0;
let randomUp = 0;
var eventOn = false;
var eventCountdown = 0;
let saveData = {manual: {up1: 0,up2: 0,up3: 0,up4: 0,up5: 0}, auto: {up1: 0,up2: 0,up3: 0,up4: 0,up5: 0}, event: {}, money: count};
var eventID = 0;
let events = {};

let sketch = (p) => {
    
    let coinSelection;
    let img;
    $.get('/coin', (res) => {
        coinSelection = res;
        img = p.loadImage(`/img/${coinSelection}.png`);
    });

  let imgs = [];
  const sizeX = 75;
  const sizeY = 75;
  const screenX = 400;
  const screenY = 400;
  
  class Img {
    constructor(img, xSize, ySize) {
      this.img = img;
      this.xSize = xSize;
      this.ySize = ySize;
      this.yPos = -(ySize + 30);
      this.xPos = Math.random()*(400 - xSize);
    }
  }

  let backgroundColors = [247, 86, 124];
  let dark = true;

  const btn = document.querySelector(".btn-toggle");
  $('.btn-toggle').on('click', () => {
    backgroundColors = dark ? [93, 87, 107] : [247,86,124];
    dark = !dark;
  })
  
  p.setup = function() {
    p.createCanvas(screenX, screenY);
    p.background(backgroundColors[0] + 10, backgroundColors[1] + 10, backgroundColors[2] + 10);
  };
  
  p.draw = function() { 
    p.background(backgroundColors[0] + 10, backgroundColors[1] + 10, backgroundColors[2] + 10);
    for(let img in imgs) {
      if(imgs[img])
      p.image(imgs[img].img, imgs[img].xPos, imgs[img].yPos, imgs[img].xSize, imgs[img].ySize);
    }
    moveImgs();
    makeImgs();
    offScreen();
    drawParticles();
  };

  var particles = [];
  
  var burstMin = 8;
  var burstMax = 8;
  
  const drawParticles = () => { 
    for (var i = particles.length - 1; i >= 0; i--) {
      particles[i].update();
      particles[i].draw();
      
      if (particles[i].rad < 0 || particles[i].a < 0) {
        particles.splice(i, 1);
      }
    }
  }
  
  p.mouseClicked = function() {
    checkCollision();
  }
  
  const moveImgs = () => {
    for(let img in imgs) {
      imgs[img].yPos+=3;
    }
  };
  
  const makeImgs = () => {
    if(Math.random()*1000 < 30)
    imgs.push(new Img(img, sizeX, sizeY));
  };
  
  const checkCollision = () => {
    let img;
    for(let index in imgs) {
      img = imgs[index];
      if(isColliding(img.xPos, img.yPos)) {
        imgs.splice(index, 1);
        particleHandleMouse();
        click();
      }
    }
  };
  
  const isColliding = (xPos, yPos) => {
    return (p.mouseX <= xPos + sizeX && p.mouseX >= xPos && p.mouseY <= yPos + sizeY && p.mouseY >= yPos);
  };
  
  const offScreen = () => {
    const imgLen = imgs.length;
    for(let i = imgLen-1; i >= 0; i--) {
      if(imgs[i].yPos>screenY) {
        imgs = imgs.slice(i);
        return;
      }
    }
  };

  const particleHandleMouse = () => {
    var count = Math.floor(Math.random()*24+8);
    for (var i = 0; i < count; i++) {
      var pos = new p5.Vector(p.mouseX, p.mouseY);
      var vel = new p5.Vector(Math.random()*10-5, Math.random()*10-5);
      var par = new Particle(pos, vel);
      particles.push(par);
    }
  }

  function Particle(pos, vel) {
    this.pos = pos;
    this.vel = vel;
		this.acc = new p5.Vector(0, 0.3);
		this.maxLife = 50;
    this.life = this.maxLife;
		this.rad = Math.random()*4+6;
		this.a = Math.random()*155+100;
		this.r = Math.random()*155+100;
		this.g = Math.random()*155+100;
		this.b = Math.random()*155+100;
}

Particle.prototype.update = function() {
    this.life--;
    
    this.pos.add(this.vel);
		this.vel.add(this.acc);
	
		if (p.frameCount % 5 === 0) { this.rad--; this.a--; }
		
}

Particle.prototype.draw = function() {
    p.push();
    p.noStroke();
    p.fill(100, 255, 0);
    p.image(img, this.pos.x, this.pos.y, this.rad*4, this.rad*4);
    p.pop();
}


};

new p5(sketch, document.getElementById('clickDiv'));

jQuery(() => {

    $("#coinImg").on('click', click);

    $('#signOutLink').on('click', () => {
      document.cookie = 'session=none';
      window.location.href = '/';
    });

    $('#changeCoinLink').on('click', () => {
      $.post('/newCoin', (res) => {
        window.location.href = '/';
      });
    });

    const purchaseUpgrade = (upNum) => {
      var upSave = "up" + (upNum  + 1).toString();
        if(saveData.manual[upSave] >= 10){
          document.getElementById('upgrade' + (upNum + 1).toString()).hidden = true;
        }
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
        $(upLoc).text(costs[upNum]);
    }

    const purchaseSpeed = (upNum) => {
        var upSave = "up" + (upNum  - 4).toString();
        if(saveData.auto[upSave] >= 10){
          document.getElementById('speed' + (upNum  - 4).toString()).hidden = true;
        }
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
        
        saveData.auto[upSave] = saveData.auto[upSave] + 1;
        $(upLoc).text(costs[upNum]);
    }

    //auto save timer
    setInterval(function(){
        console.log("SAVED GAME");
        $.post(`/save/${count}/${delta}`, (res) => {

        });
    }, 30000);

    setInterval(function(){
        var chance =  Math.floor(Math.random() * 500);
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
            $("#eventSign").text('No Current Events');
            if(chance == 9 || randomUp >= 1000){
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
        // localStorage.setItem('Count', count);
        // localStorage.setItem('Delta', delta);
        // $.ajax({
        //     contentType: 'application/json',
        //     data: saveData,
        //     dataType: 'json',
        //     url: '/api/savedata',
        //     type: post,
        //     success: function(result){
        //         console.log("Posted");
        //         console.log(result);
        //     },
        //     error: function (result){
        //         console.log(result)
        //     }
        // })
        $.post(`/save/${count}/${delta}`, (res) => {

        });
    });

    $.get('/load', (res) => {
      try {
        count = parseInt(res.count);
        delta = parseInt(res.delta);
      } catch (err) {
        count = 0;
        delta = 1;
      }
    });

});

function playAudio(url){ //deprecated
    new Audio(url).play();
}

function playAudio2(id){
    var x = document.getElementById(id);
    x.play();
}

const click = () => {
    playAudio2('coin_click')
    count = count + delta;
    $("#counter").text(`coins: ${count}`);
    randomUp++;
}