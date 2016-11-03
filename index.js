module.exports = new function() {

	var locks = {};

	var expiration = 10000;

	var create = function(key) {

		if(undefined === locks[key]) {
			
			locks[key] = {

				key 		: key,
				releases	: [],
				callbacks	: [],
				info 		: {start : new Date()}
			}
		}
	}

	this.write = function(key, release) {
		
		if(typeof(release) === 'function') {

			create(key);

			locks[key].releases.push({release : release});

			var amount = locks[key].releases.length;

			return release(function() {

				if(locks[key]) {

					if(locks[key].releases.length <= 1) {

						var params = [];

						for(var i in arguments) {
							params.push(arguments[i]);
						}

						locks[key].info.end 	 = new Date();
						locks[key].info.duration = locks[key].info.end.getTime() - locks[key].info.start.getTime();

						for(var a in locks[key].callbacks) {

							if(undefined !== locks[key].callbacks[a]) {
								locks[key].callbacks[a].apply(this, params.concat([locks[key].info]));
							}
						}

						return delete locks[key];
					}

					locks[key].releases.shift();
				}
			});
		}

		throw 'Callback is not a function in Write method';
	}

	this.read = function(key, callback, time) {

		if(typeof(callback) === 'function') { 

			create(key);

			locks[key].callbacks.push(callback);

			var index = locks[key].callbacks.length - 1;
			var time  = parseInt(time) >= 0 ? parseInt(time) : expiration;

			if(time === 0) {
				return;
			}

			return setTimeout(function() {
				
				if(locks[key] && undefined !== locks[key].callbacks[index]) {
					
					locks[key].callbacks[index] = undefined;

					for(var i in locks[key].callbacks) {
					
						if(locks[key].callbacks[i] !== undefined) {
							return;
						}
					}

					delete locks[key];

				}

			}, time);
		}

		throw 'Callback is not a function in Read method';
	}
}