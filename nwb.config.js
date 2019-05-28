module.exports = {
  babel: {
    plugins: ['transform-react-remove-prop-types'],
  },
  devServer: {
    port: 3001,
  },
  npm: {
    esModules: true,
    umd: {
      externals: {
        react: 'React',
      },
      global: 'OncojsBoxPlot',
    },
  },
  type: 'react-component',
};
