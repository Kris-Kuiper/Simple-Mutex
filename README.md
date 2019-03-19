# Simple-Mutex
Simple mutex is a small library that will help you to lock and wrap custom code like functions and variables. It will cycle between reads and writes, allowing all writes to return in order while queuing all reads. When all writes are complete, all the reads will be executed.
This will give you a single threaded nature to your advantage.


## Usage
##### Installation
```bash
$ npm install simple-mutex
```
##### Require
To use Simpel-Mutex you can simply require the module as follows:
```javascript
var Lock = require('simple-mutex');
```

## Using a lock
Parameter one of the "write" function will be a unique key name that you can use to read. Parameter two is a callback function witch contains your custom code. When your custom code execution is completed, you can release the lock for the reads to execute their own code **(see example 1 for more details)**.
```javascript
Lock.write('keyname', function(release) {

	//Custom code goes here
	
	//Release the lock
	release();
});
```
##### Passing arguments to the read
if you want to give your read callback function more information about variables inside your write callback, then you can inject your variables inside the release parameters **(see example 3 for more details)**.
```javascript
Lock.write('keyname', function(release) {

	var foo = 1;
	
	//Release the lock and pass foo to the read callback
	release(foo);
});
```

## Using a read
A read will wait for **all write functions** to complete until it will be executed. The first parameter will be the same key name as the key name given to the write. The second parameter will be your custom callback function that will be executed when the write is completed **(see example 1 for more details)**.
```javascript
Lock.read('keyname', function() {
	//Custom code
});
```

Your custom callback function will always be injected with an "info" variable **as last argument** (you can pass more custom arguments). This variable will give you information about the start time of the first read or write, the end time of the executions of all the reads and a total duration in milliseconds.
```javascript
Lock.read('keyname', function(info) {

	console.log(info);
	
	/* Will output something similar to:
	{ start: Date Object,
      end: Date Object,
      duration: 2002 }	*/
});
```


##### Using a read with an expiration date
If you set a duration in milliseconds for the third parameter of the "read" function, the read callback will not be executed if the write callback will not complete in time or the write callback is not created at all (see example 2 for more details).
```javascript
Lock.read('keyname', function() {
	console.log(a);
}, 1000);
```
###### *important note*
* If there is no release within a write callback then a read will **by default wait 10 seconds** before it deletes itself and will therefore not be executed.
* If you want to disable this, you can pass a duration of 0 milliseconds (no limit).

## Examples
##### Example 1; simple
In this example, the read callback is going to wait 1 second for the write te complete.
```javascript
var a = 1;

Lock.write('keyname', function(release) {
    
    //Define new value for variable a
	a = 2;
	
	//Let the read function wait for 1 sec.
	setTimeout(function() {
	    release();
	}, 1000);
});

Lock.read('keyname', function() {
	console.log(a); //output is 2
});
```

##### Example 2; using a expiration time
In this example, the read will expire after 1 second because the write is created after 2 seconds. Therefore, the read callback will never be executed
```javascript
var a = 1;

Lock.read('keyname', function() {
	console.log(a);
}, 1000);

setTimeout(function() {

    Lock.write('keyname', function(release) {
        
        //Define new value for variable a
    	a = 2;
    	
    	release();
    });
}, 2000);
```

##### Example 3; passing arguments to the read
In this example, the release callback in the write function will pass arguments for the read callback to use.
```javascript
var a = 1;

Lock.write('keyname', function(release) {
    
    a = 2;
	var foo = '3';
	var bar = '4';
	
	release(foo, bar);
});

Lock.read('keyname', function(attempts, foo, bar) {
	console.log(a, foo, bar); //Will output: 2, 3, 4
});
