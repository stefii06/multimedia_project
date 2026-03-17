# Photo Editor (HTML5 Canvas)

A small **browser-based photo editor** built with **HTML/CSS + Vanilla JavaScript** using the **HTML5 Canvas** API.

## Features
- Upload an image (`.jpg/.jpeg`) and edit it on a main canvas
- Draw a **selection rectangle** (used for operations + histogram)
- **Histogram preview** (grayscale intensity) for the selected area
- Area-based operations:
  - **Grayscale** (selected region)
  - **Crop** to selection
  - **Delete selection** (fill selected region with white)
- **Resize** image while keeping aspect ratio
- Add/edit/delete **text overlays** (font, size, color) and **drag to move**
- **Save** the result as PNG
- **Reset** to the original image

## Tech
- Canvas rendering + pixel processing (`getImageData` / `putImageData`)
- Uses `canvas.toDataURL()` to persist edits across redraws
