# 3D Model Showcase

A modern, interactive single-page website featuring a beautiful 3D model with 360-degree rotation capabilities.

## Features

- **Interactive 3D Model**: A stunning dodecahedron with metallic material and glow effects
- **360° Rotation**: Automatic rotation with manual control options
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- **Modern UI**: Clean, dark theme with gradient accents
- **User Controls**: 
  - Toggle auto-rotation on/off
  - Reset camera view
  - Mouse/touch interaction (rotate, pan, zoom)

## Technology Stack

- **Three.js**: 3D graphics rendering
- **Vanilla JavaScript**: No frameworks needed
- **Modern CSS**: Responsive design with CSS Grid/Flexbox
- **HTML5**: Semantic markup

## Local Development

1. Clone or download this repository
2. Start a local server:
   ```bash
   python3 -m http.server 3000
   ```
3. Open `http://localhost:3000` in your browser

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Controls

- **Left click + drag**: Rotate the model
- **Right click + drag**: Pan the view  
- **Mouse wheel**: Zoom in/out
- **Touch**: Support for touch devices

## Customization

You can easily customize the 3D model by modifying the `createDefaultModel()` method in `script.js`. The current implementation uses:

- **Geometry**: Dodecahedron (12-sided polyhedron)
- **Material**: Physical material with metallic properties
- **Effects**: Inner glow and wireframe overlay
- **Lighting**: Multi-directional lighting setup

---

Built with ❤️ using Three.js
