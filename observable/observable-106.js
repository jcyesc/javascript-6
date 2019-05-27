/**
 * Map Operator as part of Prototype
 * 
 * Fortunately, we already have an Observable class onto which we can put our operators 
 * to support this sort of chaining behavior. It doesn’t add any complexity to the 
 * operator implementation, but it does come at the cost of “junking up the prototype” 
 * I suppose, once you add enough operators, of which there are many — perhaps too many. 
 * Here is what our map operator looks like when added to our Observable 
 * implementation’s prototype
 */

/**
 * A contrived data source to use in our "observable" NOTE: this will clearly
 * never error
 */
class DataSource {
  constructor() {
    let i = 0;
    this._id = setInterval(() => this.emit(i++), 200);
  }
  
  emit(n) {
    const limit = 10;
    if (this.ondata) {
      this.ondata(n);
    }
    if (n === limit) {
      if (this.oncomplete) {
        this.oncomplete();
      }
      this.destroy();
    }
  }
  
  destroy() {
    clearInterval(this._id);
  }
}

/**
 * Safe Observer
 */
class SafeObserver {
  constructor(destination) {
    this.destination = destination;
  }
  
  next(value) {
    // only try to next if you're subscribed have a handler
    if (!this.isUnsubscribed && this.destination.next) {
      try {
        this.destination.next(value);
      } catch (err) {
        // if the provided handler errors, teardown resources, then throw
        this.unsubscribe();
        throw err;
      }
    }
  }
  
  error(err) {
    // only try to emit error if you're subscribed and have a handler
    if (!this.isUnsubscribed && this.destination.error) {
      try {
        this.destination.error(err);
      } catch (e2) {
        // if the provided handler errors, teardown resources, then throw
        this.unsubscribe();
        throw e2;
      }
      this.unsubscribe();
    }
  }

  complete() {
    // only try to emit completion if you're subscribed and have a handler
    if (!this.isUnsubscribed && this.destination.complete) {
      try {
        this.destination.complete();
      } catch (err) {
        // if the provided handler errors, teardown resources, then throw
        this.unsubscribe();
        throw err;
      }
      this.unsubscribe();
    }
  }
  
  unsubscribe() {
    this.isUnsubscribed = true;
    if (this.unsub) {
      this.unsub();
    }
  }
}

/**
 * Observable basic implementation
 */
class Observable {
  constructor(_subscribe) {
    this._subscribe = _subscribe;
  }
  
  subscribe(observer) {
    const safeObserver = new SafeObserver(observer);
    safeObserver.unsub = this._subscribe(safeObserver);
    return safeObserver.unsubscribe.bind(safeObserver);
  }
}

Observable.prototype.map = function (mapperFunction) {
  return new Observable((observer) => {
    const mapObserver = {
      next: (x) => observer.next(mapperFunction(x)),
      error: (err) => observer.error(err),
      complete: () => observer.complete()
    };
    return this.subscribe(mapObserver);
  });
}

/** our observable */
const myObservable = new Observable((observer) => {
  const datasource = new DataSource();
  datasource.ondata = (e) => observer.next(e);
  datasource.onerror = (err) => observer.error(err);
  datasource.oncomplete = () => observer.complete();
  
  return () => datasource.destroy();
});


/** now let's use it */
const unsub = myObservable.map(x => x + x).map(x => x + '!').subscribe({
  next(x) { console.log(x); },
  error(err) { console.error(err); },
  complete() { console.log('done')}
});

/**
 * uncomment to try out unsubscription
 */
setTimeout(unsub, 5500);

