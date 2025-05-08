let port, connectButton;
let gameState = "start";
let score = 0;
let gameTimer = 30;
let beats = [];
let beatSpeed = 2;
let bpm = 90;
let tempoTimer = 4;
let particles = [];

let synth1, synth2, sampler, wackyNoise;
let delay, reverb;
let beatLoop;
let samplerLoaded = false;

function setup() {
  createCanvas(600, 400);
  textAlign(CENTER, CENTER);
  textSize(20);

  port = createSerial();
  connectButton = createButton("Connect to Arduino");
  connectButton.mousePressed(() => {
    port.open("Arduino", 9600);
    console.log("Attempting to open serial port");
  });

  synth1 = new Tone.MonoSynth().toDestination();
  synth2 = new Tone.FMSynth().toDestination();
  sampler = new Tone.Sampler({
    urls: { C3: "clap-808.wav" },
    baseUrl: "https://tonejs.github.io/audio/drum-samples/",
    onload: () => {
      console.log("✅ Sampler loaded.");
      samplerLoaded = true;
    }
  }).toDestination();

  delay = new Tone.FeedbackDelay("8n", 0.5).toDestination();
  reverb = new Tone.Reverb(2).toDestination();
  synth1.connect(delay);
  synth2.connect(reverb);
  wackyNoise = new Tone.MembraneSynth().toDestination();

  beatLoop = new Tone.Loop(() => {
    synth2.triggerAttackRelease("A2", "8n");
    if (gameState === "play") {
      const colorIndex = floor(random(3));
      let beatX = random(50, width - 50);
      let beatColor, colorName;

      if (colorIndex === 0) {
        beatColor = color(255, 0, 0); colorName = "red";
      } else if (colorIndex === 1) {
        beatColor = color(0, 255, 0); colorName = "green";
      } else {
        beatColor = color(0, 0, 255); colorName = "blue";
      }

      beats.push({ x: beatX, y: 0, color: beatColor, colorName });
      safeWrite("BEAT\n");
    }
  }, "1n");
}

function draw() {
  background(30);

  if (port.opened() && port.available() > 0) {
    let str = port.readUntil("\n").trim();
    if (str.length > 0) {
      console.log("FROM ARDUINO:", str);
      handleSerial(str);
    }
  }

  if (gameState === "start") {
    drawStart();
  } else if (gameState === "play") {
    drawGame();

    gameTimer -= deltaTime / 1000;
    tempoTimer += deltaTime / 1000;

    if (tempoTimer > 10 && bpm < 180) {
      bpm += 10;
      Tone.Transport.bpm.rampTo(bpm, 1);
      tempoTimer = 0;
      console.log("Tempo increased to:", bpm);
    }

    if (gameTimer <= 0) {
      gameState = "end";
      safeWrite("MISS\n");
      Tone.Transport.stop();
      beatLoop.stop();
    }
  } else if (gameState === "end") {
    drawEnd();
  }
}

function drawStart() {
  fill(255);
  text("REACTION BEATS", width/2, height/2 - 40);
  text("Click ONCE", width/2, height/2);
  text("PRESS SPACE TO START", width/2, height/2 + 30);
}

function drawGame() {
  fill(255);
  text("Score: " + score, width/2, 30);
  text("Time: " + floor(gameTimer), 80, 30);

  stroke(255, 255, 0);
  strokeWeight(2);
  line(0, 365, width, 365);
  noStroke();

  fill(180);
  text("HIT!", width / 2, 375);

  for (let b of beats) {
    fill(b.color);
    ellipse(b.x, b.y, 30);

    if (b.y >= 365 && b.y - beatSpeed < 365) {
      wackyNoise.triggerAttackRelease("C2", "16n");
    }

    b.y += beatSpeed;
  }

  for (let i = beats.length - 1; i >= 0; i--) {
    if (beats[i].y > height) {
      beats.splice(i, 1);
      safeWrite("MISS\n");
    }
  }

  for (let i = particles.length - 1; i >= 0; i--) {
    let p = particles[i];
    fill(255, p.alpha);
    ellipse(p.x, p.y, 6);
    p.x += p.vx;
    p.y += p.vy;
    p.alpha -= 5;
    if (p.alpha <= 0) {
      particles.splice(i, 1);
    }
  }
}

function drawEnd() {
  fill(255);
  text("GAME OVER!", width/2, height/2 - 40);
  text("FINAL SCORE: " + score, width/2, height/2);
  text("PRESS R TO PLAY AGAIN!!!!!!", width/2, height/2 + 40);
}

function keyPressed() {
  if (gameState === "start" && key === " ") {
    gameState = "play";
    score = 0;
    gameTimer = 30;
    beats = [];
    Tone.Transport.start();
    beatLoop.start(0);
    Tone.Transport.bpm.value = bpm;
    console.log("Game started");
  }

  if (gameState === "end" && key === "r") {
    gameState = "start";
    Tone.Transport.stop();
    beatLoop.stop();
  }
}

function mousePressed() {
  if (Tone.context.state !== "running") {
    Tone.start().then(() => {
      Tone.context.resume();
      console.log("Audio context started");
    });
  }
}

function handleSerial(input) {
  if (input.startsWith("BTN:")) {
    let btn = parseInt(input.split(":")[1]);
    console.log("Handling button:", btn);
    if (btn === 0) handleHit("C4", "red");
    else if (btn === 1) handleHit("G4", "blue");
    else if (btn === 2) handleHit("E4", "green");
  }
}

function handleHit(note, expectedColor) {
  let hit = false;

  for (let i = beats.length - 1; i >= 0; i--) {
    let b = beats[i];
    if (b.y > 325 && b.y < 385 && b.colorName === expectedColor) {
      beats.splice(i, 1);
      score += 10;
      hit = true;

      synth1.triggerAttackRelease(note, "8n");
      if (samplerLoaded) sampler.triggerAttackRelease("C3", "8n");
      triggerParticles(b.x, b.y);
      break;
    }
  }

  if (hit) {
    safeWrite("HIT\n");
  } else {
    safeWrite("MISS\n");
  }
}

function triggerParticles(x, y) {
  for (let i = 0; i < 12; i++) {
    particles.push({
      x: x,
      y: y,
      vx: random(-2, 2),
      vy: random(-2, 2),
      alpha: 255
    });
  }
}

function safeWrite(msg) {
  if (port && port.opened()) {
    port.write(msg);
  }
}
