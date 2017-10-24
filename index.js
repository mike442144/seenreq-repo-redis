
'use strict'

const Repo = require("seenreq/repo")
, Redis = require('ioredis')

class RedisRepo extends Repo{
    constructor(options) {
	super(options);
	
	let defaultOptions = {
            port: 6379, // Redis port
            host: '127.0.0.1', // Redis host
            family: 4, // 4 (IPv4) or 6 (IPv6)
            password: ''
	}

	this.options = options = Object.assign({},defaultOptions, options);
	this.redis = new Redis(options);
	this.appName = options.appName || 'seenreq';
	this.clearOnQuit = options.clearOnQuit !== false;
    }
    
    /* 
     * 
     * @return Array represent if hit. e.g. [1,1,0,0,1,0]
     */
    getByKeys(keys, callback) {
	return this.redis.hmget(this.appName, keys, callback);
    }

    setByKeys(keys, callback) {
	let keysToInsert = keys.reduce(function(total, key) {
            total.push(key, 1);
            return total;
	}, []);

	if (keysToInsert.length === 0) {
	    return callback();
	}
	
	return this.redis.hmset(this.appName, keysToInsert, callback);
    }
        
    dispose() {
	if (this.clearOnQuit) {
            this.redis.del(this.appName, err => {
		if (err)
                    throw err;

		this.redis.quit();
            })
	} else {
            this.redis.quit();
	}
    }
}

module.exports = RedisRepo;
