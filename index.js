const JSFrame = require("jsframe.jar");
let frame = new JSFrame(500, 500, true);
const Ant = require("./Ant.js");

frame.on("ready", () => {
  frame.on("mouseReleased", release);
  frame.on("mouseDragged", PlaceBlock);
  frame.on("keyReleased", onKey);
  frame.on("update", Render);

  frame.setIcon("./ant.png");

  frame.show();
});

let colors = ["#ffffff", "#0bfc03", "#03b6fc", "#634c0b"];

let width = 100,
  height = 100,
  tileWidth = frame.getWidth() / width,
  tileHeight = frame.getHeight() / height,
  g = frame.getCanvas().getContext("2d");

let map = [];

function makeMap() {
  map = [];
  for (let index = 0; index < width; index++) {
    let temp = [];
    for (let index = 0; index < height; index++) {
      temp.push({
        type: 0,
        color: 0,
        pheromon: { food: 0, home: 0 },
      });
    }
    map.push(temp);
  }
}

makeMap();

let currentBlock = 1;

let drawing;

function PlaceBlock(e) {
  if (drawing == undefined) {
    drawing = [Math.floor(e.x / tileWidth), Math.floor(e.y / tileHeight)];
  } else {
    for (let x = drawing[0]; x < Math.floor(e.x / tileWidth); x++) {
      for (let y = drawing[1]; y < Math.floor(e.y / tileHeight); y++) {
        mapFunctions.setTile(x, y, e.button == 1 ? currentBlock : 0);
      }
    }
  }
}

function release(e) {
  if (drawing == undefined)
    mapFunctions.setTile(
      Math.floor(e.x / tileWidth),
      Math.floor(e.y / tileHeight),
      e.button == 1 ? currentBlock : 0
    );
  drawing = undefined;
}

let pause = false;

function Render() {
  if (!pause) {
    g.clearRect(0, 0, width, height);

    for (let x = 0; x < map.length; x++) {
      for (let y = 0; y < map[x].length; y++) {
        g.fillStyle = colors[map[x][y].color];
        g.fillRect(x * tileWidth, y * tileHeight, tileWidth, tileHeight);

        if (map[x][y].pheromon.food > 0 || map[x][y].pheromon.home > 0) {
          if (renderfoodPheromone) {
            g.globalAlpha =
              map[x][y].pheromon.food > 1 ? 1 : map[x][y].pheromon.food;
            g.fillStyle = colors[1];
            g.fillRect(x * tileWidth, y * tileHeight, tileWidth, tileHeight);
          }
          if (renderhomePheromone) {
            g.globalAlpha =
              map[x][y].pheromon.home > 1 ? 1 : map[x][y].pheromon.home;
            g.fillStyle = colors[2];
            g.fillRect(x * tileWidth, y * tileHeight, tileWidth, tileHeight);
            g.globalAlpha = 1;
          }
        }

        mapFunctions.decreaseP(x, y);
      }
    }

    ants.forEach((a) => {
      g.fillStyle = colors[3];
      g.fillRect(
        a.x * tileWidth + tileWidth / 4,
        a.y * tileHeight + tileHeight / 4,
        tileWidth / 2,
        tileHeight / 2
      );

      a.update();
    });
  }
}

let antPerHome = 1;
let foodperTile = 1;
let foodperAnt = 5;

let ants = [];

function play() {
  for (let x = 0; x < map.length; x++) {
    for (let y = 0; y < map[x].length; y++) {
      if (map[x][y].type == 2) {
        for (let index = 0; index < antPerHome; index++) {
          ants.push(new Ant(x, y, map, mapFunctions));
        }
      }
    }
  }
}

//1=food 2=home c=toogle all Pheromone off y=toogle food  Pheromone x=toogle home  Pheromone
//k=kill ants r= reset p= pause

function onKey(e) {
  if (e.keyCode == 32) {
    play();
  }
  if (e.keyCode == 49) {
    currentBlock = 1;
  }
  if (e.keyCode == 50) {
    currentBlock = 2;
  }
  if (e.keyCode == 67) {
    renderfoodPheromone = !renderPheromone;
    renderhomePheromone = !renderPheromone;
    renderPheromone = !renderPheromone;
  }
  if (e.keyCode == 88) {
    renderfoodPheromone = true;
    renderhomePheromone = false;
  }
  if (e.keyCode == 89) {
    renderfoodPheromone = false;
    renderhomePheromone = true;
  }
  if (e.keyCode == 82) {
    ants = [];
    makeMap();
  }
  if (e.keyCode == 75) {
    ants = [];
  }
  if (e.keyCode == 80) {
    pause = !pause;
  }
}

let renderPheromone = true;
let renderfoodPheromone = true;
let renderhomePheromone = true;

let mapFunctions = {
  setTile(x, y, type) {
    if (map[x] == undefined) return;
    if (map[x][y] == undefined) return;
    if (type == 1) {
      map[x][y] = {
        type: type,
        color: type,
        pheromon: { food: 0, home: 0 },
        value: foodperTile,
      };
    } else {
      map[x][y] = {
        type: type,
        color: type,
        value: 0,
        pheromon: { food: 0, home: 0 },
      };
    }
  },
  addP(x, y, type, str) {
    map[x][y].pheromon[type] = map[x][y].pheromon[type] * 0.5 + str;
  },
  getTile(x, y) {
    return map[x][y];
  },
  decreaseP(x, y) {
    if (map[x][y].pheromon.food > 0)
      map[x][y].pheromon.food = map[x][y].pheromon.food - 0.01;
    if (map[x][y].pheromon.home > 0)
      map[x][y].pheromon.home = map[x][y].pheromon.home - 0.01;
  },
  foodCollected(x, y) {
    map[x][y].value = map[x][y].value + 1;
    if (map[x][y].value >= foodperAnt) {
      ants.push(new Ant(x, y, map, mapFunctions));
      map[x][y].value = 0;
    }
    foodCollected++;
  },
};

let foodCollected = 0;
