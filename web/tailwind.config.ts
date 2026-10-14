import type { Config } from 'tailwindcss';

const config: Config = {
  content: {
    relative: true,
    files: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}']
  },
  theme: {
    extend: {
      colors: {
        ink: '#15191f',
        panel: '#1c222b',
        line: '#35404e',
        graphite: '#232b36',
        accent: '#9bbcff',
        success: '#78d6ab',
        warning: '#F4C95D',
        danger: '#FF5D73'
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(57, 255, 136, 0.08)'
      }
    }
  },
  plugins: []
};

export default config;
