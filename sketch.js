let img;
let stadions;
let screenWidth = 1280;
let screenHeight = 550;

class Stadion {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  display() {
    fill(255, 0, 0);
    noStroke();
    ellipse(this.x, this.y, 10, 10);
  }
}

// Ny: Node arver fra Stadion og får et id
class Node extends Stadion {
  constructor(id, x, y, meta = {}) {
    super(x, y);
    this.id = id;
    this.meta = meta; // valgfrit: til yderligere data
    this.radius = 8;
  }

  // valgfrit: vis id ved hover eller altid
  displayLabel() {
    noStroke();
    fill(0);
    textSize(12);
    textAlign(CENTER, BOTTOM);
    text(this.id, this.x, this.y - 8);
  }

  isMouseOver() {
    return dist(mouseX, mouseY, this.x, this.y) <= this.radius;
  }

  displayTooltip() {
    const lines = [];
    lines.push(this.meta.navn || `Node: ${this.id}`);
    if (this.meta.bynavn) lines.push(`By: ${this.meta.bynavn}`);
    if (this.meta.kapacitet)
      lines.push(`Kapacitet: ${this.meta.kapacitet.toLocaleString()}`);
    if (this.meta.byggetår) lines.push(`Byggetår: ${this.meta.byggetår}`);
    textSize(12);
    const padding = 6;
    const w = max(...lines.map((l) => textWidth(l))) + padding * 2;
    const h = lines.Length * 16 + padding * 2;
    let tx = mouseX + 12;
    let ty = mouseY + 12;
    // hold tooltip indenfor canvas
    if (tx + w > screenWidth) tx = mouseX - w - 12;
    if (ty + h > screenHeight) ty = mouseY - h - 12;
    // baggrund
    noStroke();
    fill(255, 255, 225, 230);
    rect(tx, ty, w, h, 6);
    // tekst
    fill(0);
    textAlign(LEFT, TOP);
    for (let i = 0; i < lines.length; i++) {
      text(lines[i], tx + padding, ty + padding + i * 16);
    }
  }

  highlight() {
    stroke(255, 165, 0);
    strokeWeight(2);
    fill(255, 200, 0, 120);
    ellipse(this.x, this.y, this.radius * 3, this.radius * 3);
  }
}

// Kanter med vægt (afstand)
class Kanter {
  constructor(a, b, vægt) {
    this.a = a; // Node
    this.b = b; // Node
    this.vægt = vægt;
  }
}

// Graf med nodes og kanter
class Graf {
  constructor() {
    this.noder = [];
    this.kanter = [];
  }

  tilføjeNode(node) {
    this.noder.push(node);
  }

  tilføjeKant(a, b) {
    const w = dist(a.x, a.y, b.x, b.y);
    this.kanter.push(new Kanter(a, b, w));
  }

  // Lav fuldt forbundet graf (kan ændres til fx kun naboer inden for threshold)
  forbindAlle() {
    this.kanter = [];
    for (let i = 0; i < this.noder.length; i++) {
      for (let j = i + 1; j < this.noder.length; j++) {
        this.tilføjeKant(this.noder[i], this.noder[j]);
      }
    }
  }

  // Hjælp: returner kanter ud fra node
  naboer(node) {
    const nabo = [];
    for (let e of this.kanter) {
      if (e.a === node) nabo.push({ node: e.b, vægt: e.vægt });
      else if (e.b === node) nabo.push({ node: e.a, vægt: e.vægt });
    }
    return nabo;
  }
  tegnKanter() {
    stroke(0, 0, 255, 150);
    strokeWeight(2);
    for (let e of this.kanter) {
      line(e.a.x, e.a.y, e.b.x, e.b.y);
    }
  }

  tegnNoder() {
    for (let n of this.noder) {
      n.display();
      n.displayLabel();
    }
  }
}

let graf;

function preload() {
  img = loadImage("danmarkskort.png");
}

function drawMap() {
  imageMode(CENTER);
  if (img) {
    image(
      img,
      screenWidth / 2,
      screenHeight / 2,
      (860 / 1071) * screenHeight,
      screenHeight
    );
  }
}

function drawStadions() {
  for (let stadion of stadions) {
    stadion.display();
  }
}

function drawLinesBetweenStadions() {
  stroke(0, 0, 255);
  strokeWeight(2);
  for (let i = 0; i < stadions.length; i++) {
    for (let j = i + 1; j < stadions.length; j++) {
      line(stadions[i].x, stadions[i].y, stadions[j].x, stadions[j].y);
    }
  }
}

function setup() {
  createCanvas(screenWidth, screenHeight);
  // Brug graf + noder i stedet for rå stadions-array
  graf = new Graf();

  // Tilføj noder (brug dine koordinater)
  graf.tilføjeNode(
    new Node("A", 820, 330, {
      navn: "Parken",
      bynavn: "København",
      kapacitet: 38000,
      byggetår: 1992,
    })
  );
  graf.tilføjeNode(
    new Node("B", 630, 380, {
      navn: "Odense Stadion",
      bynavn: "Odense",
      kapacitet: 16000,
      byggetår: 1941,
    })
  );
  graf.tilføjeNode(
    new Node("C", 590, 130, {
      navn: "Aalborg Stadion",
      bynavn: "Aalborg",
      kapacitet: 14000,
      byggetår: 2002,
    })
  );

  // lav alle kanter (fuld graf)
  graf.forbindAlle();

  // Behold stadions hvis du vil bruge den gamle funktion også
  stadions = graf.noder;
}

function draw() {
  background(220);
  drawMap();
  // tegn kanter fra grafen
  graf.tegnKanter();

  // tegn noder
  graf.tegnNoder();

  // håndter hover: find første node under musen
  const hovered = graf.noder.find((n) => n.isMouseOver());
  if (hovered) {
    hovered.highlight();
    hovered.displayTooltip();
  }
}
