module.exports = {
  "transpileDependencies": [
    "vuetify"
  ],
  
  devServer: { 
    proxy: 'http://localhost:8080/'
  },

  publicPath: process.env.VUE_APP_BASE_ROUTE || '/' 
};


 