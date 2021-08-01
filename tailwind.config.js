module.exports = {
  mode: 'jit',
  purge: ['./resources/views/**/*.edge', './resources/assets/ts/**/*.ts'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    colors: {
      body: {
        DEFAULT: '#FAFAFA',
      },
      transparent: 'transparent',
      current: 'currentColor',
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
