import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      screens: {
        'xs': '375px',
      }
    }
  },
  plugins: []
} satisfies Config;