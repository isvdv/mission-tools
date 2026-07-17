import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#070A12',
        panel: '#111827',
        line: '#253047',
        cyanSoft: '#6EE7F9',
        violetSoft: '#A78BFA',
        blueSoft: '#60A5FA'
      },
      boxShadow: {
        glow: '0 20px 80px rgba(96, 165, 250, 0.18)'
      }
    }
  },
  plugins: []
};

export default config;
