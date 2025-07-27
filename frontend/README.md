# 🎨 AD-AI Frontend

Modern, responsive React frontend for the AD-AI advertisement generator. Features a beautiful step-by-step interface with drag & drop uploads, AI color recommendations, and real-time ad generation.

## ✨ Features

- **Modern Design**: Clean, Dribbble-inspired UI with smooth animations
- **Step-by-Step Workflow**: Intuitive 4-step process for ad creation
- **Drag & Drop Upload**: Easy image upload with visual feedback
- **AI Color Analysis**: Smart color recommendations based on product images
- **Manual Color Picker**: Custom color palette selection
- **Real-time Generation**: Live progress tracking for ad creation
- **Download Ready**: Instant download of generated advertisements
- **Responsive**: Works perfectly on all screen sizes

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Backend server running on http://localhost:8000

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## 🏗️ Tech Stack

- **React 18** - Modern React with hooks
- **Vite** - Lightning fast build tool
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Smooth animations and transitions
- **Axios** - HTTP client for API calls
- **Lucide React** - Beautiful SVG icons

## 📱 UI Components

### Core Components
- `Header` - Gradient header with branding
- `ProgressBar` - Interactive step indicator
- `ImageUpload` - Drag & drop image upload
- `ProductDetails` - Product information form
- `ColorSelection` - AI/manual color picker
- `AdGeneration` - Ad creation and download

### Design System
- **Colors**: Blue to purple gradients with clean grays
- **Typography**: System fonts with clear hierarchy
- **Animations**: Smooth hover effects and page transitions
- **Cards**: Clean white cards with subtle shadows
- **Buttons**: Gradient primary, clean secondary styles

## 🎨 Step-by-Step Process

1. **Upload** - Drag & drop product image
2. **Details** - Enter product and brand names
3. **Colors** - Choose AI recommendations or custom palette
4. **Generate** - Create and download advertisement

## 🔧 API Integration

The frontend communicates with the FastAPI backend through:

- `POST /upload-image` - Upload product images
- `POST /recommend-colors` - Get AI color suggestions
- `POST /generate-ad` - Create advertisements
- `GET /download/{filename}` - Download generated ads
- `DELETE /cleanup/{file_id}` - Clean up temporary files

## 📦 Project Structure

```
frontend/
├── src/
│   ├── components/          # React components
│   │   ├── Header.jsx
│   │   ├── ProgressBar.jsx
│   │   ├── ImageUpload.jsx
│   │   ├── ProductDetails.jsx
│   │   ├── ColorSelection.jsx
│   │   └── AdGeneration.jsx
│   ├── services/
│   │   └── api.js          # API service layer
│   ├── App.jsx             # Main app component
│   ├── index.css           # Global styles
│   └── main.jsx            # App entry point
├── public/                 # Static assets
├── tailwind.config.js      # Tailwind configuration
└── package.json           # Dependencies

```

## 🎯 Key Features

### Responsive Design
- Mobile-first approach
- Flexible grid layouts
- Touch-friendly interactions
- Optimized for all screen sizes

### User Experience
- Clear visual feedback
- Intuitive navigation
- Error handling with helpful messages
- Loading states and progress indicators
- Smooth animations and transitions

### Performance
- Vite for fast development and builds
- Optimized image handling
- Lazy loading and code splitting
- Minimal bundle size

## 🔧 Configuration

### Environment Setup
The frontend expects the backend to be running on `http://localhost:8000`. Update `src/services/api.js` if your backend runs on a different port.

### Styling
Customize the design by modifying:
- `tailwind.config.js` - Colors, animations, and design tokens
- `src/index.css` - Global styles and component classes

## 🚀 Deployment

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

The `dist/` folder contains the production build ready for deployment.

## 💡 Future Enhancements

- [ ] Multiple ad templates
- [ ] Batch processing for multiple products
- [ ] Advanced color harmony algorithms
- [ ] Social media format presets
- [ ] Real-time collaboration features

## 📄 License

MIT License - feel free to use this project for your own applications!
