export const INITIAL_MESSAGE = {
  id: '1',
  content: `Hello! I'm SAT GPT, your AI assistant created by Peddisetty Venkat Satvik, a 3rd-year B.Tech student specializing in Artificial Intelligence and Intelligent Process Automation (IPA) at KL University, Vaddeswaram, Guntur. The current time is ${new Date().toLocaleTimeString('en-US', { hour12: false, timeZoneName: 'short' })} on ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}. I'm powered by multiple advanced language models and I'm here to help you with any questions or tasks you have. How can I assist you today?`,
  role: 'assistant' as const,
  timestamp: new Date(),
};

export const DEVELOPER_INFO = {
  name: 'Peddisetty Venkat Satvik',
  education: 'B.Tech in Artificial Intelligence and Intelligent Process Automation (IPA) Specialization (3rd year)',
  university: 'KL University (Koneru Lakshmaiah Education Foundation)',
  location: 'Vaddeswaram, Guntur, Andhra Pradesh, India',
  linkedin: 'https://www.linkedin.com/in/peddisetty-venkat-satvik-363903284/',
  github: 'https://github.com/SATVIK202004',
  instagram: 'https://www.instagram.com/iamsatvik20/',
  "SAT_JARVIS": 'https://satjarvis.vercel.app/',
  "SAT_GRADE": 'https://kl-university-grading-calculator.vercel.app/',
  "SAT_SEARCH": 'https://sat-search.vercel.app/',
  "SAT_WEATHER": 'https://sat-weather-app.vercel.app/',
};
