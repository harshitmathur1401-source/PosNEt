let capture;
let posenet;
let detectedPoses = [];
let isModelReady = false;

// Display & feature toggles
let showSkeleton = true;
let showKeypoints = true;
let isMirrored = true;
let isMultiPerson = true;

// Distinct futuristic color palettes for multiple detected persons
const PERSON_THEMES = [
  {
    name: 'Cyan / Indigo',
    skeleton: [99, 102, 241, 230],   // Neon Indigo
    glow: [6, 182, 212, 80],         // Cyan glow
    marker: [6, 182, 212, 230],      // Cyan
    core: [255, 255, 255, 255]
  },
  {
    name: 'Emerald / Mint',
    skeleton: [16, 185, 129, 230],  // Emerald Green
    glow: [52, 211, 153, 80],        // Mint glow
    marker: [52, 211, 153, 230],     // Mint
    core: [255, 255, 255, 255]
  },
  {
    name: 'Amber / Gold',
    skeleton: [245, 158, 11, 230],   // Amber Gold
    glow: [251, 191, 36, 80],        // Yellow glow
    marker: [251, 191, 36, 230],     // Yellow
    core: [255, 255, 255, 255]
  },
  {
    name: 'Rose / Pink',
    skeleton: [244, 63, 94, 230],    // Rose Pink
    glow: [236, 72, 153, 80],        // Pink glow
    marker: [236, 72, 153, 230],     // Pink
    core: [255, 255, 255, 255]
  },
  {
    name: 'Purple / Violet',
    skeleton: [168, 85, 247, 230],   // Purple
    glow: [192, 132, 252, 80],       // Purple glow
    marker: [192, 132, 252, 230],    // Purple
    core: [255, 255, 255, 255]
  }
];

// FPS & Telemetry
let lastFrameTime = performance.now();
let frameCount = 0;
let currentFps = 0;

function setup() {
  const canvas = createCanvas(640, 480);
  canvas.parent('canvas-container');

  // Initialize webcam capture
  capture = createCapture(VIDEO, () => {
    console.log('Webcam initialized');
  });
  capture.size(640, 480);
  capture.hide();

  // PoseNet multi-detection configuration options
  const poseNetOptions = {
    architecture: 'MobileNetV1',
    imageScaleFactor: 0.3,
    outputStride: 16,
    flipHorizontal: false,
    minConfidence: 0.25,
    maxPoseDetections: 5,
    scoreThreshold: 0.5,
    nmsRadius: 20,
    detectionType: 'multiple',
    multiplier: 0.75
  };

  // Initialize PoseNet model with ml5.js
  posenet = ml5.poseNet(capture, poseNetOptions, modelLoaded);
  posenet.on('pose', receivedPoses);

  // Setup UI control listeners
  setupControls();
}

function modelLoaded() {
  console.log('PoseNet multi-person model loaded successfully');
  isModelReady = true;

  const statusPill = document.getElementById('status-pill');
  const statusText = document.getElementById('status-text');
  const canvasLoader = document.getElementById('canvas-loader');

  if (statusPill && statusText) {
    statusPill.className = 'status-pill ready';
    statusText.textContent = 'Stand in Frame';
  }

  if (canvasLoader) {
    canvasLoader.classList.add('hidden');
  }
}

function receivedPoses(poses) {
  if (poses && poses.length > 0) {
    detectedPoses = poses;
    updateTelemetry(detectedPoses);
  } else {
    detectedPoses = [];
    resetTelemetry();
  }
}

function draw() {
  // Clear with subtle dark canvas tone
  background(12, 14, 20);

  // Apply horizontal mirror if active
  push();
  if (isMirrored) {
    translate(width, 0);
    scale(-1, 1);
  }

  // Render webcam feed
  if (capture) {
    image(capture, 0, 0, width, height);
  }

  // Determine poses to render according to multi-person toggle
  const posesToRender = isMultiPerson ? detectedPoses : detectedPoses.slice(0, 1);

  // Render each person with their designated color theme
  for (let p = 0; p < posesToRender.length; p++) {
    const person = posesToRender[p];
    const theme = PERSON_THEMES[p % PERSON_THEMES.length];
    const currentPose = person.pose;
    const currentSkeleton = person.skeleton;

    // 1. Draw Skeleton Lines
    if (showSkeleton && currentSkeleton && currentSkeleton.length > 0) {
      stroke(theme.skeleton[0], theme.skeleton[1], theme.skeleton[2], theme.skeleton[3]);
      strokeWeight(3.5);
      strokeCap(ROUND);

      for (let j = 0; j < currentSkeleton.length; j++) {
        const partA = currentSkeleton[j][0];
        const partB = currentSkeleton[j][1];
        line(partA.position.x, partA.position.y, partB.position.x, partB.position.y);
      }
    }

    // 2. Draw Keypoints
    if (showKeypoints && currentPose && currentPose.keypoints) {
      for (let i = 0; i < currentPose.keypoints.length; i++) {
        const kp = currentPose.keypoints[i];
        if (kp.score > 0.2) {
          // Outer soft glow
          noStroke();
          fill(theme.glow[0], theme.glow[1], theme.glow[2], theme.glow[3]);
          circle(kp.position.x, kp.position.y, 18);

          // Primary accent marker
          fill(theme.marker[0], theme.marker[1], theme.marker[2], theme.marker[3]);
          circle(kp.position.x, kp.position.y, 9);

          // Center bright core
          fill(theme.core[0], theme.core[1], theme.core[2], theme.core[3]);
          circle(kp.position.x, kp.position.y, 3);
        }
      }
    }
  }

  pop();

  // Calculate and update FPS
  calculateFps();
}

