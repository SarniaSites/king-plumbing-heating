/** @type {import('tailwindcss').Config} */
// Every colour is sampled from something real in the King Plumbing & Heating pack.
module.exports = {
  content: ['./*.html', './assets/js/**/*.js'],
  theme: {
    extend: {
      colors: {
        // ink: text. The logo's graphite ground (#47484a) taken darker so body copy passes AA comfortably.
        ink: { DEFAULT: '#25262A', soft: '#45474C', muted: '#5A5C62' },
        // support: the logo's graphite ground (#47484a) for the low-rate band, contact and footer.
        support: { DEFAULT: '#47484A', 700: '#393A3D', 800: '#2E2F32', 900: '#232427' },
        // surface: the silver of the logo roundel (#bfc2c9), tinted down for grounds. Never pure white.
        surface: { DEFAULT: '#EEEFF1', card: '#F7F7F8', 200: '#DCDEE2', 300: '#BFC2C9', 400: '#A4A6AA' },
        // action: the yellow low-rate sticker on the meter (post 2, img-004). Reserved for Call / Quote / links. Dark text on it.
        action: { DEFAULT: '#F2D23C', light: '#F7E27C', dark: '#DDBA1C' },
        // highlight: the copper pipework in the cylinder installs (img-003). Hot water, the dial hand, illustration accents.
        heat: { DEFAULT: '#B5653A', light: '#D58E5F', dark: '#8C4823' },
        // accent: cold water in the cylinder drawing, a cool grey-blue sitting between the silver and graphite.
        cold: { DEFAULT: '#8FA3B3', light: '#C9D4DD' },
      },
      fontFamily: {
        // Besley: a Clarendon revival (1845), Victorian plumbing-merchant lettering; echoes the serif KING in the logo.
        display: ['"Besley Variable"', 'Georgia', 'serif'],
        sans: ['"Albert Sans Variable"', 'system-ui', '-apple-system', '"Segoe UI"', 'sans-serif'],
        // Sometype Mono: used only for clock times and the sticker labels.
        mono: ['"Sometype Mono Variable"', 'ui-monospace', 'monospace'],
      },
      maxWidth: { site: '80rem' },
    },
  },
  plugins: [],
};
