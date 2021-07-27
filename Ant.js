module.exports = class Ant {
  constructor(x, y, map, mapFunctions) {
    this.x = x;
    this.y = y;
    this.map = map;
    this.mapFunctions = mapFunctions;
    this.hasFood = false;
    this.lastDir = Math.floor(Math.random() * 8);
    this.ownPStr = 0.8;
  }

  update() {
    let move = this.getMove();
    this.makeMove(move);
    if (this.ownPStr > 0) this.ownPStr = this.ownPStr - 0.01;
  }

  getMove() {
    let bestChoice = { x: 0, y: 0, pValue: 0, notP: false };
    let vis = vision[this.lastDir];

    for (let index = 0; index < vis.length; index++) {
      let x = vis[index][0],
        y = vis[index][1];

      let tempX = this.x + x,
        tempY = this.y + y;
      if (x == 0 && y == 0) continue;
      if (this.map[tempX] == undefined) continue;
      if (this.map[tempX][tempY] == undefined) continue;

      let tile = this.map[tempX][tempY];

      let PheromonValue = tile.pheromon.food,
        type = 1;
      if (this.hasFood) {
        PheromonValue = tile.pheromon.home;
        type = 2;
      }
      if (tile.type == type) {
        if (bestChoice.notP) {
          let dist =
            (tempX < 0 ? -tempX : tempX) + (tempY < 0 ? -tempY : tempY);
          let distBC =
            (bestChoice.x < 0 ? -bestChoice.x : bestChoice.x) +
            (bestChoice.y < 0 ? -bestChoice.y : bestChoice.y);
          if (dist < distBC) bestChoice = { x: x, y: y, pValue: 0, notP: true };
        } else {
          bestChoice = { x: x, y: y, pValue: 0, notP: true };
        }
      } else {
        if (!bestChoice.notP)
          if (bestChoice.pValue < PheromonValue)
            bestChoice = {
              x: x,
              y: y,
              pValue: PheromonValue,
              notP: false,
            };
      }
    }

    return bestChoice.x == 0 && bestChoice.y == 0
      ? moves[this.newRandDir()]
      : [
          bestChoice.x > 1 ? 1 : bestChoice.x < -1 ? -1 : bestChoice.x,
          bestChoice.y > 1 ? 1 : bestChoice.y < -1 ? -1 : bestChoice.y,
        ];
  }

  makeMove(e) {
    let newPos = [this.x + e[0], this.y + e[1]];

    if (this.map[newPos[0]] == undefined) {
      this.lastDir = this.getMoveIndex(this.invertDir(moves[this.lastDir]));
      return;
    }
    if (this.map[newPos[0]][newPos[1]] == undefined) {
      this.lastDir = this.getMoveIndex(this.invertDir(moves[this.lastDir]));
      return;
    }
    if (this.map[newPos[0]][newPos[1]].type == 1) {
      if (!this.hasFood) {
        this.ownPStr = 0.8;
        this.hasFood = true;
        this.map[newPos[0]][newPos[1]].value =
          this.map[newPos[0]][newPos[1]].value - 1;
        if (this.map[newPos[0]][newPos[1]].value == 0)
          this.mapFunctions.setTile(newPos[0], newPos[1], 0);
      }
      this.lastDir = this.getMoveIndex(this.invertDir(moves[this.lastDir]));
    } else if (this.map[newPos[0]][newPos[1]].type == 2 && this.hasFood) {
      this.ownPStr = 0.8;
      this.hasFood = false;
      this.mapFunctions.foodCollected(newPos[0], newPos[1]);
      this.lastDir = this.getMoveIndex(this.invertDir(moves[this.lastDir]));
    } else {
      if (
        this.map[this.x][this.y].type != 1 &&
        this.map[this.x][this.y].type != 2
      ) {
        if (this.hasFood) {
          this.mapFunctions.addP(this.x, this.y, "food", this.ownPStr);
        } else {
          this.mapFunctions.addP(this.x, this.y, "home", this.ownPStr);
        }
      }
      this.lastDir = this.getMoveIndex(e);
      this.x = newPos[0];
      this.y = newPos[1];
    }
  }

  newRandDir() {
    let rand = Math.floor(Math.random() * (6 - -5)) + -5;
    rand = rand > 4 ? 1 : rand < -4 ? -1 : 0;
    let temp = this.lastDir + rand;

    return temp > 7 ? 0 : temp < 0 ? 7 : temp;
  }

  invertDir(e) {
    return [e[0] * -1, e[1] * -1];
  }

  getMoveIndex(e) {
    for (let index = 0; index < moves.length; index++) {
      if (e[0] == moves[index][0] && e[1] == moves[index][1]) return index;
    }
  }
};

let moves = [
  [-1, -1],
  [0, -1],
  [1, -1],
  [1, 0],
  [1, 1],
  [0, 1],
  [-1, 1],
  [-1, 0],
];

let vision = [
  [
    [-2, -2],
    [-2, -1],
    [-2, 0],
    [-1, -2],
    [-1, -1],
    [-1, 0],
    [0, -2],
    [0, -1],
  ],
  [
    [-1, -2],
    [-1, -1],
    [-1, 0],
    [0, -2],
    [0, -1],
    [1, -2],
    [1, -1],
    [1, 0],
  ],
  [
    [0, -2],
    [0, -1],
    [1, -2],
    [1, -1],
    [1, 0],
    [2, -2],
    [2, -1],
    [2, 0],
  ],
  [
    [0, -1],
    [0, 1],
    [1, -1],
    [1, 0],
    [1, 1],
    [2, -1],
    [2, 0],
    [2, 1],
  ],
  [
    [0, 1],
    [0, 2],
    [1, 0],
    [1, 1],
    [1, 2],
    [2, 0],
    [2, 1],
    [2, 2],
  ],
  [
    [-1, 0],
    [-1, 1],
    [-1, 2],
    [0, 1],
    [0, 2],
    [1, 0],
    [1, 1],
    [1, 2],
  ],
  [
    [-2, 0],
    [-2, 1],
    [-2, 2],
    [-1, 0],
    [-1, 1],
    [-1, 2],
    [0, 1],
    [0, 2],
  ],
  [
    [-2, -1],
    [-2, 0],
    [-2, 1],
    [-1, -1],
    [-1, 0],
    [-1, 1],
    [0, -1],
    [0, 1],
  ],
];
