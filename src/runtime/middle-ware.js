/** @module middle-ware */
/* eslint-disable no-await-in-loop */
/**
 * @class
 * Synchronous middleware executor
 * executes all registered middleware int the order they were added
 */
class Decay {
  /**
   * Ctor for middleware execution class
   * @param terminalFunction {function} Final function to execute after
   * all middleware has been successfully executed
   */
  constructor(terminalFunction) {
    this.complete = terminalFunction;
    this.wares = [];
  }

  /**
   * Express style middleware registration
   * @param ware
   * @returns {Decay} (Fluent function)
   */
  use(ware) {
    let wares = [];
    if (Array.isArray(ware)) {
      wares = ware;
    } else {
      wares.push(ware);
    }

    wares.forEach((wareFunc) => {
      const previousWare = this.wares[this.wares.length - 1];
      const currentWare = {
        invoke: wareFunc,
        next: null,
      };
      if (previousWare) {
        previousWare.next = currentWare;
      }
      this.wares.push(currentWare);
    });

    return this;
  }

  /**
   * Invoke the middleware, short circuits if the middleware returns a value
   * @param context  {HandlerState}
   * @returns {Promise<void>}
   */
  async invoke(context) {
    if (!this.wares.length) {
      this.complete(null, context);
    }

    let ware = this.wares[0];
    while (ware) {
      const error = await ware.invoke(context);
      if (error) {
        this.complete(error, context);
        return;
      }
      ware = ware.next;
    }
    this.complete(null, context);
  }
}
module.exports = { Decay };
