const ui = {};
const game = {};
const snake = {};
// cell states are 0: empty, 1: snake, 2: food

var gameState = 0;
const RESET = 0; const PLAYING = 1; const PAUSED = 2; const WON = 3; const LOST = 4;

function setup() {
  createCanvas(windowWidth, windowHeight);
  
  snake.cells = [new Pair(0, 0)];
  game.speed = 1;
  game.foodValue = 1;
  resetGame(4, 4);
  game.highscore = 0;

  ui.gridCol = color(0);
  ui.borderCol = color(128);
  ui.menuCol = color(0);
  ui.snakeCol = color(0, 255, 0);
  ui.appleCol = color(255, 0, 0);

  ui.menuFont = loadFont("data/CONSOLA.TTF");

  resizeUI();
  createUIElements();
}

function draw() {
  background(ui.borderCol);

  if (gameState == PLAYING) {
    game.millisSinceLastMove += deltaTime;
    if (game.millisSinceLastMove >= game.millisPerMove) {
      update();
      game.millisSinceLastMove = 0;
    }
  }

  //draw border and menu
  noStroke();
  fill(ui.menuCol);
  rect(ui.menuX, ui.menuY, ui.menuW, ui.menuH);

  if (gameState == RESET) {
    ui.settings();
    ui.startText();
  }

  // score text
  textSize(24)
  let scoreText = "Highscore: " + game.highscore;
  if (gameState != RESET) scoreText = "Score: " + game.score + " | " + scoreText;
  let scoreTextWidth = textWidth(scoreText)
  fill(255);
  text(scoreText, ui.menuX + ui.menuW - 5 - scoreTextWidth, ui.menuY + 20);

  if (gameState != RESET) {
    textSize(12);
    let lengthText = "Length: " + snake.length;
    text(lengthText, ui.menuX + ui.menuW - 5 - scoreTextWidth, ui.menuY + 35);
  }

  // draw grid;
  noStroke();
  fill(ui.gridCol);
  rect(ui.gridX, ui.gridY, ui.gridW, ui.gridH);

  // grid lines
  stroke(63);
  strokeWeight(1);
  for (let x = ui.gridX + ui.cellW; x < ui.gridX + ui.gridW; x += ui.cellW) 
    line(x, ui.gridY, x, ui.gridY + ui.gridH);
  for (let y = ui.gridY + ui.cellW; y < ui.gridY + ui.gridH; y += ui.cellW) 
    line(ui.gridX, y, ui.gridX + ui.gridW, y);

  // win/loss screens
  switch (gameState) {
    case PAUSED:
      ui.startText();
      break;
    case WON:
      fill(0, 255, 0);
      textSize(36);
      text("Game Complete!", ui.menuX + 10, ui.menuY + 32);
      break;
    case LOST:
      fill(255, 0, 0);
      textSize(36);
      text("Game Over!", ui.menuX + 10, ui.menuY + 32);
      break;
  }
  if (gameState == WON || gameState == LOST) {
    ui.resetText();
  }

  push();
  translate(ui.gridX, ui.gridY);
  noStroke();
  ellipseMode(CORNER)
  textSize(6);
  for (let c = 0; c < game.columns; c++) {
    for (let r = 0; r < game.rows; r++) {
      switch (game.grid[c][r]) {
        case 0: // none
          noFill();
          break;
        case 1: // snake
          fill(0, 255, 0);
          rect(c * ui.cellW, r * ui.cellW, ui.cellW, ui.cellW);
          break;
        case 2: // food
          fill(255, 0, 0);
          ellipse(c * ui.cellW, r * ui.cellW, ui.cellW, ui.cellW);
          break;
      }
    }
  }
  pop();
}

function windowResized() { resizeUI(); }

function mousePressed() { // 5, 90, 230, 420
  if (gameState == WON || gameState == LOST) {
    resetGame(game.columns, game.rows);
  }
  if (gameState == RESET) {
    if (mouseX >= ui.menuX + 5 && mouseX <= ui.menuX + 15) {
      if (mouseY >= ui.menuY && mouseY <= ui.menuY + ui.menuH / 2) {
        resetGame(game.columns + 1, game.rows);
      } else if (game.columns > 1) {
        resetGame(game.columns - 1, game.rows);
      }
    }
    if (mouseX > ui.menuX + 90 && mouseX < ui.menuX + 100) {
      if (mouseY >= ui.menuY && mouseY <= ui.menuY + ui.menuH / 2) {
        resetGame(game.columns, game.rows + 1);
      } else if (game.rows > 1) {
        resetGame(game.columns, game.rows - 1);
      }
    }
    if (mouseX > ui.menuX + 230 && mouseX < ui.menuX + 240) {
      if (mouseY >= ui.menuY && mouseY <= ui.menuY + ui.menuH / 2) {
        game.speed++;
      } else if (game.speed > 1) {
        game.speed--;
      }
    }
    if (mouseX > ui.menuX + 430 && mouseX < ui.menuX + 440) {
      if (mouseY >= ui.menuY && mouseY <= ui.menuY + ui.menuH / 2) {
        game.foodValue++;
      } else if (game.foodValue > 1) {
        game.foodValue--;
      }
    }
  }
}

function keyPressed() {
  if (gameState == RESET || gameState == PAUSED) {
    gameState = PLAYING;
    game.millisSinceLastMove = 10000;
  }

  if (gameState == WON || gameState == LOST) {
    resetGame(game.columns, game.rows);
  }

  let prevDirection = snake.direction;
  switch (keyCode) {
    case RIGHT_ARROW:
      snake.direction = (prevDirection != 2 || snake.length == 1) ? 0 : 2;
      break;
    case DOWN_ARROW:
      snake.direction = (prevDirection != 3 || snake.length == 1) ? 1 : 3;
      break;
    case LEFT_ARROW: 
      snake.direction = (prevDirection != 0 || snake.length == 1) ? 2 : 0;
      break;
    case UP_ARROW: 
      snake.direction = (prevDirection != 1 || snake.length == 1) ? 3 : 1;
      break;
    case BACKSPACE:
      gameState = PAUSED;
      break;
  }
}

