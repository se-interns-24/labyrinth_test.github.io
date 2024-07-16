document.addEventListener('DOMContentLoaded', function() {
  console.log("Page loaded, initializing game.");
  
  const canvas = document.querySelector("#canvas");
  if (!canvas) {
      console.error("Canvas element not found!");
      return;
  }

  const context = canvas.getContext("2d");
  const timeDisplay = document.querySelectorAll(".time");
  const victoryPage = document.querySelector(".victory");
  const buttonsControl = document.querySelector(".buttonsControl");
  const redirect = document.querySelector(".redirect");
  const currentURL = window.location.href;
  const urlParams = new URLSearchParams(window.location.search);
  const levelName = urlParams.get('level');
  const canvasWidth = 380;

  const colors = {
    player: "#0903A6",
    wall: "#000",
    background: "#899ba5",
    exit: "#f2e935",
  };

  let player = {
    x: 1,
    y: 1,
    movX: 0, // Horizontal movement
    movY: 0, // Vertical movement
  };

  let collisions = {
    wallX: [],
    wallY: [],
    exit: [],
  };

  let timeElapsed = 0;
  let canvasHeight = 0;
  let canvasColumns = 0;

  const levels = {
    level1: "####################n#..................#n#####.###.####.#####n#.....#.#....#.....#n#.###.#.#.##.#.###.#n#.#.#...#..#.#.#.#.#n#.#.######.#####.#.#n#...#....#.......###n#.#...##.#.##.######n#.######.#..#.....##n#..#s....##.#####.##n####################",
    level2: "#######################n#.............#......#n#.###.#######.#.###.###n#.#...#.....#.#.#.....#n#.#.#.#.###.#.#.#.###.#n#...#.#...#.#...#.#...#n#.###.#.#.#.#####.#.#.#n#.#...#.#.#.....#.#.#.#n#.#####.#.#######.#.#.#n#.....#.#...#.....#...#n#.###.#.###.#.#######.#n#.#...#.....#.#.......#n#.###########.#.#####.#n#.............#.....s.#n#######################",
    level3: "#############################n#..........................#n###.###.###.###.###.###.###.#n#.#...#.#...#.#...#.#.......#n#.###.#.###.#.#.###.#.#####.#n#...#.#.....#.#.#.....#...#.#n###.#.#######.#.#######.#.#.#n#...#.........#.......#...#.#n#.###.#####.#########.###.#.#n#.....#...#.#.........#...#.#n#.#####.#.#.#########.###.#.#n#.#...#.#.#.....#.....#...#.#n#.#.#.#.#.#####.#.#####.#.#.#n#...#.#.....#...#.......#.#.#n#.#######.#.#.###########.#.#n#.......#.#.#.#...........#.#n#######.#.#.#.###############n#.......#...#..............s#n#############################",
    level4: "###################################n#................................#n#.#.###.###.###.###.###.###.###.###n#.#.#...#...#.#.....#.#...#.#...#s#n#.###.#.#.#.#.#.#####.#.#.###.#.#.#n#.....#.#.#.#.....#.#.#.#...#.#.#.#n#.#####.#.#.#####.#.#.#.#.#####.#.#n#.#.....#.#.....#.#.#.#.#.....#.#.#n#.#####.#.#####.#.#.#.#.#####.#.#.#n#.#.....#.......#.#.#.#.......#.#.#n#.#############.#.#.#.#########.#.#n#.............#.#...#...........#.#n#############.#.###############.#.#n#...........#.#.#...............#.#n#.#########.#.#.###############.#.#n#.........#...#.................#.#n#########.#.#####################.#n#.........#.......................#n###################################",
  };

  let gameLevel = levels[levelName];
  console.log("Current URL:", currentURL);
  console.log("Level Name:", levelName);
  console.log("Game Level:", gameLevel); 

  if (!gameLevel) {
      console.error("Game level data not found in URL.");
      return;
  }

  function tileSize(sizeChar) {
    switch (sizeChar) {
      case 'p':
        return 18;
      case 'm':
        return 14;
      case 'g':
        return 12;
      case 'e':
        return 8;
      default:
        return 14; // Default size if no match
    }
  }

  const sizeChar = currentURL.charAt(currentURL.indexOf("level") + 6);
  const size = tileSize(sizeChar);
  console.log("Tile size:", size, "Size character:", sizeChar);

  function timer() {
    setInterval(() => {
      timeElapsed += 1;
      timeDisplay[1].innerText = `Time elapsed: ${timeElapsed} s`;
    }, 1000);
  }

  function victory() {
    buttonsControl.style.display = "none";
    victoryPage.style.display = "flex";
    timeDisplay[0].innerText = `Time of play: ${timeElapsed}s`;
    let timer = 10;
  
    setInterval(() => {
      document.querySelector(".redirect").innerText = `you will be redirected to the home page in ${timer} seconds.`;
      timer--;
    }, 1000);
  
    setTimeout(() => {
      const hostname = window.location.hostname;
      const port = window.location.port;
      window.location.href = `http://${hostname}:${port}`;
    }, 10000);
  }

  function captureCollisions() {
    let xAxis = 0;
    let yAxis = 0;
    canvasHeight = 0;
    canvasColumns = 0;
  
    for (const item of gameLevel) {
      if (item === "n") {
        yAxis += 1;
        xAxis = 0;
        canvasHeight += 1;
      } else {
        if (item === "#") {
          collisions.wallX.push(xAxis);
          collisions.wallY.push(yAxis);
        } else if (item === "s") {
          collisions.exit.push(xAxis, yAxis);
        } else if (item == "@") {
          player.x = xAxis;
          player.y = yAxis;
        }
        xAxis += 1;
        canvasColumns = Math.max(canvasColumns, xAxis);
      }
    }
    console.log("Canvas columns:", canvasColumns);
    console.log("Player start position:", player.x, player.y);
  }
  
  function setColor(item) {
    switch (item) {
      case "#":
        context.fillStyle = colors.wall;
        break;
      case "s":
        context.fillStyle = colors.exit;
        break;
      default:
        context.fillStyle = colors.background;
        break;
    }
  }

  function renderScene() {
    let xAxis = 0;
    let yAxis = 0;
  
    for (const item of gameLevel) {
      if (item === "n") {
        yAxis++;
        xAxis = 0;
      } else {
        setColor(item);
        context.fillRect(xAxis * size, yAxis * size, size, size);
        xAxis++;
      }
    }
    console.log("Scene rendered.");
  }

  function renderPlayer() {
    context.clearRect(
      0,
      0,
      canvasColumns * size,
      (canvasHeight + 2) * size
    );
    renderScene();
  
    if (
      collisions.exit[0] === player.x + player.movX &&
      collisions.exit[1] === player.y + player.movY
    ) {
      victory();
    }
  
    context.fillStyle = colors.player;
  
    let newX = player.x + player.movX;
    let newY = player.y + player.movY;
    let collisionDetected = false;

    for (let i = 0; i < collisions.wallY.length; i++) {
      if (collisions.wallY[i] === newY && collisions.wallX[i] === newX) {
        collisionDetected = true;
        break;
      }
    }

    if (!collisionDetected) {
      player.x = newX;
      player.y = newY;
    } else {
      player.movX = 0;
      player.movY = 0;
    }

    context.fillRect(
      player.x * size,
      player.y * size,
      size,
      size
    );
    console.log("Player rendered at:", player.x, player.y);
  }

  document.addEventListener("keydown", (e) => {
    switch (e.key) {
      case "ArrowRight":
        player.movX = 1;
        player.movY = 0;
        break;
      case "ArrowLeft":
        player.movX = -1;
        player.movY = 0;
        break;
      case "ArrowUp":
        player.movX = 0;
        player.movY = -1;
        break;
      case "ArrowDown":
        player.movX = 0;
        player.movY = 1;
        break;
      default:
        return; 
    }
    renderPlayer();
  });

  function initialize() {
    timer();
    captureCollisions();
    canvas.width = canvasColumns * size;
    canvas.height = (canvasHeight + 2) * size;
    renderPlayer();
  }

  initialize();
});
