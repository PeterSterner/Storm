let img;

function preload() {
  img = loadImage('danmarkskort.png');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  
}

function draw() {
  background(220);
  if (img) {
    image(img, windowWidth/2-215, 0, 860/1071*windowHeight, windowHeight);
  }
}
