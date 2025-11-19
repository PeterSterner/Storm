let img;
let stadions;
let screenWidth = 1280;
let screenHeight = 550;
let maxKantVægt = 12;

function tegnTabelOverVægte() {
  if (!graf || !graf.noder) return;

  const nodes = graf.noder;
  const n = nodes.length;
  let cellWidth = 52.25;
  let cellHeight = 20;

  // helper: find vægt mellem to noder
  function getWeight(a, b) {
    for (let e of graf.kanter) {
      if ((e.a === a && e.b === b) || (e.a === b && e.b === a)) {
        return e.vægt < maxKantVægt ? e.vægt : "-";
      }
    }
    return "-";
  }

  // tegn header række
  for (let j = 0; j < n + 1; j++) {
    let x = j * cellWidth;
    let y = 10;
    stroke(0);
    noFill();
    rect(x, y, cellWidth, cellHeight);

    fill(0);
    noStroke();
    textSize(12);
    textAlign(CENTER, CENTER);
    if (j === 0) {
      text("Vægt", x + cellWidth / 2, y + cellHeight / 2 + 6);
    } else {
      text(nodes[j - 1].id, x + cellWidth / 2, y + cellHeight / 2 + 6);
    }
  }

  // tegn data rækker
  for (let i = 0; i < n; i++) {
    let rowY = (i + 1) * cellHeight + 10;

    // første celle: node-id
    stroke(0);
    noFill();
    rect(0, rowY, cellWidth, cellHeight);
    fill(0);
    noStroke();
    textSize(12);
    textAlign(CENTER, CENTER);
    text(nodes[i].id, cellWidth / 2, rowY + cellHeight / 2 + 6);

    // vægt-celler
    for (let j = 0; j < n; j++) {
      let x = (j + 1) * cellWidth;
      stroke(0);
      noFill();
      rect(x, rowY, cellWidth, cellHeight);

      fill(0);
      noStroke();
      textAlign(CENTER, CENTER);
      const weight = i === j ? "0" : getWeight(nodes[i], nodes[j]);
      text(weight, x + cellWidth / 2, rowY + cellHeight / 2 + 6);
    }
  }
}

class Stadion {
  constructor(id, x, y, meta = {}) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.meta = meta;
    this.radius = 8;
  }

  display() {
    fill(255, 0, 0);
    noStroke();
    ellipse(this.x, this.y, this.radius * 2, this.radius * 2);
  }

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
    lines.push(this.meta.navn || `Navn: ${this.id}`);
    if (this.meta.bynavn) lines.push(`By: ${this.meta.bynavn}`);
    if (this.meta.kapacitet)
      lines.push(`Kapacitet: ${this.meta.kapacitet.toLocaleString()}`);
    if (this.meta.byggetår) lines.push(`Byggetår: ${this.meta.byggetår}`);
    textSize(12);
    const padding = 6;
    const w = max(...lines.map((l) => textWidth(l))) + padding * 2;
    const h = lines.length * 16 + padding * 2;
    let tx = mouseX + 12;
    let ty = mouseY + 12;
    if (tx + w > screenWidth) tx = mouseX - w - 12;
    if (ty + h > screenHeight) ty = mouseY - h - 12;
    noStroke();
    fill(255, 255, 225, 230);
    rect(tx, ty, w, h, 6);
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

class Kanter {
  constructor(a, b, vægt) {
    this.a = a;
    this.b = b;
    this.vægt = vægt;
  }
}

class Graf {
  constructor() {
    this.noder = [];
    this.kanter = [];
  }

  tilføjeStadion(stadion) {
    this.noder.push(stadion);
  }

  tilføjeKant(a, b) {
    const d = dist(a.x, a.y, b.x, b.y);
    let w = Math.round(d / 20);
    this.kanter.push(new Kanter(a, b, w));
  }

  forbindAlle() {
    this.kanter = [];
    for (let i = 0; i < this.noder.length; i++) {
      for (let j = i + 1; j < this.noder.length; j++) {
        this.tilføjeKant(this.noder[i], this.noder[j]);
      }
    }
  }

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
      if (e.vægt < maxKantVægt) {
        line(e.a.x, e.a.y, e.b.x, e.b.y);
      }
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

function setup() {
  createCanvas(screenWidth, screenHeight);

  graf = new Graf();

  graf.tilføjeStadion(
    new Stadion("A", 820, 330, {
      navn: "Parken",
      bynavn: "København",
      kapacitet: 38000,
      byggetår: 1992,
    })
  );
  graf.tilføjeStadion(
    new Stadion("B", 620, 250, {
      navn: "Ceres Park",
      bynavn: "Aarhus",
      kapacitet: 19000,
      byggetår: 1920,
    })
  );
  graf.tilføjeStadion(
    new Stadion("C", 465, 360, {
      navn: "Esbjerg Stadion",
      bynavn: "Esbjerg",
      kapacitet: 18000,
      byggetår: 1955,
    })
  );
  graf.tilføjeStadion(
    new Stadion("D", 630, 380, {
      navn: "Odense Stadion",
      bynavn: "Odense",
      kapacitet: 16000,
      byggetår: 1941,
    })
  );
  graf.tilføjeStadion(
    new Stadion("E", 590, 130, {
      navn: "Aalborg Stadion",
      bynavn: "Aalborg",
      kapacitet: 14000,
      byggetår: 2002,
    })
  );
  graf.tilføjeStadion(
    new Stadion("F", 510, 250, {
      navn: "FC Midtjylland Stadion",
      bynavn: "Herning",
      kapacitet: 12000,
      byggetår: 2004,
    })
  );
  graf.tilføjeStadion(
    new Stadion("G", 750, 400, {
      navn: "Næstved Stadion",
      bynavn: "Næstved",
      kapacitet: 10000,
      byggetår: 1944,
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

  graf.tegnKanter();
  graf.tegnNoder();

  const hovered = graf.noder.find((n) => n.isMouseOver());
  if (hovered) {
    hovered.highlight();
    hovered.displayTooltip();
  }
  tegnTabelOverVægte();
}
