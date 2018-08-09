
'use strict';

const  seenreq = require('seenreq');
const expect = require('chai').expect;

describe('seenreq integration testing', ()=>{
	let ctx  = require('../fixtures/opts.json');
	let seen;

	describe('redis repo', ()=>{
		beforeEach((done) => {
			seen = new seenreq({
				repo:'redis',// use redis instead of memory
				host:'127.0.0.1', 
				port:6379,
				clearOnQuit:true // clear redis cache or not when calling dispose(), default true.
			});
			
			seen.initialize().then(done).catch( (e) => {
				console.error(e);
				expect(true).to.be.false;
				done();
			});
		});
		
		afterEach((done)=>{
			seen.dispose().then(() => done());
		});
		
		it('should find duplicate request',(done)=>{
			seen.exists(ctx.opts[0]).then( (rst) => {
				expect(rst[0]).to.be.false;
				return seen.exists(ctx.opts[0]);
			}).then( (rst) => {
				expect(rst[0]).to.be.true;
				done();
			});
		});

		it('should find different requests',(done)=>{
			seen.exists(ctx.opts[2]).then( (rst) => {
				expect(rst[0]).to.be.false;
				return seen.exists(ctx.opts[3]);
			}).then( (rst) => {
				expect(rst[0]).to.be.false;
				done();
			});
		});

		it('should distinguish  similar request',(done)=>{
			seen.exists(ctx.opts[4]).then( (rst) => {
				expect(rst[0]).to.be.false;
				return seen.exists(ctx.opts[5]);
			}).then( (rst) => {
				expect(rst[0]).to.be.false;
				return seen.exists(ctx.opts[6]);
			}).then( (rst) => {
				expect(rst[0]).to.be.true;
				done();
			});
		});
	});
});
