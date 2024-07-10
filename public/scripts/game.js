document.addEventListener('DOMContentLoaded', function() {
  const emailForm = document.getElementById('emailForm');
  const emailMessage = document.getElementById('emailMessage');
  const canvas = document.querySelector("#canvas");
  const context = canvas.getContext("2d");
  const currentURL = window.location.href;
  const gameLevel = currentURL.substring(currentURL.indexOf("game") + 12);
  let size = tileSize(currentURL.substring(currentURL.indexOf("game") + 11)[0]);

  // Listen for form submissions
  emailForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const email = emailForm.email.value; // Assuming your input has a name="email"
      resetGameState(); // Reset game state before re-initialization
      fetch('/add-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
      })
      .then(response => response.text())
      .then(message => {
          emailMessage.innerText = message;
          initialize(); // Re-initialize the game only after the email has been successfully submitted
      });
  });

  function tileSize(sizeIndicator) {
      switch(sizeIndicator) {
          case 'p': return 18;
          case 'm': return 14;
          case 'g': return 12;
          case 'e': return 8;
          default: return 10; // Default size
      }
  }

  function resetGameState() {
      timeElapsed = 0;
      document.getElementById('emailForm').reset();
      emailMessage.innerText = '';
      player = { x: 0, y: 0, movX: 0, movY: 0 };
      collisions = { wallX: [], wallY: [], exit: [] };
      context.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
  }

  function initialize() {
      canvas.width = canvasWidth;
      canvas.height = calculateCanvasHeight();
      timer();
      captureCollisions();
      renderScene();
      document.addEventListener("keydown", handlePlayerMovement);
  }

  function calculateCanvasHeight() {
      return (canvasHeight + 2) * size;
  }

  function timer() {
      setInterval(() => {
          timeElapsed++;
          emailMessage.innerText = `Time elapsed: ${timeElapsed} s`; // Display time on the email message for visibility
      }, 1000);
  }

  function captureCollisions() {
      let xAxis = 0, yAxis = 0;
      gameLevel.split('').forEach(char => {
          if (char === 'n') {
              yAxis++;
              xAxis = 0;
          } else {
              if (char === '#') { collisions.wallX.push(xAxis); collisions.wallY.push(yAxis); }
              else if (char === 's') { collisions.exit.push(xAxis, yAxis); }
              else if (char === '@') { player.x = xAxis; player.y = yAxis; }
              xAxis++;
          }
      });
  }

  function renderScene() {
      for (let y = 0, yAxis = 0; y < gameLevel.length; y++) {
          const item = gameLevel.charAt(y);
          if (item === 'n') {
              yAxis++;
          } else {
              setColor(item);
              context.fillRect(y % canvasWidth * size, yAxis * size, size, size);
          }
      }
  }

  function handlePlayerMovement(event) {
      switch (event.key) {
          case "ArrowRight": player.movX = 1; break;
          case "ArrowLeft": player.movX = -1; break;
          case "ArrowUp": player.movY = -1; break;
          case "ArrowDown": player.movY = 1; break;
      }
      renderPlayer();
  }

  function setColor(item) {
      if (item === '#') context.fillStyle = colors.wall;
      else if (item === 's') context.fillStyle = colors.exit;
      else context.fillStyle = colors.background;
  }

  function renderPlayer() {
      context.clearRect(0, 0, canvas.width, canvas.height);
      renderScene();
      context.fillStyle = colors.player;
      context.fillRect((player.x + player.movX) * size, (player.y + player.movY) * size, size, size);
  }
});

const colors = {
player: "#0903A6",
wall: "#000",
background: "#899ba5",
exit: "#f2e935",
};

let player = { x: 0, y: 0, movX: 0, movY: 0 };
let collisions = { wallX: [], wallY: [], exit: [] };
let timeElapsed = 0;
let canvasHeight = 0;
let canvasWidth = 380; // Ensure this is set based on your canvas element's actual size
