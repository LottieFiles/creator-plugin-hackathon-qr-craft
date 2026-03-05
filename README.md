# QR Craft

A [LottieFiles Creator](https://www.lottiefiles.com/) plugin for generating stylized, animated QR codes directly on your canvas.

## Demo

<p align="center">
  <img src="assets/sample.gif" alt="QR Craft demo – animated QR code" width="400" />
</p>

> A sample Lottie animation (`assets/sample.json`) and video (`assets/sample.mp4`) are also included. The video and gif were generated using [ffdotlottie](https://github.com/LottieFiles/ffdotlottie).

## Features

### Design

- **10 dot styles** — square, rounded, circle, diamond, cross, star, hexagon, classy, heart, ring
- **7 corner styles** — square, rounded, circle, extra-rounded, dot, classy, leaf
- **Custom colors** — foreground, background, and optional linear/radial gradients
- **Logo embedding** — upload an image to overlay in the center with adjustable size
- **Error correction** — L / M / Q / H levels

### Animate

- **17 reveal animations** — fade-in, row sweep, spiral reveal, pixel scatter, drop-in, column sweep, diagonal wipe, checkerboard, quadrant reveal, bounce-in, spin-in, glitch, zoom-out, typewriter, ripple, rain, elastic snap
- **16 easing curves** — linear, ease-in/out/in-out (quad, cubic, expo, back), bounce, spring, elastic
- **Configurable duration** in frames, synced to your scene's framerate
- **Live preview** inside the plugin panel before inserting

### Integration

- Inserts as layered SVG groups with full keyframe animation (opacity, position, scale, rotation)
- Automatically scales and centers to 60% of your scene
- Extends scene duration when the animation exceeds it
- Follows Creator's light/dark theme

## Development

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [pnpm](https://pnpm.io/)

### Setup

```bash
pnpm install
```

### Commands

```bash
pnpm dev        # Start dev server with hot reload
pnpm build      # Production build (type-check + Vite build)
pnpm lint       # Run ESLint
pnpm exec tsc -b  # Type-check only
```

## Project Structure

```
plugin/          # Plugin sandbox code (runs in Creator's plugin runtime)
  manifest.json  # Plugin metadata
  plugin.ts      # Plugin entry — scene manipulation, animation keyframes
shared/          # Shared types and logic between plugin and UI
  types.ts       # QR config, animation config, message types
  animation.ts   # Keyframe generation for reveal animations
src/             # UI code (React, rendered in plugin panel)
  app.tsx        # Root component with Design/Animate tabs
  components/    # QR preview, action bar, tab panels
  hooks/         # QR state management, theme sync
  utils/         # QR matrix generation, SVG rendering, CSS animation
```

## Tech Stack

- **UI**: React 19, Tailwind CSS 4, [@lottiefiles/creator-plugins-ui](https://www.npmjs.com/package/@lottiefiles/creator-plugins-ui)
- **QR generation**: [qrcode](https://www.npmjs.com/package/qrcode)
- **Build**: Vite 7, [@lottiefiles/vite-plugin-creator](https://www.npmjs.com/package/@lottiefiles/vite-plugin-creator)
- **Icons**: [lucide-react](https://lucide.dev/)
