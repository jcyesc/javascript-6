/**
 * Map Operator
 * 
 * An “operator” in RxJS is little more than a function that takes a source
 * observable, and returns a new observable that will subscribe to that source
 * observable when you subscribe to it. We can implement a basic, standalone
 * operator like this:
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
    console.info("DataSource.destroy()");
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
    if (!this.isUnsubscribed && this.unsub) {
      console.info("Unsubscribing ... " + this.sourceObserver.name);
      this.unsub();
    }
    this.isUnsubscribed = true;
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

/** map operator */
function map(sourceObservable, mapperFunction) {
  return new Observable((observer) => {
    const mapObserver = {
      next: (x) => observer.next(mapperFunction(x)),
      error: (err) => observer.error(err),
      complete: () => observer.complete(),
      name: "map observer"
    };
    return sourceObservable.subscribe(mapObserver);
  });
}

/** Implementation of observable */
const myObservable = new Observable((observer) => {
  const datasource = new DataSource();
  datasource.ondata = (e) => observer.next(e);
  datasource.onerror = (err) => observer.error(err);
  datasource.oncomplete = () => observer.complete();
  
  return () => {
	  datasource.destroy();
  }
});


/** now let's use it */
const unsub = map(myObservable, (x) => x + x).subscribe({
  next(x) { console.log("Next : " + x); },
  error(err) { console.error("Error : " + err); },
  complete() { console.log('Completed')},
  name: "print observer"
});

/** uncomment to try out unsubscription */
setTimeout(unsub, 5500);



