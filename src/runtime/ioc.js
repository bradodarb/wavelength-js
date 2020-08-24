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
  roster(resolvers) {
    resolvers.keys().forEach((key) => {
      this.register(key, resolvers[key]);
    });
    return this;
  }
}

export { Container };
