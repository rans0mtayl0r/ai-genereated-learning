# 🧠 Adaptive Learning Platform

AI-powered courses that adapt to your learning style in real-time. Built with Next.js, Claude API, and evidence-based learning psychology.

## ✨ Features

- **Fully AI-Driven**: Claude generates custom courses based on web research
- **Cool Color Psychology**: Blue/cyan/purple palette (no anxiety-inducing warm colors)
- **Web Search Integration**: AI searches current research, peer-reviewed studies, and pedagogy best practices
- **Learning Style Adaptation**: Tracks visual/verbal/kinesthetic preferences over time
- **Real-World Anchoring**: Connects abstract concepts to familiar examples
- **Persistent Storage**: Courses saved in browser, ready for cloud sync
- **Mental Toughness Training**: Encourages pushing through difficult concepts
- **Evidence-Based**: Built on research from Dweck, Skinner, Kahneman, and others

## 🎨 Design Principles

### Color Psychology (Research-Backed)
- **Cyan/Teal**: Growth, calm, safe to explore
- **Blue**: Trust, cognitive performance boost (Mehta & Zhu, 2009)
- **Purple**: Mastery, creativity, advanced concepts
- **No Warm Colors**: Red/orange/yellow trigger test anxiety (Elliot et al., 2007)

### Learning Psychology
- **Variable Ratio Rewards**: Unpredictable encouragement (Skinner, 1953)
- **Struggle Detection**: Adaptive support based on attempts
- **Real-World First**: "What does this remind you of?" before abstractions
- **Visual-Mandatory**: Every concept has spatial representation
- **One Concept Per Screen**: Reduces cognitive load

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- Claude API key from [console.anthropic.com](https://console.anthropic.com)

### Local Development
```bash
npm install
npm run dev
# Visit http://localhost:3000
```

### Deploy to Production (Free)
See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete guide.

**TL;DR:**
1. Push to GitHub
2. Import to Vercel
3. Deploy (takes 2 minutes)
4. ✅ Live at your-app.vercel.app

## 💡 How It Works

### User Experience
1. User enters what they want to learn
2. Optional: Specific focus/lens (e.g., "through lens of music production")
3. AI searches web for:
   - Current state of topic (Feb 2026)
   - Peer-reviewed research
   - Best teaching practices for adults
   - eLearning psychology research
4. AI builds 10-14 screen course with:
   - Real-world relationship anchoring
   - Visual diagrams for every concept
   - Forced practice interactions
   - Adaptive difficulty
5. User works through course
6. Platform learns user's learning style
7. Future courses adapt automatically

### Technical Architecture
```
User Browser (localStorage)
    ↓
Next.js Frontend (React)
    ↓
API Route (/api/claude)
    ↓
Claude API (with web_search tool)
    ↓
Web Research → Course Generation → Delivery
```

## 📁 Project Structure

```
learning-platform/
├── app/
│   ├── api/
│   │   └── claude/
│   │       └── route.ts          # API proxy to Claude
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Main app (6500+ lines)
├── package.json
├── tsconfig.json
├── next.config.js
├── DEPLOYMENT.md                 # Deploy guide
└── README.md                     # This file
```

## 🎓 Master Prompt Context

The platform uses a master system prompt containing:
- Color psychology principles
- Learning science research
- Course structure guidelines
- Interaction patterns
- Response formatting rules

All context from our design conversation is embedded, ensuring consistent, research-backed behavior.

## 🔒 Security & Privacy

- **API keys**: Stored in browser localStorage only
- **No backend storage**: Everything client-side by default
- **No tracking**: No analytics unless you add them
- **Open source**: Audit the code yourself

## 💰 Cost

- **Hosting**: FREE (Vercel)
- **Claude API**: Pay-as-you-go (~$5-20/month typical usage)
- **Storage**: FREE (browser localStorage)
- **Total**: ~$5-20/month for API calls

## 🛠 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **AI**: Claude Sonnet 4 (with web search)
- **Styling**: Inline React styles
- **Storage**: localStorage (ready for backend)
- **Hosting**: Vercel (free tier)

## 📊 Features Roadmap

### ✅ Completed
- Fully AI-driven course generation
- Web search integration
- Cool color palette (no warm colors)
- Learning style detection
- Real-world anchoring
- Chat-based interaction
- Course library
- Persistent storage

### 🔜 Next Up
- Backend database (PostgreSQL)
- User authentication
- Cloud sync across devices
- Progress analytics
- Social sharing
- Community features
- Mobile app

### 🔮 Future
- Marketplace for user-created courses
- Collaborative learning
- Video integration
- AR/VR experiments
- API for third-party integrations

## 🐛 Troubleshooting

### "API key required" error
- API key must be entered in browser UI
- Stored in localStorage (client-side only)
- Not in environment variables

### Courses not saving
- Check browser console for errors
- Clear cache and try again
- Ensure localStorage enabled

### Web search taking forever
- First interaction with research can take 60+ seconds
- Academic paper searches are slow
- Normal behavior - be patient

### Build fails
```bash
rm -rf node_modules .next
npm install
npm run build
```

See [DEPLOYMENT.md](./DEPLOYMENT.md) for full troubleshooting guide.

## 📚 Research Citations

- Dweck, C. S. (2006). *Mindset: The new psychology of success*
- Elliot, A. J., et al. (2007). Color and psychological functioning
- Kahneman, D., & Tversky, A. (1979). Prospect theory
- Mehta, R., & Zhu, R. (2009). Blue or red? Exploring cognitive performance
- Skinner, B. F. (1953). *Science and human behavior*

## 🤝 Contributing

This is a personal project, but suggestions welcome:
1. Fork the repo
2. Create feature branch
3. Make your changes
4. Submit PR with description

## 📝 License

MIT License - Use freely, commercially or personally.

## 🙏 Acknowledgments

Built on research from:
- Carol Dweck (growth mindset)
- B.F. Skinner (behaviorism)
- Daniel Kahneman (cognitive psychology)
- Learning science community

Powered by:
- Anthropic (Claude API)
- Vercel (hosting)
- Next.js (framework)

---

**Ready to deploy?** See [DEPLOYMENT.md](./DEPLOYMENT.md)

**Questions?** Check troubleshooting or open an issue.

Built with 🧠 and ☕
