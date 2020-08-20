class Container {
  constructor() {
    this.resources = {};
  }

  register(name, resolver) {
    Object.defineProperty(this, name, {
      get: () => {
        this.resources[name] = resolver(this);

        return this.resources[name];
      },
      configurable: true,
      enumerable: true,
    });

    return this;
  }
}


module.exports = { Container };
