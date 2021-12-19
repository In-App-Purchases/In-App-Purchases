let a = 0;

let costs = [10,100,200,400,1000,100,200,400,800,1200,1000,2000,2000,4000,5000]; //costs of each upgrade
let origCosts = [10,100,200,400,1000,100,200,400,800,1200,1000,2000,2000,4000,5000];// base costs of upgrades for use when resetting
let speedUp = [2,10,50,100,200,1,2,5,7,10];// base speed of each upgrade, effects how much currency gained with each upgrade
let origSpeedUp = [2,10,50,100,200,1,2,5,7,10]; // base speeds for use when resetting
let count = +($("#counter").text()); // initial count value
let delta = 1; // initial change in count per click
let rate = 0; // currency gain per second
let randomUp = 0; // failsafe for random events, triggers a random event once over 500
var eventOn = false; // whether an event is going on currently
var eventCountdown = 0; // # of seconds left in current event
let prestige = 1; // how many times the user has prestiged
let saveData = {manual: {up1: 0,up2: 0,up3: 0,up4: 0,up5: 0}, auto: {up1: 0,up2: 0,up3: 0,up4: 0,up5: 0}, event: {up1: 0,up2: 0,up3: 0,up4: 0,up5: 0}, count: 0, delta: 0}; // keeps track of how many upragdes the user has purchased
let origSave = {manual: {up1: 0,up2: 0,up3: 0,up4: 0,up5: 0}, auto: {up1: 0,up2: 0,up3: 0,up4: 0,up5: 0}, event: {up1: 0,up2: 0,up3: 0,up4: 0,up5: 0}, money: count}; // # of upgrades user has purchased, used when resetting
var eventID = 0; // which event is currently happening
let events = {}; //unused
let spawnRate = 30; // rate at which currency appears in screen to click
let userCoin; // which coin icon the user has chosen
//a
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
    if(Math.random()*1000 < spawnRate)
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

    // queries server to prestige the user, resetting upgrades and increases currency per second by new prestige multiplier
    $("#prestigeButton").on('click', function(){
      $.post('/prestige', (res) => {
        if(res=='success') window.location.href = '/';
      });
    });

    $('#signOutLink').on('click', () => {
      document.cookie = 'session=none';
      window.location.href = '/';
    });

    $('#changeCoinLink').on('click', () => {
      $.post('/newCoin', (res) => {
        window.location.href = '/';
      });
    });

    // called when user clicks one of the upgrades in the manual tab
    const purchaseUpgrade = (upNum) => {
      var upSave = "up" + (upNum  + 1).toString(); // locates which upgrade to update in the saveData array
        if(saveData.manual[upSave] >= 10){ //check for # of upgrades purchased is at max amount
          document.getElementById('upgrade' + (upNum + 1).toString()).hidden = true; //hides upgrade button if at maximum
        }
        if(count >= costs[upNum]){ // check if user has enough currency to buy upgrade
            count = count - costs[upNum]; // removes used currency
            delta = delta + speedUp[upNum]; // increases currency gain per click based on upgrade purchased
            costs[upNum] = Math.ceil(costs[upNum] * 1.5); // increase cost of next purchase
            $("#banner").text(''); // makes sure 'insufficient currency icon does not show up
        }
        else{
            $("#banner").text('Insufficient Currency'); // tells user they do not have enough money
            setTimeout(() => {$('#banner').text('');}, 2000); // fades away banner after 2 seconds
        }
        $("#counter").text(`coins: ${Math.floor(count)}`); // updates how much currency user has
        var upLoc = "#costSpeed" + (upNum+1); // locate button of upgrade
        var upSave = "up" + (upNum + 1).toString(); // locates save location for upgrade
        saveData.manual[upSave] = saveData.manual[upSave] + 1; // update save data with new number of purchased upgrades
        $(upLoc).text(costs[upNum]); // updates new cost of next upgrade
    }

    //called when user buys upgrade from automatic tab
    const purchaseSpeed = (upNum) => {
        var upSave = "up" + (upNum  - 4).toString(); // locates which upgrade is being purchased
        if(saveData.auto[upSave] >= 10){ // checks if user has purchased maximum amount of upgrades for this one
          document.getElementById('speed' + (upNum  - 4).toString()).hidden = true; // hides upgrade if max # has been purchased
        }
        if(count >= costs[upNum]){ // checks if user has enough currency to purchase upgrade
            count = count - costs[upNum]; // takes away currency used foer upgrade
            rate = rate + speedUp[upNum]; // increases rate of currency gain per second based on upgrade purchased
            costs[upNum] = Math.ceil(costs[upNum] * 1.5); // increases cost of next upgrade purchased
            $("#banner").text(''); // resets banner of any messages
        }
        else{
            $("#banner").text('Insufficient Currency'); // tells user they do not posses enough currency
            setTimeout(() => {$('#banner').text('');}, 2000); // resets 'insufficient currency message 
        }
        $("#counter").text(`coins: ${Math.floor(count)}`); // updates display with ammount of currency user has
        var upLoc = "#costSpeed" + (upNum+1); // which button was being pressed
        
        saveData.auto[upSave] = saveData.auto[upSave] + 1; // update save data with amount of upgrades user has purchased
        $(upLoc).text(costs[upNum]);// updates cost on button
    }

    const purchaseEvent = (upNum) => {
      var upSave = `up${upNum-10}`; // gets location of which button is pressed
      if(count >= costs[upNum]) {//checks if user has enough currency
        count = count - costs[upNum]; // removes currency used to purchase upgrade
        doEvent(upNum); // calls doEvent function, which doubles spawn rate of coins
        $('#banner').text(''); // clears banner of any messages
        document.getElementById('event' + (upNum  - 9).toString()).hidden = true; // hides button of purchased upgrade
        saveData.auto[upSave] = saveData.auto[upSave] + 1; // updates save data with number of grades purchased
      } else {
        $('#banner').text('Insufficient Currency'); // tells user they do not have enough money
        setTimeout(() => {$('#banner').text('');}, 2000); // removes message after 2 seconds
      }
      $("#counter").text(`coins: ${Math.floor(count)}`); // updates currency possesed by user
    };

    //doubles spawn rate of coins on screen
    const doEvent = (val) => {
      spawnRate*=2;
    };

    //auto save timer
    setInterval(function(){
        console.log("SAVED GAME");
        $.post(`/save/${count}/${delta}`);
        $.post(`/saveManual/${saveData.manual.up1}/${saveData.manual.up2}/${saveData.manual.up3}/${saveData.manual.up4}/${saveData.manual.up5}`);
        $.post(`/saveAuto/${saveData.auto.up1}/${saveData.auto.up2}/${saveData.auto.up3}/${saveData.auto.up4}/${saveData.auto.up5}`);
        $.post(`/saveEvent/${saveData.event.up1}/${saveData.event.up2}/${saveData.event.up3}/${saveData.event.up4}/${saveData.event.up5}`);
    }, 8000);

    //in-game clock, updates every second, does random events, updates currency gains, check if can prestige
    setInterval(function(){
      var can_prestige = false; // boolean on whether the user can prestige or not
        for(var i = 1; i < 6; i++){ // checks if user has purchased all upgrades from manual tab
          var upSave = "up" + i.toString();
          if(saveData.manual[upSave] >= 10){
            can_prestige = true;
          }
          else{
            can_prestige = false;
          }
        }
        for(var i = 1; i < 6; i++){ // checks if user has purchased all upgrades from automatic tab
          var upSave = "up" + i.toString();
          if(saveData.auto[upSave] >= 10){
            can_prestige = true;
          }
          else{
            can_prestige = false;
          }
        }
        if(can_prestige == true){
          setTimeout(()=>{document.getElementById("prestigeButton").hidden = false;},8000); // shows prestige button if all upgrades purchased
        }
        else{
          document.getElementById("prestigeButton").hidden = true; // hides prestige button if not all upgrades purchased
        }
        var chance =  Math.floor(Math.random() * 500); // chance for random event to occur
        if(eventOn == true){ // is there an event currenctly occuring
            $("#eventSign").text(`Event is Happening! Time Remaining: ${eventCountdown}`); // unused
            eventCountdown--; // decreases remaining time for current event
            if(eventCountdown == 0){ // if event is over
                eventOn = false;
                eventID = 0;
            }
            switch(eventID){ // which event is going on
                case 0:
                    delta *= 2; // doubles coin increase pre click
                    rate *= 2; // oubles coin gain per second
                    console.log("influencer");
                    $("#eventSign").text(`Influencer event! (Growth Rate x2)`); // displays which event is occuring currently
                    break;
                case 1:
                    count = 0; // resets user currency
                    console.log("crash");
                    $("#eventSign").text(`Market crash! (Money? Never heard of it.)`); // displays current event
                    break;
            }

            $("#counter").text(`coins: ${Math.floor(count)}`); // update currency count of user
        }
        else{
            $("#eventSign").text('No Current Events'); // tells user no event is currently happening
            if(chance == 9 || randomUp >= 1000){ // trigger a random event based on chance variable or number of clicks
                randomUp = 0; // reset failsafe click count
                eventID =  Math.floor(Math.random() * 2); // selects a random event
                console.log(eventID);
                eventOn = true; // sets reandom event to be active
                eventCountdown = 10; // sets timer for random event
               // console.log("event happens");
            }
            else{
                //console.log("no event");
            }
            count = count + (rate * prestige); // updates user currency based on per second rate and prestige level
            $("#counter").text(`coins: ${Math.floor(count)}`);
        }

    }, 1000);
    // this whole section sets the on click functionality for all upgrades, playing their sounds and the respective upgrade functions
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

     $("#event1").click(function(){
         playAudio2('gpu_upgrade');
         purchaseEvent(10);
      });
      $("#event2").click(function(){
          playAudio2('gpu_upgrade');
          purchaseEvent(11);
      });
      $("#event3").click(function(){
          playAudio2('gpu_upgrade');
          purchaseEvent(12);
      });
      $("#event4").click(function(){
          playAudio2('gpu_upgrade');
          purchaseEvent(13);
      });
      $("#event5").click(function(){
          playAudio2('gpu_upgrade');
          purchaseEvent(14);
      });

    $.get('/load', (res) => { // this sends an initial request to load in savedata from the server
      try {
        saveData = res;
        for(let item in saveData.manual) { // this loads in the manual upgrades
          saveData.manual[item] = parseInt(saveData.manual[item]);
        }
        for(let item in saveData.auto) { // loads in the automatic upgrades
          saveData.auto[item] = parseInt(saveData.auto[item]);
        }
        for(let item in saveData.event) { // loads in the event upgrades
          saveData.event[item] = parseInt(saveData.event[item]);
        }
        count = parseInt(res.count); // loads in the count
        delta = parseInt(res.delta); // loads in the delta
        prestige = parseInt(res.pres) || 1; // loads in the prestige
        $('#pres').text(`Prestige: ${prestige}`); // updates the prestige html tag
        loadSavedata();
      } catch (err) {
        count = 0; // in the case of an error, count and delta set to initial values
        delta = 1;
      }
    });

});

