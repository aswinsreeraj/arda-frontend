import forms from '@tailwindcss/forms';
import containerQueries from '@tailwindcss/container-queries';

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#131313',
        surface: {
          DEFAULT: '#131313',
          dim: '#131313',
          bright: '#393939',
          card: '#181818',
          panel: '#161616',
          elevated: '#1f1f1f',
          recessed: '#141414',
          hover: '#222222',
          'container-lowest': '#0e0e0e',
          'container-low': '#1b1b1b',
          container: '#20201f',
          'container-high': '#2a2a2a',
          'container-highest': '#353535',
        },
        brand: {
          500: '#2563eb',
          600: '#1d4ed8',
          blue: '#2563eb',
          blueHover: '#1d4ed8',
          accent: '#3b82f6',
          darkBg: '#131313',
          cardBg: '#181818',
          surface: '#1c1c1c',
          border: '#282828',
          borderLight: '#333333',
        },
        primary: {
          DEFAULT: '#b4c5ff',
          container: '#2563eb',
          'on-primary': '#002a78',
          'on-primary-container': '#eeefff',
        },
        secondary: {
          DEFAULT: '#4edea3',
          container: '#00a572',
        },
        telemetry: {
          healthy: '#10b981',
          review: '#f59e0b',
          blocked: '#ef4444',
        },
        border: {
          subtle: '#242424',
          structural: '#2e2e2e',
          interactive: '#3e3e3e',
        },
      },
      fontFamily: {
        sans: ['Geist', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      boxShadow: {
        'glow-primary': '0 0 12px rgba(37, 99, 235, 0.35)',
        'glow-healthy': '0 0 10px rgba(16, 185, 129, 0.3)',
        'modal-depth': '0 8px 24px rgba(0, 0, 0, 0.6)',
      },
    },
  },
  plugins: [
    forms,
    containerQueries,
  ],
};
