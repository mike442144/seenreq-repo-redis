'use strict';
const expect = require('chai').expect;
const rewire = require('rewire');
const sinon = require('sinon');
const RedisRepo = rewire('../index.js');

describe('redis repo testing', ()=>{
	let callback;
	let redisRepo;
	before(()=>{
		RedisRepo.__set__('Redis', function(options){
			return {
				options: options,
				hmget: function(arg1, arg2, callback){
					process.nextTick(callback, arg1, arg2);
					return 'get method called';
				},
				hmset: function(arg1, arg2, callback){
					process.nextTick(callback, arg1, arg2);
					return 'set method called';
				},
				quit: function(){
					process.nextTick(callback);
					return 'quit method called';
				},
				del: function(arg){
					if(typeof arg !== 'string'){
						return 'invalid argument';
					}
					this.quit();
				}
			};
		});
	});

	beforeEach(()=>{
		callback = sinon.spy();
		redisRepo = new RedisRepo();
	});

	describe('constructor()', ()=>{
		it('should create a redis repo without args', ()=>{
			// // constructor without args
			expect(redisRepo.options).to.eql({
				port: 6379,
				host: '127.0.0.1', 
				family: 4, 
				password: ''
			});
			expect(redisRepo.redis.options).to.eql(redisRepo.options);
			expect(redisRepo.appName).to.eql('seenreq');
			expect(redisRepo.clearOnQuit).to.be.true;
		});

		it('should create a redis repo with args', ()=>{
			// constructor with args
			redisRepo = new RedisRepo({
				port: 6379,
				host: '127.0.0.2', 
				appName: 'myRedisRepo',
				clearOnQuit: true
			});
			expect(redisRepo.options).to.eql({
				port: 6379,
				host: '127.0.0.2', 
				family: 4, 
				password: '',
				appName: 'myRedisRepo',
				clearOnQuit: true
			});
			expect(redisRepo.redis.options).to.eql(redisRepo.options);
			// redisRepo.redis.on('error', ()=>{
			// console.log('redis connect error, check your redis host and port');
			// process.exit(1);
			// });
			expect(redisRepo.appName).to.eql('myRedisRepo');
			expect(redisRepo.clearOnQuit).to.be.true;
		});

	});

	describe('getByKeys()', ()=>{
		it('should get redis value', ()=>{
			// let redisStub = sinon.stub(redisRepo.redis,'hmget').callsFake(function()  {
			// 	process.nextTick(callback);
			// 	return 'get method called';
			// });
			let result = redisRepo.getByKeys( ['key1', 'key2'], callback);
			expect(result).to.eql('get method called');
			// redisStub.restore();
		});
		after(()=>{
			expect(callback.calledOnce).to.be.true;
			expect(callback.calledWith('seenreq', ['key1', 'key2'])).to.be.true;
		});

	});

	describe('setByKeys()', ()=>{
		it('should set redis value', ()=>{
			let result1 = redisRepo.setByKeys([], callback);
			let result2 = redisRepo.setByKeys(['key1', 'key2'], callback);
			expect(result1).to.be.undefined;
			expect(result2).to.eql('set method called');
		});

		after(()=>{
			expect(callback.calledTwice).to.be.true;
			expect(callback.calledWith('seenreq', [ 'key1', 1, 'key2', 1 ])).to.be.true;
		});

	});

	describe('dispose()', ()=>{
		it('should dipose redis connection', ()=>{
			//clearOnQuit is true
			redisRepo.dispose();
			//when error occurs
			redisRepo.appName = null;
			redisRepo.dispose();
			//clearOnQuit is false
			redisRepo.clearOnQuit = false;
			redisRepo.dispose();
		});
		after(()=>{
			expect(callback.calledTwice).to.be.true;
		});
	});
});