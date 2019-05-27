console.info("testing ....");

/*
	---------
	Promises
	---------
	Starting with ECMAScript2015, JavaScript gains support for Promise objects allowing you
	to control the flow of deferred and asynchronous operations.
	      
	A Promise is in one of these states:
	
	- pending: initial state, neither fulfilled nor rejected.
	- fulfilled: meaning that the operation completed successfully.
	- rejected: meaning that the operation failed.
	
	A pending promise can either be fulfilled with a value, or rejected with a 
	reason (error). When either of these options happens, the associated handlers
	queued up by a promise's then method are called. (If the promise has already been 
	fulfilled or rejected when a corresponding handler is attached, the handler will 
	be called, so there is no race condition between an asynchronous operation 
	completing and its handlers being attached.)
*/

/*
   This class contains a basic implementation of the Promise mechanism and gives
    the reader and idea about how promises are implemented.
 */
class MyPromise {
	/**
	 * @param {function(function(string),
	 *            function(string))}
	 */
    constructor(resolveAndRejectFunction) {    
    	// TODO Use a enum for the tree states.
    	/** Indicates if this promise was already resolved or rejected. */
        this.isResolvedOrRejected_ = false;
        
        /** Indicates if the promise was already fulfilled. */
        this.isFulfilled_ = false;
        
        /** Indicates if the promise was already rejected. */
        this.isRejected_ = false;
        
        /**
		 * List of functions and promises that are waiting to be resolved.
		 * 
		 * @type {Array.<{res: function(string), promise: MyPromise}>}
		 */
        this.resolvedFunctionsAndPromises = [];
        
        /**
		 * List of functions and promises that will be called if the promise was
		 * rejected.
		 * 
		 * @type {Array.<{res: function(string), promise: MyPromise}>}
		 */
        this.rejectedFunctionsAndPromises = [];

        /** The response that received by the promise. */
        this.theResponse_ = null;
        
        /** The response that received by the promise. */        
        this.theErrorResponse_ = null;

        /**
		 * Executing the asynchronous called and binding the resolveCallback_
		 * and rejectCallback_ functions.
		 */
        resolveAndRejectFunction(
        		this.resolveCallback_.bind(this), 
        		this.rejectCallback_.bind(this));
    }
    
    /**
	 * This function will be called when the promise has been resolved. The main
	 * tasks of this function are:
	 * 
	 * <ol>
	 * <li>Set the status to fulfilled</li>
	 * <li>Store the response of this promise</li>
	 * <li>Notify all the "resolve" functions in {@link resolvedFunctionsAndPromises}.</li>
	 * </ol>
	 * 
	 */
    resolveCallback_(response) {
        this.theResponse_ = response;
        this.isResolvedOrRejected_ = true;
        this.isFulfilled_ = true;
        
        for (let resolveFunctionAndPromise of this.resolvedFunctionsAndPromises) {
        	let resultPromise = resolveFunctionAndPromise.res(this.theResponse_);
        	let deferredPromise = resolveFunctionAndPromise.deferredPromise;
        	
        	this.resolveOrRejectDeferredPromises_(resultPromise, deferredPromise);
        }
    }
    
    /**
	 * This function will be called when the promise has been rejected. The main
	 * tasks of this function are:
	 * 
	 * <ol>
	 * <li>Set the status to rejected</li>
	 * <li>Store the error response of this promise</li>
	 * <li>Notify all the "reject" functions in {@link rejectedFunctionsAndPromises}.</li>
	 * </ol>
	 * 
	 */
    rejectCallback_(errorResponse) {
        this.theErrorResponse_ = errorResponse;
        this.isResolvedOrRejected_ = true;
        this.isRejected_ = true;

        for (let rejectedFunctionAndPromise of this.rejectedFunctionsAndPromises) {
        	let resultPromise = rejectedFunctionAndPromise.rej(this.theErrorResponse_);
        	let deferredPromise = rejectedFunctionAndPromise.deferredPromise;
        	
        	this.resolveOrRejectDeferredPromises_(resultPromise, deferredPromise);
        }
    }
    
    
    /**
     * This is a helper class that will perform the following tasks:
     * 
     * <ol>
     * <li>If resultPromise has been resolved or rejected, resolve or reject the deferredPromise.</li>
     * <li>
     * 		If resultPromise hasn't been resolved or rejected, add the new callback functions
     * 		for resultPromise, so the deferredPromise is rejected or resolved.
     * </li>
     * <li></li>
     * </ol>
     * 
     * @param resultPromise When the "this" promise is resolved, it might return another
     * 		promise, which is "resultPromise".
     * @param deferredPromise When "then" is called and the "this" promise hasn't been
     * 		resolved, "deferredPromise" is the promise that is returned and it will
     *      contain the "resolve" and "reject" functions that the client might attach.
     */
    resolveOrRejectDeferredPromises_(resultPromise, deferredPromise) {
    	if (resultPromise && deferredPromise) {
    		// Resolve the promise
    		if (resultPromise.isResolvedOrRejected_) {
        			if (resultPromise.isFulfilled_) {
    					deferredPromise.resolveCallback_(resultPromise.theResponse_);
    				} else {
    					deferredPromise.rejectCallback_(resultPromise.theErrorResponse_);
    				}
    		} else {
    			// Push the resolve function in the queue.
    			resultPromise.resolvedFunctionsAndPromises.push({
    		    	res: (response) => {
    		    		deferredPromise.resolveCallback_(response);
    		    	}
    		    });	
    			
    			resultPromise.rejectedFunctionsAndPromises.push({
    		    	rej: (response) => {
    		    		deferredPromise.rejectCallback_(response);
    		    	}
    		    });	
    		}
    	}
    }
    
    /**
	 * Returns a MyPromise object.
	 * 
	 * @param resolve
	 *            Function to be called when the promise is resolved.
	 * @param reject
	 *            Function to be called when the promise is rejected.
	 */
    then(resolve, reject) {
        if (this.isResolvedOrRejected_) {
        	if (this.isFulfilled_) {
        		return resolve(this.theResponse_);
        	} else {
        		return reject(this.theErrorResponse_);
        	}
        } else {
        	let deferred = new MyPromise((resolve, reject) => {		
        		// Do nothing
        	});
        	
        	// The promise hasn't been resolved so we store the {@link resolve}
			// and
        	// {@link reject} functions in the list.
		    this.resolvedFunctionsAndPromises.push({
		    	res: resolve,
		    	deferredPromise: deferred,
		    });
		    
		    this.rejectedFunctionsAndPromises.push({
		    	rej: reject,
		    	deferredPromise: deferred,
		    });
		    
		  // Promise that will be resolved or rejected when "this" promise is
			// resolved.
          return deferred;
        }
    }
    
    /* Resolves the function immediately with "value". */
    static resolve(value) {
    	let resolvePromise = new MyPromise((resolveFunc, rejectFunc) => {
    		resolveFunc(value);
    	});
    	
    	return resolvePromise;
    }
    
    /* Rejects the function immediately with "value". */
    static reject(value) {
    	let resolvePromise = new MyPromise((resolveFunc, rejectFunc) => {
    		rejectFunc(value);
    	});
    	
    	return resolvePromise;
    }
}

