
# Introduction to Observables


## Observables are a function that take an observer and return a function

Keep in mind, after reading everything above, that all of this was designed around a 
simple function. Observables are a function that take an observer and return a function. 
Nothing more, nothing less. If you write a function that takes an observer and returns 
a function, is it async or sync? Neither. It’s a function. The behavior of any function
all depends on how it’s implemented. So when dealing with an Observable, treat it like
a function reference you’re passing around, not some magic, stateful alien type. 
When you’re building your operator chains, what you’re really doing is composing 
a function that sets up a chain of observers that are linked together and pass values 
through to your observer.


## Summary

This directory contains the basic building blocks of Observables. The topics describe
in each file are:


1. Observable 101 - Basic implementation
2. Observable 102 - Safe Observable
3. Observable 103 - Designing the Observable class
4. Observable 104 - Map Operator
5. Observable 105 - Pipe Operator
6. Observable 106 - Map Operator as part of Prototype



## References

[Observables](https://medium.com/@benlesh/learning-observable-by-building-observable-d5da57405d87)