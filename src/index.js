const { Wavelength } = require('./runtime');
const { Decay } = require('./runtime/middle-ware');
const { Container } = require('./runtime/ioc');
const { StructLog } = require('./logging');
const Metrics = require('./logging/inoculators/metrics');
const { patchConsole, bootstrap } = require('./logging/logger-shim');
const errors = require('./errors');
const awsUtils = require('./utils/aws-object-utils');
const { Retry } = require('./utils/retrying');
const pii = require('./utils/pii');
const contrib = require('./contrib');

module.exports = {
  awsUtils,
  patchConsole,
  bootstrapHandlerLogging: bootstrap,
  errors,
  Decay,
  StructLog,
  Metrics,
  Wavelength,
  Container,
  Retry,
  pii,
  contrib,
};
