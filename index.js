
'use strict';

const Repo = require('seenreq/repo');
const Redis = require('ioredis');

class RedisRepo extends Repo{
	constructor(options) {
		super(options);
		
		const defaultOptions = {
			port: 6379, // Redis port
			host: '127.0.0.1', // Redis host
			family: 4, // 4 (IPv4) or 6 (IPv6)
			password: ''
		};

		this.options = options = Object.assign({},defaultOptions, options);
		this.redis = new Redis(options);
		this.appName = options.appName || 'seenreq';
		this.clearOnQuit = options.clearOnQuit !== false;
	}
	
	/* 
	 * 
	 * @return Array represent if hit. e.g. [1,1,0,0,1,0]
	 */
	getByKeys(keys) {
		return this.redis.hmget(this.appName, keys);
	}

	setByKeys(keys) {
		const keysToInsert = keys.reduce( (total, key) => {
			total.push(key, 1);
			return total;
		}, []);

		if (keysToInsert.length === 0) {
			return Promise.resolve();
		}
		
		return this.redis.hmset(this.appName, keysToInsert);
	}
	
	dispose() {
		if (this.clearOnQuit) {
			return this.redis.del(this.appName).then(() => this.redis.quit() );
		} else {
			this.redis.quit();
			return Promise.resolve();
		}
	}
}

module.exports = RedisRepo;
