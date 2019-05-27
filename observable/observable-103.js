
/**
 * Designing Observable
 * 
 * Having observables as a class/object enables us to easily apply a
 * SafeObserver to passed anonymous observers (and handler functions if you like
 * the `subscribe(fn, fn, fn)` signature in RxJS) and provide better ergonomics
 * for the developer-user. By handling the creation of a SafeObserver inside
 * Observable’s `subscribe` implementation, Observables can again be defined in
 * the simplest possible way.
 * 
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

class Observable {
  constructor(_subscribe) {
    this._subscribe = _subscribe;
  }
  
  subscribe(observer) {
    const safeObserver = new SafeObserver(observer);
    return this._subscribe(safeObserver);
  }
}

/**
 * our observable
 */
const myObservable = new Observable((observer) => {
  const safeObserver = new SafeObserver(observer);
  const datasource = new DataSource();
  datasource.ondata = (e) => safeObserver.next(e);
  datasource.onerror = (err) => safeObserver.error(err);
  datasource.oncomplete = () => safeObserver.complete();

  safeObserver.unsub = () => {
	console.info("Unsubscribing ...");
    datasource.destroy();
  };

  return safeObserver.unsubscribe.bind(safeObserver);
})


/**
 * now let's use it
 */
const unsub = myObservable.subscribe({
  next(x) { console.log("Next : " + x); },
  error(err) { console.error("Error : " + err); },
  complete() { console.log('Completed')}
});

/**
 * uncomment to try out unsubscription
 */
setTimeout(unsub, 5500);






























