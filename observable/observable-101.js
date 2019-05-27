
/**
 * Observable
 * 
 * Shape:
 * 
 *  - A function
 * 	- That accepts an observer: An object with `next`, `error` and `complete` methods on it.
 *  - And returns a cancellation function
 *  
 *  Purpose:
 * 
 *  - To connect the observer to something that produces values (a producer), and return 
 *  a means to tear down that connection to the producer. The observer is really a 
 *  registry of handlers that can be pushed values over time.
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

function myObservable(observer) {
	const dataSource = new DataSource();
	dataSource.ondata = (data) => observer.next(data);
	dataSource.onerror = (err) => observer.error(err);
	dataSource.oncomplete = () => observer.complete();
	
	return () => {
		dataSource.destroy();
	};
}

const unsub = myObservable({
	next(data) { console.log(data); },
	error(err) { console.err(err); },
	complete() { console.log('done'); }
});












































