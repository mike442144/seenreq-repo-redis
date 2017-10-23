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

	options = Object.assign({},defaultOptions, options);
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

/*
    @param opt(array of object) 
        {
            sign: "GET http://www.baidu.com/\r\n",
            update: true
        }
    @return rst(array of boolean), each element denotes the existence of corresponding object in opt
 */
// RedisRepo.prototype.exists = function(opt, callback) {
//     var req = opt,
//         slots = {},
//         uniq = [],
//         keysToInsert = {};

//     var rst = new Array(req.length);

//     for (var i = 0; i < req.length; i++) {
//         var key = this.transformKey(req[i].sign);
//         if (key in slots) {
//             rst[i] = true;
//         } else {
//             rst[i] = false;
//             slots[key] = i;
//             if (req[i].update === true) {
//                 keysToInsert[key] = null;
//             }
//             uniq.push(key);
//         }
//     }

//     this.getByKeys(uniq, (err, result) => {
//         if (err)
//             return callback(err);

//         for (var j = 0; j < uniq.length; j++) {
//             if (result[j] == '1') {
//                 rst[slots[uniq[j]]] = true;
//                 delete keysToInsert[uniq[j]];
//             } else {
//                 rst[slots[uniq[j]]] = false;
//             }
//         }

        
// 	this.setByKeys(keysToInsert, (err) => {
//             if (err)
//                 return callback(err);

//             callback(null, rst);
//         });
//     });
// }

module.exports = RedisRepo;