function resizeUI() {
  ui.width = windowWidth;
  ui.margin = 20;
  ui.menuH = 40;

  ui.menuX = ui.margin;
  ui.menuY = ui.margin;
  ui.menuW = ui.width - ui.margin * 2;

  resizeGrid();
  resizeCanvas(windowWidth, windowHeight);
}

function resetGame(c, r) {
  gameState = RESET;

  game.columns = c;
  game.rows = r;

  game.score = 0;

  game.grid = new Array();
  for (let x = 0; x < game.columns; x++) {
    game.grid.push([0]);
    for (let y = 0; y < game.rows - 1; y++) {
      game.grid[x].push(0);
    }
  }
  setGameRules(game.speed, game.foodValue);

  resetSnake();
  spawnFood();

  resizeGrid();
}

function resizeGrid() {
  let marginsAndMenu = ui.margin * 3 + ui.menuH;
  let gridW = ui.width - ui.margin * 2;

  ui.cellW = floor(gridW / game.columns);
  if (marginsAndMenu + ui.cellW * game.rows > windowHeight) {
    ui.cellW = floor((windowHeight - marginsAndMenu) / game.rows);
  }
  ui.gridW = ui.cellW * game.columns;
  ui.gridH = ui.cellW * game.rows;
  ui.height = windowHeight;

  ui.gridX = (ui.width - ui.gridW) / 2;
  ui.gridY = ui.margin * 2 + ui.menuH;
}

function setGameRules(speed, foodValue) {
  game.speed = speed;
  game.foodValue = foodValue;
  game.millisPerMove = 1000 / (game.speed + 1);
  game.millisSinceLastMove = 10000;
}

function resetSnake() {
  snake.headX = int(game.columns / 2);
  snake.headY = int(game.rows / 2);
  snake.length = 1;
  snake.direction = 4;
  game.grid[snake.headX][snake.headY] = 1;
  
  snake.cells = new Array();
  snake.cells.push(new Pair(snake.headX, snake.headY));
  
  while (snake.cells.length > 1) {
    snake.cells.pop();
  }
}

function spawnFood() {
  if(snake.length >= game.columns * game.rows){
    return;
  }
  let foodPlaced=false;
  while(!foodPlaced){
    let c = floor(random(0, game.columns));
    let r = floor(random(0, game.rows));
    if(game.grid[c][r] == 0){
      game.grid[c][r] = 2;
      foodPlaced = true;
    }
  }
}

function update() {
  // move head
  switch (snake.direction) {
    case 0: snake.headX++; break;
    case 1: snake.headY++; break;
    case 2: snake.headX--; break;
    case 3: snake.headY--; break;
  }
  snake.cells.push(new Pair(snake.headX, snake.headY));

  // check if out of bounds, or eat food
  let outOfBounds = snakeOutOfBounds();
  if (outOfBounds) {
    gameLost();
    return;
  } else {
    if (game.grid[snake.headX][snake.headY] == 2) {
      snake.length += game.foodValue;
      if (game.columns * game.rows <= snake.length) {
        gameWon();
      } else spawnFood();
    }
  }

  // remove excess cells
  if (snake.cells.length > snake.length) {
    let lastCell = snake.cells.shift();
    game.grid[lastCell.x][lastCell.y] = 0;
  }
  // check if new head position is occupied
  if (game.grid[snake.headX][snake.headY] == 1) {
    gameLost();
  }

  // change cell at new head position to snake
  game.grid[snake.headX][snake.headY] = 1;
}

function snakeOutOfBounds() {
  //outOfBounds
  return (snake.headX < 0 || snake.headX >= game.columns || snake.headY < 0 || snake.headY >= game.columns);
}

function gameLost() {
  gameState = LOST;
}

function gameWon() {
  gameState = WON;
}

class Pair {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}

function createUIElements () {
  ui.settingArrows = function(x) {
    fill(0, 255, 0);
    noStroke();
    let y = ui.menuY + 5;
    let w = 10;
    let h = 13;
    triangle(x, y + h, x + w / 2, y, x + w, y + h);
    y = ui.menuY + 22;
    triangle(x, y, x + w, y, x + w / 2, y + h);
  }

  ui.settings = function() {
    textFont(ui.menuFont, 24);
    
    // columns / rows
    ui.settingArrows(ui.menuX + 5);
    ui.settingArrows(ui.menuX + 90);
    fill(255);
    text(nf(game.columns, 2) + "x" + nf(game.rows, 2), ui.menuX + 20, ui.menuY + 28);

    // speed
    fill(255);
    text('Speed:' + game.speed, ui.menuX + 120, ui.menuY + 28);
    ui.settingArrows(ui.menuX + 230);

    // food value
    fill(255);
    text('Food value:' + game.foodValue, ui.menuX + 260, ui.menuY + 28);
    ui.settingArrows(ui.menuX + 430);
  }

  ui.startText = function() {
    fill(180);
    textSize(15);
    let startText = "Press arrow keys to play";
    let x = (gameState == RESET) ? ui.menuX + 500 : ui.menuX + 5;
    text(startText, x, ui.menuY + 25);
  }
  
  ui.resetText = function() {
    fill(180);
    textSize(15);
    text("Press any button to reset", ui.menuX + 360, ui.menuY + 25);
  }

  ui.highscore = function() {

  }

  ui.score = function() {

  }
}