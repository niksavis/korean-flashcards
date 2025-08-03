# Korean Flashcards Application

A modern, browser-based flashcard application for learning Korean with 6000+ of the most common Korean words. Features audio pronunciation, romanization, and comprehensive Korean learning tools.

## 🚀 Quick Start

This is a simple, browser-based application that requires no installation or build process.

### Option 1: Direct File Opening

1. **Download or clone this repository**:

   ```bash
   git clone https://github.com/your-username/korean-flashcards.git
   cd korean-flashcards
   ```

2. Open `index.html` in any modern web browser
3. Start learning Korean words immediately!

### Option 2: Local Server (Recommended)

For better performance and to avoid CORS issues:

**Using Python:**

```bash
# Navigate to the project directory
cd korean-flashcards

# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000

# Open in browser
# http://localhost:8000
```

**Using Node.js:**

```bash
# Install a simple server
npm install -g http-server

# Navigate to project directory and start
cd korean-flashcards
http-server

# Open in browser
# http://localhost:8080
```

**Using PHP:**

```bash
cd korean-flashcards
php -S localhost:8000
```

## 📱 Features

- **6000+ Korean Words**: Complete dataset with position numbers, Hangul, romanization, and English translations
- **Audio Pronunciation**: Dual-speed audio system for words and sentences
- **Korean-Only Mode**: Hide English translations by default for immersive learning
- **Responsive Design**: Works perfectly on mobile and desktop
- **Keyboard Shortcuts**: Navigate efficiently with keyboard controls
- **Progress Tracking**: Track your learning progress with local storage
- **Settings Panel**: Customize your learning experience
- **Offline Ready**: No internet required after initial load

## 🎯 Usage

### Navigation

- **Space Bar** or **Click**: Flip card to see translation
- **Arrow Keys** or **Navigation Buttons**: Previous/Next card
- **A Key**: Play word pronunciation
- **S Key**: Play sentence pronunciation
- **Q Key**: Open settings panel

### Settings Options

- **Show Romanization**: Toggle romanized pronunciation display
- **Korean-Only Mode**: Hide English translations by default
- **Audio Controls**: Show/hide audio buttons
- **Auto-play Audio**: Automatically play word pronunciation
- **Audio Speed**: Adjust playback speed (0.5x - 1.5x)

## 📁 Project Structure

```text
korean-flashcards/
├── index.html              # Main application entry point
├── css/
│   ├── styles.css           # Main stylesheet
│   ├── components.css       # Component-specific styles
│   └── mobile.css           # Mobile-responsive styles
├── js/
│   ├── main.js              # Application entry point
│   ├── components/          # UI components
│   │   ├── flashcard.js     # Flashcard display logic
│   │   ├── navigation.js    # Navigation controls
│   │   ├── progress.js      # Progress tracking
│   │   └── settings.js      # Settings panel
│   ├── services/            # Business logic
│   │   ├── dataService.js   # Word data management
│   │   ├── audioService.js  # Audio functionality
│   │   ├── settingsService.js # User preferences
│   │   └── storageService.js # Local data storage
│   └── utils/               # Utility functions
│       ├── keyboardHandler.js # Keyboard shortcuts
│       └── themeManager.js   # Theme switching
├── data/
│   └── korean-words.json    # Korean words dataset (6000+ words)
├── assets/                  # Static assets (icons, fonts)
├── scripts/                 # Data collection scripts (Python)
│   └── data-collection/     # Korean word data processing
├── tests/                   # Test HTML files for development
├── LICENSE                  # MIT License
├── README.md               # Project documentation
└── TODO.md                 # Implementation roadmap
```

## 🔧 Technical Details

### Technology Stack

- **HTML5**: Semantic markup with accessibility features
- **CSS3**: Modern styling with Grid/Flexbox, CSS custom properties
- **Vanilla JavaScript**: ES6+ modules, no frameworks required
- **Web APIs**: Speech Synthesis API, Local Storage, Fetch API

### Browser Compatibility

- Chrome 61+ (recommended)
- Firefox 60+
- Safari 12+
- Edge 79+

### Audio Features

- **Primary**: Web Speech API for native browser pronunciation
- **Fallback**: Google Translate TTS for broader compatibility
- **Dual Speed**: Normal speed for individual words, slower for sentences

## 📊 Data Format

The application uses a simple JSON format for word data:

```json
{
  "id": 1,
  "position": 1,
  "hangul": "것",
  "romanization": "geot",
  "english": "A thing or an object",
  "wordType": "noun",
  "difficulty": "beginner",
  "exampleSentence": {
    "korean": "이것은 일상생활에서 자주 사용되는 것이다.",
    "romanization": "igeoseun ilsangsaenghwargeseo jaju sayongdoeneun geosida.",
    "english": "This is something frequently used in daily life."
  },
  "grammaticalInfo": {
    "usage": "Used to refer to objects or abstract concepts",
    "detailed": "Dependent noun that requires a modifier..."
  }
}
```

## 🎮 Keyboard Shortcuts

| Key     | Action              |
| ------- | ------------------- |
| `Space` | Flip card           |
| `←` `→` | Previous/Next card  |
| `A`     | Play word audio     |
| `S`     | Play sentence audio |
| `Q`     | Open settings       |
| `Esc`   | Close panels        |

## 📱 Mobile Support

The application is fully responsive and optimized for mobile devices:

- Touch-friendly interface
- Proper viewport scaling
- Optimized button sizes
- Swipe gestures (future enhancement)

## 🔒 Privacy

- All data is stored locally in your browser
- No personal information is collected or transmitted
- Audio pronunciation uses Web Speech API or Google TTS
- No analytics or tracking

## 🚀 Deployment

### Static Hosting

Upload all files to any static hosting service:

- **GitHub Pages**: Enable Pages in repository settings
- **Netlify**: Drag and drop the folder
- **Vercel**: Connect repository for automatic deployment
- **Any web server**: Upload files to public directory

### CDN Deployment

For global performance, upload to a CDN like:

- AWS CloudFront
- Google Cloud CDN
- Cloudflare

## 🛠️ Development

### Local Development

1. Clone the repository
2. Start a local server (see Quick Start)
3. Edit files and refresh browser
4. No build process required!

### Adding New Words

1. Edit `data/korean-words.json` to add or modify words
2. Follow the JSON format specification shown above
3. Refresh the application

### Customization

- **Themes**: Modify CSS custom properties in `css/styles.css`
- **Colors**: Update the `:root` color variables
- **Layout**: Adjust component styles in `css/components.css`
- **Features**: Add new components in `js/components/`

## 📋 TODO / Roadmap

See `TODO.md` for detailed implementation plan and future enhancements.

## 🤝 Contributing

This is a simple, educational project. Feel free to:

- Report bugs or issues
- Suggest new features
- Submit improvements
- Add more Korean words to the dataset

## 📄 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- Korean word data sourced from TOPIK Guide and educational resources
- Audio pronunciation powered by Web Speech API and Google TTS
- Korean romanization follows the Revised Romanization of Korean system
- Designed for English speakers learning Korean

---

Happy Learning! 화이팅! (Fighting!)
