/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        drone: {
          primary: 'var(--drone-primary)',
          secondary: 'var(--drone-secondary)',
          warning: 'var(--drone-warning)',
          success: 'var(--drone-success)',
        },
        map: {
          day: 'var(--map-day)',
          night: 'var(--map-night)',
        },
        space: {
          bg: 'var(--space-bg)',
          grid: 'var(--space-grid)',
        },
      },
    },
  },
  important: '#__next',
  corePlugins: {
    preflight: false,
  },
};
