document.addEventListener('DOMContentLoaded', function() {
  console.log("made it into the first event listener");
  const canvas = document.querySelector("#canvas");
  if (!canvas) {
      console.error("Canvas element not found!");
      return;
  }

  const context = canvas.getContext("2d");
  const timeDisplay = document.querySelector(".time");
  const victoryPage = document.querySelector(".victory");
  const buttonsControl = document.querySelector(".buttonsControl");

  let player = { x: 10, y: 10, movX: 0, movY: 0 }; // Start position
  let gameLevel = decodeURIComponent(window.location.search.substring(1)); // Assumes level data in URL
  let timeElapsed = 0;

  function tileSize() {
      // Adjust your tile size based on level or other criteria
      return 20; // Default tile size
  }

  function initializeGame() {
      // Setup or reset game settings
      context.clearRect(0, 0, canvas.width, canvas.height);
      drawGrid();
      setupListeners();
  }

  function drawGrid() {
      // Your drawing logic, for example:
      context.fillStyle = "black";
      context.fillRect(0, 0, canvas.width, canvas.height);

      // Example of drawing player:
      context.fillStyle = "red";
      context.fillRect(player.x * tileSize(), player.y * tileSize(), tileSize(), tileSize());
  }

  function setupListeners() {
      document.addEventListener("keydown", function(event) {
          handleKeyPress(event.key);
      });
  }

  function handleKeyPress(key) {
      // Adjust player movement based on key press
      switch (key) {
          case 'ArrowLeft':
              player.movX = -1;
              break;
          case 'ArrowRight':
              player.movX = 1;
              break;
          case 'ArrowUp':
              player.movY = -1;
              break;
          case 'ArrowDown':
              player.movY = 1;
              break;
      }
      updatePlayerPosition();
  }

  function updatePlayerPosition() {
      player.x += player.movX;
      player.y += player.movY;
      player.movX = 0; // Reset movement deltas
      player.movY = 0;
      drawGrid(); // Redraw grid with updated player position
  }

  initializeGame(); // Start the game
});
