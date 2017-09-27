const Cache = require(`../`);

describe("schedule-cache", () => {

    let cache = Cache.create();

    beforeEach(() => {
        cache = Cache.create(Math.random() + "");
    });

    describe("Put Function", () => {

        it("Fail Create Job", () => {
            cache.put().should.be.false();
            cache.put("test").should.be.false();
        });

        it("Permanent Cache", () => {
            const val = Date.now();
            cache.put("test", val).should.be.true();
            cache.get("test").should.be.eql(val);
        });

        it("Put Same Key", () => {
            cache.put("test", "oldVal").should.be.true();
            cache.put("test", "newVal").should.be.true();
            cache.get("test").should.be.eql("newVal");
        });

        it("Put Key to 500ms", (done) => {
            cache.put("test", "A Val", 500).should.be.true();
            setTimeout(() => {
                should(cache.get("test")).be.null();
                done();
            }, 501);
        });

        it("Put Key to 500ms(As Real Date)", (done) => {
            cache.put("test", "A Val", Date.now() + 500).should.be.true();
            setTimeout(() => {
                should(cache.get("test")).be.null();
                done();
            }, 501);
        });

        it("Put Key to 500ms But it canceled", (done) => {
            cache.put("test", "A Val", 500).should.be.true();
            setTimeout(() => {
                cache.del("test").should.be.true();
            }, Math.floor(Math.random() * 480));
            setTimeout(() => {
                should(cache.get("test")).be.null();
                done();
            }, 490);
        });

        it("Timeout Callback", (done) => {
            cache.put("test", "I timeout", 500, () => {
                done();
            }).should.be.true();
        });

        it("Put Key to Pre-second(As Rule)", (done) => {
            cache.put("timeout", "second", "*/2 * * * * *").should.be.true();
            setTimeout(() => {
                should(cache.get("timeout")).be.null();
                done();
            }, 2001);
        });

    });

    describe("Get Function", () => {

        it("Get No-Exist Cache", () => {
            should(cache.get("test")).be.null();
        });

    });

    it("Delete Function", () => {
        const size = Math.floor(Math.random() * 10) + 1;
        for (let i = 0; i < size; i++) {
            const val = Math.random() * size;
            cache.put(val + "", val).should.be.true();
        }
        cache.put("DeleteItem", Date.now() + "").should.be.true();
        cache.size().should.be.eql(size + 1);
        cache.del("DeleteItem").should.be.true();
        cache.size().should.be.eql(size);
    });

    it("Keys Function", () => {
        const size = Math.floor(Math.random() * 10) + 1;
        for (let i = 0; i < size; i++) {
            const val = Math.random() * size;
            cache.put(val + "", val).should.be.true();
        }
        cache.keys().should.be.length(size);
    });

    it("Size Function", () => {
        const size = Math.floor(Math.random() * 10) + 1;
        for (let i = 0; i < size; i++) {
            const val = Math.random() * size;
            cache.put(val + "", val).should.be.true();
        }
        cache.size().should.be.eql(size);
    });

    it("Clear Function", () => {
        const size = Math.floor(Math.random() * 10) + 1;
        for (let i = 0; i < size; i++) {
            const val = Math.random() * size;
            cache.put(val + "", val).should.be.true();
        }
        cache.size().should.be.eql(size);
        cache.clear().should.be.true();
        cache.size().should.be.eql(0);
    });

    it("Same Cache", () => {
        const cache1 = Cache.create("TestCache");
        const cache2 = Cache.create("TestCache");
        cache1.put("test", 1).should.be.true();
        cache2.put("test", 2).should.be.true();
        cache1.get("test").should.be.eql(cache2.get("test"));

        cache1.del("test").should.be.true();
        should(cache1.get("test")).be.null();
        should(cache2.get("test")).be.null();
    });

    it("Different Cache", () => {
        const cache1 = Cache.create(Math.random() + "");
        const cache2 = Cache.create(Math.random() + "");
        cache1.put("test", 1).should.be.true();
        cache2.put("test", 2).should.be.true();
        cache1.get("test").should.be.not.eql(cache2.get("test"));

        cache1.del("test").should.be.true();
        should(cache1.get("test")).be.null();
        cache2.get("test").should.be.not.null();
    });

});