function calculateFps() {
  frameCount++;
  const now = performance.now();
  const delta = now - lastFrameTime;

  if (delta >= 500) {
    currentFps = Math.round((frameCount * 1000) / delta);
    frameCount = 0;
    lastFrameTime = now;

    const fpsEl = document.getElementById('fps-val');
    if (fpsEl) {
      fpsEl.textContent = `${currentFps}`;
    }
  }
}

function updateTelemetry(poses) {
  const statusPill = document.getElementById('status-pill');
  const statusText = document.getElementById('status-text');
  const personsEl = document.getElementById('persons-val');
  const confEl = document.getElementById('confidence-val');
  const kpEl = document.getElementById('keypoints-val');

  const activePoses = isMultiPerson ? poses : poses.slice(0, 1);
  const count = activePoses.length;

  if (statusPill && statusText) {
    statusPill.className = 'status-pill tracking';
    statusText.textContent = count === 1 ? 'Tracking 1 Person' : `Tracking ${count} Persons`;
  }

  if (personsEl) {
    personsEl.textContent = `${count}`;
  }

  if (confEl && count > 0) {
    // Average confidence across active poses
    const totalScore = activePoses.reduce((acc, p) => acc + (p.pose.score || 0), 0);
    const avgScore = Math.round((totalScore / count) * 100);
    confEl.textContent = `${avgScore}%`;
  }

  if (kpEl && count > 0) {
    // Total keypoints tracked across active poses
    let totalKp = 0;
    activePoses.forEach(p => {
      if (p.pose.keypoints) {
        totalKp += p.pose.keypoints.filter(k => k.score > 0.2).length;
      }
    });
    kpEl.textContent = `${totalKp}`;
  }
}

function resetTelemetry() {
  const statusPill = document.getElementById('status-pill');
  const statusText = document.getElementById('status-text');
  const personsEl = document.getElementById('persons-val');
  const confEl = document.getElementById('confidence-val');
  const kpEl = document.getElementById('keypoints-val');

  if (isModelReady && statusPill && statusText) {
    statusPill.className = 'status-pill ready';
    statusText.textContent = 'Searching for Pose';
  }

  if (personsEl) personsEl.textContent = '0';
  if (confEl) confEl.textContent = '--%';
  if (kpEl) kpEl.textContent = '0';
}

function setupControls() {
  const skeletonBtn = document.getElementById('toggle-skeleton-btn');
  const keypointsBtn = document.getElementById('toggle-keypoints-btn');
  const mirrorBtn = document.getElementById('toggle-mirror-btn');
  const multiPoseBtn = document.getElementById('toggle-multipose-btn');
  const snapshotBtn = document.getElementById('snapshot-btn');

  if (skeletonBtn) {
    skeletonBtn.addEventListener('click', () => {
      showSkeleton = !showSkeleton;
      skeletonBtn.classList.toggle('active', showSkeleton);
    });
  }

  if (keypointsBtn) {
    keypointsBtn.addEventListener('click', () => {
      showKeypoints = !showKeypoints;
      keypointsBtn.classList.toggle('active', showKeypoints);
    });
  }

  if (mirrorBtn) {
    mirrorBtn.addEventListener('click', () => {
      isMirrored = !isMirrored;
      mirrorBtn.classList.toggle('active', isMirrored);
    });
  }

  if (multiPoseBtn) {
    multiPoseBtn.addEventListener('click', () => {
      isMultiPerson = !isMultiPerson;
      multiPoseBtn.classList.toggle('active', isMultiPerson);
      if (detectedPoses.length > 0) {
        updateTelemetry(detectedPoses);
      }
    });
  }

  if (snapshotBtn) {
    snapshotBtn.addEventListener('click', () => {
      takeSnapshot();
    });
  }
}

function takeSnapshot() {
  const flash = document.getElementById('snapshot-flash');
  if (flash) {
    flash.classList.add('flash');
    setTimeout(() => {
      flash.classList.remove('flash');
    }, 120);
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  saveCanvas(`posenet-snapshot-${timestamp}`, 'png');
}