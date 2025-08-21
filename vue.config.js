const ip = require('ip');

module.exports = {
  devServer: {
    host: ip.address(), 
    port: 8080,
    public: ip.address() + ':8080', 
    disableHostCheck: true, 
  }
};
