/**
 * Pipe Operator
 * 
 * You could go with a simple "pipe" implementation that reduces over an array of 
 * these operators to produce your final observable, but that’s going to mean 
 * writing more complicated operators that return functions.
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
  constructor(sourceObserver) {
    this.sourceObserver = sourceObserver;
  }
  
  next(value) {
    // only try to next if you're subscribed have a handler
    if (!this.isUnsubscribed && this.sourceObserver.next) {
      try {
        this.sourceObserver.next(value);
      } catch (err) {
        // if the provided handler errors, teardown resources, then throw
        this.unsubscribe();
        throw err;
      }
    }
  }
  
  error(err) {
    // only try to emit error if you're subscribed and have a handler
    if (!this.isUnsubscribed && this.sourceObserver.error) {
      try {
        this.sourceObserver.error(err);
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
    if (!this.isUnsubscribed && this.sourceObserver.complete) {
      try {
        this.sourceObserver.complete();
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

/**
 * more complicated map operator
 */
function map(project) {
  return (source) => new Observable((observer) => {
    const mapObserver = {
      next: (x) => observer.next(project(x)),
      error: (err) => observer.error(err),
      complete: () => observer.complete()
    };
    return source.subscribe(mapObserver);
  });
}

/**
 * pipe helper
 */
function pipe(initialValue, ...fns) {
  return fns.reduce((state, fn) => fn(state), initialValue);
}

/**
 * our observable
 */
const myObservable = new Observable((observer) => {
  const datasource = new DataSource();
  datasource.ondata = (e) => observer.next(e);
  datasource.onerror = (err) => observer.error(err);
  datasource.oncomplete = () => observer.complete();
  
  return () => datasource.destroy();
});


/**
 * now let's use it
 */
const unsub = pipe(myObservable, map(x => x + x), map(x => x + '!')).subscribe({
  next(x) { console.log(x); },
  error(err) { console.error(err); },
  complete() { console.log('done')}
});

/**
 * uncomment to try out unsubscription
 */
setTimeout(unsub, 5500);

