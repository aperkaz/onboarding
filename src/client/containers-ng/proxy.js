(function(scope) {
  if (scope['Proxy']) {
    return;
  }
  let lastRevokeFn = null;

  function isObject(o) {
    return o ? (typeof o === 'object' || typeof o === 'function') : false;
  }

  scope.Proxy = function(target, handler) {
    if (!isObject(target) || !isObject(handler)) {
      throw new TypeError('Cannot create proxy with a non-object as target or handler');
    }

    let throwRevoked = function() {};
    lastRevokeFn = function() {
      throwRevoked = function(trap) {
        throw new TypeError(`Cannot perform '${trap}' on a proxy that has been revoked`);
      };
    };


    const unsafeHandler = handler;
    handler = {'get': null, 'set': null, 'apply': null, 'construct': null};
    for (let k in unsafeHandler) {
      if (!(k in handler)) {
        throw new TypeError(`Proxy polyfill does not support trap '${k}'`);
      }
      handler[k] = unsafeHandler[k];
    }
    if (typeof unsafeHandler === 'function') {

      handler.apply = unsafeHandler.apply.bind(unsafeHandler);
    }


    let proxy = this;
    let isMethod = false;
    if (typeof target === 'function') {
      proxy = function Proxy() {
        const usingNew = (this && this.constructor === proxy);
        const args = Array.prototype.slice.call(arguments);
        throwRevoked(usingNew ? 'construct' : 'apply');

        if (usingNew && handler['construct']) {
          return handler['construct'].call(this, target, args);
        } else if (!usingNew && handler.apply) {
          return handler.apply(target, this, args);
        }


        if (usingNew) {

          args.unshift(target);

          const f = /** @type {!Function} */ (target.bind.apply(target, args));
          return new f();
        }
        return target.apply(this, args);
      };
      isMethod = true;
    }

    const getter = handler.get ? function(prop) {
      throwRevoked('get');
      return handler.get(this, prop, proxy);
    } : function(prop) {
      throwRevoked('get');
      return this[prop];
    };
    const setter = handler.set ? function(prop, value) {
      throwRevoked('set');
      const status = handler.set(this, prop, value, proxy);
      if (!status) {

      }
    } : function(prop, value) {
      throwRevoked('set');
      this[prop] = value;
    };

    const propertyNames = Object.getOwnPropertyNames(target);
    const propertyMap = {};
    propertyNames.forEach(function(prop) {
      if (isMethod && prop in proxy) {
        return;
      }
      const real = Object.getOwnPropertyDescriptor(target, prop);
      const desc = {
        enumerable: !!real.enumerable,
        get: getter.bind(target, prop),
        set: setter.bind(target, prop),
      };
      Object.defineProperty(proxy, prop, desc);
      propertyMap[prop] = true;
    });


    let prototypeOk = true;
    if (Object.setPrototypeOf) {
      Object.setPrototypeOf(proxy, Object.getPrototypeOf(target));
    } else if (proxy.__proto__) {
      proxy.__proto__ = target.__proto__;
    } else {
      prototypeOk = false;
    }
    if (handler.get || !prototypeOk) {
      for (let k in target) {
        if (propertyMap[k]) {
          continue;
        }
        Object.defineProperty(proxy, k, {get: getter.bind(target, k)});
      }
    }


    Object.seal(target);
    Object.seal(proxy);

    return proxy;
  };

  scope.Proxy.revocable = function(target, handler) {
    const p = new scope.Proxy(target, handler);
    return {'proxy': p, 'revoke': lastRevokeFn};
  };

  scope.Proxy['revocable'] = scope.Proxy.revocable;
  scope['Proxy'] = scope.Proxy;
})(typeof process !== 'undefined' && {}.toString.call(process) === '[object process]' ? global : self);