const loadSavedata = () => {
  loadManual();
}

const loadManual = () => {
  let tag;
  for(let item in saveData.manual) {
    tag = parseInt(item.substring(2));
    if(saveData.manual[item]>=10) {
      $(`#upgrade${tag}`).hide();
    } else {
      costs[tag]*=(Math.pow(1.5,tag));
    }
  }
}

const loadAuto = () => {
  let tag;
  for(let item in saveData.auto) {
    tag = parseInt(item.substring(2));
    if(saveData.auto[item]>=10) {
      $(`#speed${tag}`).hide();
    } else {
      costs[tag+5]*=(Math.pow(1.5,tag));
    }
  }
}

const loadEvent = () => {
  let tag;
  for(let item in saveData.auto) {
    tag = parseInt(item.substring(2));
    if(saveData.event[item]) {
      $(`#event${tag}`).hide();
      spawnRate*=2;
    }
  }
}

function playAudio(url){ //deprecated
    new Audio(url).play();
}
// plays audio based on supplied link to sound effect
function playAudio2(id){
    var x = document.getElementById(id);
    x.play();
}

const click = () => { // this function is called each time a coin is clicked
    let randInt;
    $.get('/coin', (res) => { // sends a request to get the user's coin
        userCoin =res;
    });
    randInt = Math.floor(Math.random()*3)+1; // chooses an audio from a random group of coin specific audio files
    if(userCoin=='shiba'){
        playAudio2("inu"+randInt.toString())

    }else if(userCoin=='dream'){
        playAudio2("dream"+randInt)
    }else{
        playAudio2("mauri"+randInt)
    }

    count = count + (delta*prestige); // increases coin based on delta, multiplied by prestige
    $("#counter").text(`coins: ${Math.floor(count)}`); // updates displayed coin count
    randomUp++; // increments random event counter
}