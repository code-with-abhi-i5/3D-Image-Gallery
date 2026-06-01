# 🌌 Hover-Fueled 3D Image Gallery

A stunning, interactive 3D image gallery built with **React**, **Vite**, and **GSAP**. This project transforms a flat collection of images into a dynamic, hover-fueled 3D wheel experience.

## ✨ Features

- **3D Interactive Gallery**: Images are arranged in a circular 3D space.
- **Parallax Hover Effect**: Move your mouse around to tilt and shift the entire gallery and individual cards.
- **Dynamic Previews**: Click on any image to trigger a dramatic zoom-in animation and reveal its title.
- **GSAP Animations**: Fluid transitions using GSAP and `SplitText` for beautiful typography animation.
- **Responsive**: Automatically adjusts scale based on screen size (Mobile, Tablet, Desktop).

## 🚀 Tech Stack

- **React 18**: Component structure and lifecycle management.
- **Vite**: Blazing fast build tool and development server.
- **GSAP (GreenSock)**: Industry-standard animation library for the complex 3D logic.
- **CSS**: Vanilla CSS for styling and perspective management.

## 🛠️ Installation & Setup

1. **Clone the repository** (if applicable) or download the files.
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Start the development server**:
   ```bash
   npm run dev
   ```
4. **Open in Browser**: Navigate to `http://localhost:5173` (or the URL provided by Vite).

## 📁 Project Structure

```
├── public/               # Static assets (30 images)
├── src/
│   ├── App.jsx           # Main React component & GSAP animation logic
│   ├── App.css           # Styling and 3D perspectives
│   ├── main.jsx          # React entry point
│   └── collection.js     # Array of image data and titles
├── index.html            # Vite HTML entry point
├── package.json          # Dependencies and scripts
└── vite.config.js        # Vite configuration
```

## 🎨 How it Works

The gallery leverages React's `useRef` to maintain references to DOM elements and mutable animation state without triggering expensive re-renders. A single `requestAnimationFrame` loop handles the continuous interpolation (lerp) of the parallax and card transformations to create a buttery-smooth 3D effect.

## 👨‍💻 Author

Made by **Abhijeet Ghosh**
