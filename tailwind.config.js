const idDev = process.env.npm_lifecycle_event === 'dev'
module.exports = {
  mode: !idDev ? 'jit' : null,
  purge: ['./resources/views/**/*.edge', './resources/assets/ts/**/*.ts'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    colors: {
      body: {
        DEFAULT: '#FAFAFA',
      },
      transparent: 'transparent',
      current: 'currentColor',
      black: '#000000',
      white: {
        DEFAULT: '#FFFFFF',
      },
      gray: {
        DEFAULT: '#E0E0E0',
      },
      secondary: {
        DEFAULT: '#5B59E0',
      },
      danger: {
        DEFAULT: '#E3342F',
      },
    },
    extend: {},
  },
  variants: {
    extend: {},
  },
  plugins: [],
}
