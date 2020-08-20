const fs = require('fs');
const path = require('path');

const { parse } = require('dotenv');

function config(options = {}) {
  let dotenvPath = path.resolve(process.cwd(), '.env');
  let encoding /* : string */ = 'utf8';
  let debug = false;

  if (options) {
    if (options.path != null) {
      dotenvPath = options.path;
    }
    if (options.encoding != null) {
      ({ encoding } = options);
    }
    if (options.debug != null) {
      debug = true;
    }
  }

  try {
    // specifying an encoding returns a string instead of a buffer
    const parsed = parse(fs.readFileSync(dotenvPath, { encoding }), { debug });

    Object.keys(parsed).forEach((key) => {
      process.env[key] = parsed[key];
    });

    return { parsed };
  } catch (e) {
    return { error: e };
  }
}
function localEnv() {
  let envVars = {};
  try {
    envVars = config();
    const overrides = path.resolve(process.cwd(), 'debug.env');
    if (fs.existsSync(overrides)) {
      envVars = Object.assign({}, envVars, config({ path: overrides }));
    }
  } catch (err) {
    console.log(err);
  }
  return envVars;
}

module.exports = { config, envVars: localEnv() };
