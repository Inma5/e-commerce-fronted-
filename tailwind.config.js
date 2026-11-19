/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Hallmark Semantic Tokens
        paper: {
          DEFAULT: 'var(--color-paper)',
          2: 'var(--color-paper-2)',
          3: 'var(--color-paper-3)',
        },
        ink: {
          DEFAULT: 'var(--color-ink)',
          primary: 'var(--color-ink)',
          2: 'var(--color-ink-2)',
          secondary: 'var(--color-ink-2)',
          muted: 'var(--color-muted)',
        },
        muted: 'var(--color-muted)',
        rule: {
          DEFAULT: 'var(--color-rule)',
          2: 'var(--color-rule-2)',
        },
        accent: {
          DEFAULT: 'var(--color-accent)',
          hover: 'var(--color-accent-hover)',
          ink: 'var(--color-accent-ink)',
          subtle: 'var(--color-accent-subtle)',
        },
        navy: {
          DEFAULT: 'var(--color-navy)',
          main: 'var(--color-navy)',
          secondary: 'var(--color-navy-hover)',
          hover: 'var(--color-navy-hover)',
          dark: 'var(--color-paper)',
          ink: 'var(--color-navy-ink)',
        },
        gold: {
          DEFAULT: 'var(--color-accent)',
          accent: 'var(--color-accent)',
          hover: 'var(--color-accent-hover)',
          light: 'var(--color-accent-subtle)',
          border: 'var(--color-rule)',
          ink: 'var(--color-accent-ink)',
        },
        canvas: 'var(--color-paper)',
        surface: 'var(--color-paper-2)',
        line: {
          DEFAULT: 'var(--color-rule)',
          2: 'var(--color-rule-2)',
        },
        status: {
          success: 'var(--color-success)',
          'success-subtle': 'var(--color-success-subtle)',
          error: 'var(--color-error)',
          'error-subtle': 'var(--color-error-subtle)',
          warning: 'var(--color-warning)',
          'warning-subtle': 'var(--color-warning-subtle)',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
        sans: ['var(--font-body)', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        control: 'var(--radius-control)',
        card: 'var(--radius-card)',
        pill: 'var(--radius-pill)',
      },
      boxShadow: {
        sm: 'var(--shadow-sm)',
        card: 'var(--shadow-card)',
        'card-hover': 'var(--shadow-card-hover)',
        soft: 'var(--shadow-sm)',
        'soft-lg': 'var(--shadow-card)',
      },
      transitionTimingFunction: {
        out: 'var(--ease-out)',
        in: 'var(--ease-in)',
        'in-out': 'var(--ease-in-out)',
      },
      transitionDuration: {
        micro: 'var(--dur-micro)',
        short: 'var(--dur-short)',
        long: 'var(--dur-long)',
      },
    },
  },
  plugins: [],
}
