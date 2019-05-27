
/**
 * Safe Observers
 * 
 * You can subscribe to the observable now with any Plain-Old JavaScript Object
 * (POJO) that has `next`, `error` and `complete` methods on it, but the POJO
 * observer that you’ve used to subscribe to the observable is really just the
 * beginning. In RxJS 5, we need to provide some guarantees for you. Below are
 * just a few of the more important guarantees:
 * 
 * Observer Guarantees
 * 
 * <pre>
 * 1. If you pass an Observer doesn’t have all of the methods implemented, that’s okay. 
 * 2. You don’t want to call `next` after a `complete` or an `error` 
 * 3. You don’t want anything called if you’ve unsubscribed. 
 * 4. Calls to `complete` and `error` need to call unsubscription logic. 
 * 5. If your `next`, `complete` or `error` handler throws an exception, you want to call your
 * 	  unsubscription logic so you don’t leak resources. 
 * 6. `next`, `error` and `complete` are all actually optional. You don’t have to handle every value,
 * 	  or errors or completions. You might just want to handle one or two of those
 * 	  things.
 * </pre>
 * 
 * 
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
    this.isUnsubscribed = false;
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
 * our observable
 */
function myObservable(observer) {
  const safeObserver = new SafeObserver(observer);
  const datasource = new DataSource();
  datasource.ondata = (e) => safeObserver.next(e);
  datasource.onerror = (err) => safeObserver.error(err);
  datasource.oncomplete = () => safeObserver.complete();

  safeObserver.unsub = () => {
	console.info("unsubscribing ...");
    datasource.destroy();
  };

  return safeObserver.unsubscribe.bind(safeObserver);
}

/**
 * now let's use it
 */
const unsub = myObservable({
  next(data) { console.log("Receiving data: " + data); },
  error(err) { console.error(err); },
  complete() { console.log('completed')}
});

/**
 * uncomment to try out unsubscription
 */
setTimeout(unsub, 5500);


































