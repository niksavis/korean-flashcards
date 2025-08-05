# Korean Flashcards

A browser-based flashcard application for learning Korean with **4,243 carefully curated Korean words**. Features audio pronunciation, romanization, progressive learning sessions, and Korean alphabet reference.

Happy Learning! 화이팅!

## 🚀 Download and Start

**Important**: This application requires a local server to run properly.

1. **Download or clone this repository**:

   ```bash
   git clone https://github.com/niksavis/korean-flashcards.git
   cd korean-flashcards
   ```

2. **Start a local server**:

   ```bash
   # Python 3
   python -m http.server 8000
   
   # Node.js (install http-server first: npm install -g http-server)
   http-server
   
   # PHP
   php -S localhost:8000
   ```

3. **Open the displayed URL in your web browser**

## 🎯 How to Use

- Navigate cards with arrow keys or buttons
- Press `Space` to flip cards
- Use `Q` for settings, `H` for Korean alphabet reference
- Filter by topic, difficulty, or part-of-speech
- Progressive learning sessions available (24 sessions across 5 levels)

### Settings Options

- **Show/Hide Romanization**: Toggle pronunciation display
- **Audio Controls**: Show/hide audio buttons and auto-play
- **Themes**: Switch between light and dark themes

## 🛠️ Contributing Words

To add new words to the app:

1. **Edit the data file**: Add your words to `data/korean-words.json` following this format:

  ```json
  {
    "id": 4244,
    "position": 4244,
    "hangul": "경우",
    "romanization": "gyeong-u",
    "english": "case, circumstances, scenario; reasonable",
    "pronunciation_url": "https://translate.google.com/translate_tts?ie=UTF-8&tl=ko&client=tw-ob&q=%EA%B2%BD%EC%9A%B0",
    "difficulty": "beginner",
    "frequency": "very_high",
    "exampleSentence": {
     "korean": "이것은 경우입니다.",
     "romanization": "i-geo-seun gyeong-u-ip-ni-da.",
     "english": "This is case, circumstances, scenario; reasonable.",
     "pronunciation_url": "https://translate.google.com/translate_tts?ie=UTF-8&tl=ko&client=tw-ob&q=%EC%9D%B4%EA%B2%83%EC%9D%80%20%EA%B2%BD%EC%9A%B0%EC%9E%85%EB%8B%88%EB%8B%A4."
    },
    "topic": "Abstract Concepts",
    "partOfSpeech": "noun"
  }
  ```

2. **Update filters**: After adding words, run this command to update the filtering system:

  ```bash
  cd scripts
  python regenerate_cascading_filters.py
  ```

## 🙏 Acknowledgments

- Korean word data sourced from TOPIK Guide, Wiktionary, and educational resources
- Audio pronunciation powered by Web Speech API and Google TTS
- Korean romanization follows the Revised Romanization of Korean system

## 📄 License

This project is licensed under the [MIT License](LICENSE).

**[⬆ Back to Top](#korean-flashcards)**
