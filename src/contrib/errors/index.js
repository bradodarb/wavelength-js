const {
  Base4xxException,
  Base5xxException,
  Base401Exception,
  Base403Exception,
  Base404Exception,
  Base409Exception,
  Base415Exception,
  Base422Exception,
  Base424Exception,
  Base429Exception,
  BaseHttpException,
} = require('./aws-apig/index');


module.exports = {
  awsAPIG: {
    Base4xxException,
    Base5xxException,
    Base401Exception,
    Base403Exception,
    Base404Exception,
    Base409Exception,
    Base415Exception,
    Base422Exception,
    Base424Exception,
    Base429Exception,
    BaseHttpException,
  },
};
