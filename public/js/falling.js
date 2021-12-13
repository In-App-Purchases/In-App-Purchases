import { click } from 'crypto.js';

let sketch = (p) => {

  let imgs = [];
  const sizeX = 75;
  const sizeY = 75;
  const screenX = 400;
  const screenY = 400;
  let backgroundColors = [120, 120, 120];
  let imgName = 'shiba';
  
  class Img {
    constructor(img, xSize, ySize) {
      this.img = img;
      this.xSize = xSize;
      this.ySize = ySize;
      this.yPos = -(ySize + 30);
      this.xPos = Math.random()*(400 - xSize);
    }
  }
  
  function setup() {
    createCanvas(screenX, screenY);
    p.background(backgroundColors[0], backgroundColors[1], backgroundColors[2]);
  };
  
  function draw () { 
    p.background(backgroundColors[0], backgroundColors[1], backgroundColors[2]);
    for(let img in imgs) {
      if(imgs[img])
      p.image(imgs[img].img, imgs[img].xPos, imgs[img].yPos, imgs[img].xSize, imgs[img].ySize);
    }
    moveImgs();
    makeImgs();
    offScreen();
  };
  
  function mouseClicked() {
    checkCollision();
  }
  
  const moveImgs = () => {
    for(let img in imgs) {
      imgs[img].yPos+=3;
    }
  };
  
  const makeImgs = () => {
    if(Math.random()*1000 < 30)
    p.loadImage(`${imgName}.png`, res => {
      imgs.push(new Img(res, sizeX, sizeY));
      sem = 0;
    });
  };
  
  const checkCollision = () => {
    let img;
    for(let index in imgs) {
      img = imgs[index];
      if(isColliding(img.xPos, img.yPos)) {
        imgs.splice(index, 1);
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

};

new p5(sketch, window.document.getElementById('clickDiv'));