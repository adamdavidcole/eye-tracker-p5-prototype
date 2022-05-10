let xprediction = 0; //these x coordinates are relative to the viewport
let yprediction = 0; //these y coordinates are relative to the viewport

let actors = [];

const ScreenAreas = {
  LEFT: "Left",
  RIGHT: "Right",
  TOP: "Top",
  BOTTOM: "Bottom",
  CENTER: "Center",
};

const debug = {
  actorTarget: "webgazer",
  actorMaxSpeed: 8,
  actorMaxForce: 0.2,
  actorBehavior: "seek",
  showWebgazerTarget: false,
  showWebgazerVideo: true,
  constrainTargetDirections: true,
  showVisionTargets: true,
  showVisionBounds: true,
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
    actorBehavior: debug.actorBehavior,
  });
  actors.push(actor);
  console.log("actor", actor);

  // GUI
  let actorControls = gui.addFolder("Actor Controls");
  let webgazeControls = gui.addFolder("Webgaze Controls");

  let actorMaxSpeedController = actorControls
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
  let actorMaxForceController = actorControls
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
  actorControls
    .add(debug, "actorBehavior", { seek: "seek", arrive: "arrive" })
    .onChange((valeu) => {
      actors.forEach((actor) => (actor.actorBehavior = value));
    });
  actorControls
    .add(debug, "actorTarget", {
      mouse: "mouse",
      webgazer: "webgazer",
    })
    .onChange((value) => {
      if (value == "webgazer") {
        actorMaxSpeedController.setValue(10);
        actorMaxForceController.setValue(10);
      } else if (vale == "mouse") {
        actorMaxSpeedController.setValue(8);
        actorMaxForceController.setValue(0.2);
      }
    });

  webgazeControls.add(
    debug,
    "constrainTargetDirections",
    debug.constrainTargetDirections
  );
  webgazeControls.add(debug, "showVisionTargets", debug.showVisionTargets);
  webgazeControls.add(debug, "showVisionBounds", debug.showVisionBounds);
  webgazeControls
    .add(debug, "showWebgazerVideo", debug.showWebgazerVideo)
    .onChange((value) => webgazer.showVideo(value));
  webgazeControls
    .add(debug, "showWebgazerTarget", debug.showWebgazerTarget)
    .onChange((value) => webgazer.showPredictionPoints(value));

  actorControls.open();
  webgazeControls.open();
}

function drawVisionTargets() {
  let targetSize = 20;
  let targetSizeMargin = 3 * targetSize;

  const screenArea = getScreenArea();

  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      let targetX = map(
        i,
        0,
        2,
        targetSizeMargin - targetSize / 2,
        width - targetSizeMargin - targetSize / 2
      );
      let targetY = map(
        j,
        0,
        2,
        targetSizeMargin - targetSize / 2,
        height - targetSizeMargin - targetSize / 2
      );

      stroke(2);

      fill(255, 0, 0);
      if (i == 0 && j == 1 && screenArea == ScreenAreas.LEFT) {
        fill(0, 255, 0);
      } else if (i == 2 && j == 1 && screenArea == ScreenAreas.RIGHT) {
        fill(0, 255, 0);
      } else if (i == 1 && j == 0 && screenArea == ScreenAreas.TOP) {
        fill(0, 255, 0);
      } else if (i == 1 && j == 2 && screenArea == ScreenAreas.BOTTOM) {
        fill(0, 255, 0);
      } else if (i == 1 && j == 1 && screenArea == ScreenAreas.CENTER) {
        fill(0, 255, 0);
      }

      // corners
      const isCorner =
        (i == 0 && j == 0) ||
        (i == 2 && j == 0) ||
        (i == 0 && j == 2) ||
        (i == 2 && j == 2);
      if (isCorner && debug.constrainTargetDirections) {
        continue;
      }

      rect(targetX, targetY, targetSize, targetSize);
    }
  }
}

function getScreenArea() {
  const slope = height / width;
  // y = -(width/height) * x + height
  // y = (width/height) * x

  let ycoord = height - yprediction;
  let xcoord = xprediction;

  const coords = createVector(xcoord, ycoord);
  const center = createVector(width / 2, height / 2);

  const centerRadius = 150;
  const distToCenter = coords.dist(center);

  if (debug.showVisionBounds) {
    for (let i = 0; i < 50; i++) {
      let diagnoalx = map(i, 0, 50, 0, width);
      let diagnoal1y = -slope * diagnoalx + height;
      let diagnoal2y = slope * diagnoalx;

      stroke(1);
      fill(50);
      circle(diagnoalx, diagnoal1y, 1);
      circle(diagnoalx, diagnoal2y, 1);
    }
    fill(50, 10);
    circle(center.x, center.y, centerRadius);
  }

  console.log("distToCenter", distToCenter);
  if (distToCenter < 200) {
    console.log("CENTER");
    return ScreenAreas.CENTER;
  } else if (ycoord < -slope * xcoord + height && ycoord > slope * xcoord) {
    console.log("LEFT");
    return ScreenAreas.LEFT;
  } else if (ycoord > -slope * xcoord + height && ycoord < slope * xcoord) {
    console.log("Right");
    return ScreenAreas.RIGHT;
  } else if (ycoord < height / 2) {
    console.log("BOTTOM");
    return ScreenAreas.BOTTOM;
  } else {
    console.log("TOP");
    return ScreenAreas.TOP;
  }
}

function calcTarget() {
  if (debug.actorTarget == "mouse") {
    return createVector(mouseX, mouseY);
  }

  if (debug.actorTarget == "webgazer") {
    if (!debug.constrainTargetDirections) {
      return createVector(xprediction, yprediction);
    } else {
      const screenArea = getScreenArea();
      if (screenArea == ScreenAreas.CENTER) {
        return createVector(width / 2, height / 2);
      } else if (screenArea == ScreenAreas.LEFT) {
        return createVector(0, height / 2);
      } else if (screenArea == ScreenAreas.RIGHT) {
        return createVector(width, height / 2);
      } else if (screenArea == ScreenAreas.BOTTOM) {
        return createVector(width / 2, height);
      } else {
        return createVector(width / 2, 0);
      }
    }
  }

  return createVector(width / 2, height / 2);
}

function update() {
  // TODO: get target based on gui
  const target = calcTarget();

  actors.forEach((actor) => {
    actor.update({ target });
  });
}

function draw() {
  background(220);

  // update
  update();

  // draw
  if (debug.showVisionTargets) {
    drawVisionTargets();
  }

  actors.forEach((actor) => {
    actor.draw();
  });
}
