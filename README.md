# Finals - Spy Espionage

An immersive web-based educational game built with **Vue 3** and **Supabase**, where players complete cipher puzzles, solve missions across different countries, and unlock classified intelligence. Perfect for learning cybersecurity concepts and codebreaking!

![Vue.js](https://img.shields.io/badge/Vue-3.5-brightgreen)
![Vite](https://img.shields.io/badge/Vite-7.1-purple)
![Supabase](https://img.shields.io/badge/Supabase-2.86-green)
![License](https://img.shields.io/badge/License-MIT-blue)

---

## 🎮 Features

✅ **Interactive World Map** - Explore countries and complete region-specific missions  
✅ **Cipher Puzzles** - Solve encryption challenges to unlock content  
✅ **Mission System** - Complete objectives across global operational theaters  
✅ **User Authentication** - Secure login/signup with Supabase  
✅ **Admin Dashboard** - Manage content, users, and game data  
✅ **Image Storage** - Upload and manage mission-related media  
✅ **Blog/Content System** - Read classified intelligence reports  
✅ **Profile System** - Track progress and achievements  
✅ **Sound Effects** - Immersive ambient audio experience  

---

## 📁 Project Structure

```
FinalBackEnd/          # Admin interface for content management
├── src/
│   ├── views/         # Admin pages (CRUD operations)
│   ├── components/    # Reusable UI components
│   ├── router/        # Route configuration
│   └── library/       # Supabase integration
│
FinalFrontEnd/         # Main game interface for players
├── src/
│   ├── views/         # Game pages (Home, Missions, Maps, Profile)
│   ├── components/    # Game UI components
│   ├── composables/   # Vue composables (image handling, sound)
│   ├── library/       # Core game logic & Supabase
│   ├── router/        # Game navigation
│   ├── stores/        # Pinia state management
│   └── assets/        # CSS, images, fonts
├── public/
│   ├── map/           # Map data
│   └── sounds/        # Audio files
```

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** v20.19.0 or higher
- **npm** or **yarn**
- **Supabase account** (free tier available)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Aurevwuh/Electives2-3---FinalProject.git
   cd "FInals Development"
   ```

2. **Install dependencies for both projects**
   ```bash
   cd FinalFrontEnd
   npm install
   
   cd ../FinalBackEnd
   npm install
   ```

3. **Configure Supabase**
   - Create a Supabase project at [supabase.com](https://supabase.com)
   - Get your **Project URL** and **Anon Key**
   - Update `src/library/supabase.js` in both projects:
   ```javascript
   const supabaseUrl = "YOUR_PROJECT_URL"
   const supabaseKey = "YOUR_ANON_KEY"
   ```

4. **Start development servers**
   ```bash
   # Terminal 1: Main game (port 5173)
   cd FinalFrontEnd
   npm run dev
   
   # Terminal 2: Admin panel (port 5174)
   cd FinalBackEnd
   npm run dev
   ```

5. **Access the application**
   - Game: http://localhost:5173
   - Admin: http://localhost:5174

---

## 🎯 Key Features Explained

### 🗺️ Interactive World Map
- Built with **Leaflet.js** and **SVG Maps**
- Click on countries to access region-specific missions
- Only countries with available missions are interactive
- Responsive design for desktop and mobile

### 🔐 Cipher Puzzles
- Multiple difficulty levels
- Various encryption methods (Caesar, ROT13, substitution)
- Real-time validation and hints
- Educational content about cryptography

### 🎖️ Mission System
- Multi-step objectives for each country
- Unlock higher-level missions by completing prerequisites
- Track progress across the game
- Earn badges and achievements

### 👤 User Management
- Secure authentication with Supabase Auth
- User profiles with progress tracking
- Save game state and history
- Leaderboard system (admin view)

### 📸 Image & Media Management
- Upload mission briefings and country images
- Supabase Storage integration
- Automatic image optimization
- Support for multiple file formats

### 📊 Admin Dashboard
- Full CRUD operations for:
  - Countries and missions
  - Cipher puzzles
  - Users and permissions
  - Content and blog posts
- Real-time data management
- User analytics

---

## 🗄️ Database Schema

### Core Tables
- **countries** - Game regions with metadata
- **questions** - Mission objectives and cipher puzzles
- **users** - Player accounts and progress
- **blog_posts** - Intelligence reports and content
- **game_images** - Media storage metadata

See [SUPABASE_STORAGE_GUIDE.md](FinalFrontEnd/SUPABASE_STORAGE_GUIDE.md) for detailed schema documentation.

---

## 📚 Important Files

### FinalFrontEnd
- [IMPLEMENTATION_SUMMARY.md](FinalFrontEnd/IMPLEMENTATION_SUMMARY.md) - Feature details
- [QUICK_START.md](FinalFrontEnd/QUICK_START.md) - Fast setup guide
- [SUPABASE_STORAGE_GUIDE.md](FinalFrontEnd/SUPABASE_STORAGE_GUIDE.md) - Image storage API

### Core Game Files
- `src/library/supabase.js` - All Supabase queries and operations
- `src/library/soundManager.js` - Audio management
- `src/composables/useSupabaseImages.js` - Image handling composable
- `src/router/index.js` - Route definitions
- `src/stores/counter.js` - Global game state (Pinia)

---

## 🛠️ Technology Stack

| Technology | Purpose |
|-----------|---------|
| **Vue 3** | Frontend framework |
| **Vite** | Build tool (lightning fast) |
| **Supabase** | Backend & authentication |
| **Pinia** | State management |
| **Vue Router** | Navigation |
| **Leaflet.js** | Interactive maps |
| **D3.js** | Geospatial visualization |
| **TopoJSON** | Geographic data format |

---

## 🎮 How to Play

1. **Sign Up** - Create a player account
2. **Choose a Country** - Select a region from the world map
3. **Read the Brief** - Check mission details and context
4. **Solve Puzzles** - Complete cipher and logic challenges
5. **Unlock Content** - Gain access to classified intelligence
6. **Track Progress** - View your achievements and stats

---

## 🔧 Development

### Available Commands

```bash
# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Project Scripts

**FinalFrontEnd & FinalBackEnd** (same structure):
```bash
npm run dev      # Start Vite dev server
npm run build    # Create optimized production build
npm run preview  # Preview the production build
```

---

## 📝 Configuration

### Environment Variables
Create a `.env.local` file (not tracked in git):

```env
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### Supabase Setup
1. Enable authentication methods (Email/Password, Google, GitHub)
2. Create the required tables (see database schema above)
3. Set up Row-Level Security (RLS) policies for data protection
4. Configure storage buckets for game-images

---

## 🐛 Troubleshooting

### "Countries without missions showing on map"
✅ Fixed! The system now uses `getCountriesWithQuestions()` to filter playable countries.

### "Images not loading"
- Verify Supabase bucket exists: `game-images`
- Check bucket permissions are public
- Ensure file paths are correctly stored in database

### "Authentication not working"
- Verify Supabase credentials in `supabase.js`
- Check email/password authentication is enabled
- Clear browser cache and cookies

---

## 📄 License

MIT License © 2024 - Feel free to use for educational purposes

---

## 👨‍💻 Authors

**Khyle Noelle Reyes** - Computer Engineering Student  
**Augustien Caryd Ramos** - Computer Engineering Student

---

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Submit a pull request

---

## 📞 Support

For issues, questions, or feedback:
- Open a GitHub Issue
- Check existing documentation in the project
- Review the implementation guides for specific features

---

## 🎓 Learning Resources

This project demonstrates:
- Vue 3 Composition API
- Real-time database integration
- Authentication flows
- Geospatial visualization
- State management patterns
- Component composition in Vue
- REST API integration with Supabase

Perfect for learning modern web development!

---

**Last Updated:** December 2024  
**Status:** Active Development
