module.exports = {
  purge: ['./src/**/*.tsx'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      spacing: {
        70: '18rem',
      },
      container: {
        center: true
      }
    },
  },
  variants: {
    extend: {},
  },
  plugins: [
    function ({ addComponents }){
      addComponents({
        '.container' : {
          width: '100%',
          marginLeft: 'auto',
          marginRight: 'auto',
          '@screen sm' : {maxWidth: '640px'},
          '@screen md' : {maxWidth: '768px'},
          '@screen lg' : {maxWidth: '976px'},
        }
      })
    }
  ],
}
