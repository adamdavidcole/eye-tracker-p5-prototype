let xprediction = 0; //these x coordinates are relative to the viewport
let yprediction = 0; //these y coordinates are relative to the viewport

let actors = [];

const debug = {
  actorTarget: "mouse",
  actorMaxSpeed: 8,
  actorMaxForce: 0.2,
  actorBehavior: "seek",
  showWebgazerTarget: true,
  showWebgazerVideo: true,
};

const gui = new dat.GUI();

function setup() {
  createCanvas(windowWidth, windowHeight);

  webgazer
    .setGazeListener(function (data, elapsedTime) {
      if (data == null) {
        return;
      }

      xprediction = data.x; //these x coordinates are relative to the viewport
      yprediction = data.y; //these y coordinates are relative to the viewport

      // console.log(data);
    })
    .begin();

  webgazer.showVideo(debug.showWebgazerVideo);
  webgazer.showPredictionPoints(debug.showWebgazerTarget);

  actor = new Actor({
    maxspeed: debug.actorMaxSpeed,
    maxforce: debug.actorMaxForce,
  });
  actors.push(actor);
  console.log("actor", actor);

  // GUI
  gui.add(debug, "actorTarget", {
    mouse: "mouse",
    webgazer: "webgazer",
  });
  gui
    .add(debug, "showWebgazerVideo", debug.showWebgazerVideo)
    .onChange((value) => webgazer.showVideo(value));
  gui
    .add(debug, "showWebgazerTarget", debug.showWebgazerTarget)
    .onChange((value) => webgazer.showPredictionPoints(value));
  gui
    .add(debug, "actorMaxSpeed", debug.actorMaxSpeed)
    .min(0)
    .max(20)
    .step(0.1)
    .onChange((value) => {
      actors.forEach((actor) => {
        // TODO: abstraction
        actor.maxspeed = value;
      });
    });
  gui
    .add(debug, "actorMaxForce", debug.actorMaxForce)
    .min(0)
    .max(20)
    .step(0.1)
    .onChange((value) => {
      actors.forEach((actor) => {
        // TODO: abstraction
        actor.maxforce = value;
      });
    });
}

function drawVisionTargets() {
  let targetSize = 20;
  let targetSizeMargin = 3 * targetSize;

  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      let targetX = map(i, 0, 2, targetSizeMargin, width - targetSizeMargin);
      let targetY = map(j, 0, 2, targetSizeMargin, height - targetSizeMargin);

      stroke(2);
      fill(255, 0, 0);
      rect(targetX, targetY, targetSize, targetSize);
    }
  }
}

function update() {
  // TODO: get target based on gui
  let target;
  if (debug.actorTarget == "mouse") {
    target = createVector(mouseX, mouseY);
  } else if (debug.actorTarget == "webgazer") {
    target = createVector(xprediction, yprediction);
  }

  actors.forEach((actor) => {
    actor.update({ target });
  });
}

function draw() {
  // update
  update();

  // draw
  background(220);

  drawVisionTargets();

  actors.forEach((actor) => {
    actor.draw();
  });
}
