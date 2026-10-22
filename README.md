# PoseNet Real-Time Pose Estimation

A clean, modern, and responsive web application for real-time human pose estimation and multi-person skeleton tracking.

This project is a 100% pure client-side static web application. It requires no Node.js, no npm, and no build pipeline. All dependencies are loaded directly via browser CDNs.

---

## Overview

The application utilizes TensorFlow.js through ml5.js to perform real-time pose estimation on a live webcam feed. It tracks 17 anatomical keypoints per person and draws connected skeletons directly on an HTML5 canvas using p5.js with zero server computation.

The interface features a dark aesthetic with glassmorphic elements, real-time telemetry, and interactive visual toggles.

---

## Features

- **Multi-Person Tracking**: Detects and tracks up to 5 people simultaneously.
- **Individual Color Themes**: Automatically assigns distinct color schemes (Indigo/Cyan, Emerald/Mint, Amber/Gold, Rose/Pink, Purple/Violet) to each detected person to prevent visual overlap.
- **Customizable Overlays**:
  - Toggle Skeleton Lines (on/off)
  - Toggle Keypoint Markers (on/off)
  - Switch between Multi-Person and Single-Person modes
- **Mirror Mode**: Horizontally flips the webcam feed and coordinates for a natural selfie-style mirror view.
- **Snapshot Capture**: Downloads high-resolution PNG captures of the canvas with a shutter flash effect.
- **Real-Time Telemetry**: Displays live frame rate (FPS), detected person count, average pose confidence, and total active keypoints.
- **Pure Static Frontend**: Runs in any standard browser without Node.js, package managers, or compilation.

---

## Tech Stack

- **[p5.js (v1.9.4)](https://p5js.org/)**: Loaded via CDN for canvas rendering and webcam capture.
- **[ml5.js (v0.12.2)](https://ml5js.org/)**: Loaded via CDN for the pre-trained PoseNet MobileNetV1 model.
- **HTML5 & CSS3**: Standard semantic markup and responsive stylesheets using CSS custom properties.

---

## Running Locally

Because modern web browsers require a local server or secure origin (`http://localhost` or `https://`) to grant webcam access, run the project through any basic static server rather than double-clicking `index.html` via `file://`.

### Method 1: VS Code Live Server (Recommended)

1. Open the project folder in Visual Studio Code.
2. Install the **Live Server** extension.
3. Right-click `index.html` and choose **Open with Live Server**.

### Method 2: Python Built-In HTTP Server

If you have Python installed, run this command from the project folder:

```bash
python -m http.server 8000
```

Then open your browser and go to `http://localhost:8000`.

---

## Keypoints Reference

PoseNet tracks 17 keypoints per person according to the COCO dataset standard:

| Index | Body Part | Index | Body Part |
| :--- | :--- | :--- | :--- |
| 0 | Nose | 9 | Left Wrist |
| 1 | Left Eye | 10 | Right Wrist |
| 2 | Right Eye | 11 | Left Hip |
| 3 | Left Ear | 12 | Right Hip |
| 4 | Right Ear | 13 | Left Knee |
| 5 | Left Shoulder | 14 | Right Knee |
| 6 | Right Shoulder | 15 | Left Ankle |
| 7 | Left Elbow | 16 | Right Ankle |
| 8 | Right Elbow | | |

---

## Project Structure

```
possnet/
├── index.html       # HTML structure, CDN script tags, and UI elements
├── style.css        # Styling, layout, and animations
├── main.js          # p5.js canvas logic and ml5.js PoseNet handling
└── README.md        # Documentation
```

---

## Controls & Usage

| Control | Description | Default State |
| :--- | :--- | :--- |
| **Skeleton** | Toggles skeletal connection lines between joints | Enabled |
| **Keypoints** | Toggles glowing circular joint markers | Enabled |
| **Mirror** | Flips the webcam feed horizontally for mirror view | Enabled |
| **Multi-Person** | Toggles tracking for all people vs. single primary person | Enabled |
| **Capture** | Saves the current canvas frame as a PNG file | Action |

---

## Deployment

Because this project consists purely of static files, it can be deployed to any static host without configuration or build commands:

- **GitHub Pages**: Push the repository to GitHub, go to **Settings** > **Pages**, and select the root of your main branch.
- **Netlify**: Drag and drop the project folder directly into Netlify Drop.
- **Vercel / Cloudflare Pages**: Connect the repository with zero build configuration.

Note: Deployed sites must be accessed via `https://` for the browser to permit webcam access.

---

## License

This project is open source and available under the [MIT License](LICENSE).
