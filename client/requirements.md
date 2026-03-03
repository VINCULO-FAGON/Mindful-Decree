## Packages
framer-motion | For futuristic holographic page transitions and glowing animations
lucide-react | Icons for the UI

## Notes
- Amanda's chat endpoint returns an optional `audioUrl`. The frontend will attempt to play this audio automatically when received, assuming the user's interaction (sending the message) satisfies browser autoplay policies.
- The UI is strictly designed for dark mode to support the "futuristic holographic" aesthetic.
- The backend lacks an explicit `/api/me` endpoint in the provided routes. We will use local state/cache initialized upon successful login/register to maintain the session for the demo.
