import schedule = require("node-schedule");

const CACHE_FLAG  = Date.now() + "";

const CACHE_MAP: { [flag: string]: Cache } = { };

let DEBUG = false;

interface ICacheSet {
    [key: string]: {
        value: any;
        expire?: number | string;
        schedule?: schedule.Job
    };
}

type timeoutCB = (key: string, value) => any;

const create = (flag: string = CACHE_FLAG) => {
    let cache: Cache;
    if (!CACHE_MAP[flag]) {
        cache = new Cache();
        CACHE_MAP[flag] = cache;
    } else {
        cache = CACHE_MAP[flag];
    }
    return cache;
};

const log = (...args) => {
    if (DEBUG) {
        process.stdout.write(args.join(" ") + "\n");
    }
};

class Cache {
    private createDate = Date.now();
    private cacheSet: ICacheSet = Object.create(null);

    public static create = create;

    public static debug(bool: boolean) {
        DEBUG = bool;
    }

    private putSchedule(rule: string|Date, key: string, value, timeoutCB?: timeoutCB) {
        log(`New Cache [${key}] to ${rule}`);
        schedule.scheduleJob(rule, () => {
            log(`[${key}] it is timeout`);
            this.del(key);
            if (timeoutCB) {
                timeoutCB(key, value);
            }
        });
    }

    public put(key: string, value, time?: number|string, timeoutCB?: timeoutCB) {
        if (arguments.length < 2) {
            return false;
        } else if (arguments.length === 2) {
            return this.put(key, value, 0, () => { });
        } else if (arguments.length === 3 && typeof time === "function") {
            return this.put(key, value, 0, () => { });
        } else if (arguments.length === 4 && typeof timeoutCB !== "function") {
            return false;
        }
        if (typeof time === "number") {
            const curDate = Date.now();
            if (isNaN(time)) {
                return false;
            }
            if (time < 0) {
                return this.put(key, value, 0, timeoutCB);
            }
            this.del(key);
            this.cacheSet[key] = {
                value: value
            };
            if (time === 0) {
                log(`New Cache [${key}]`);
            } else if (time > curDate) {
                const newTime = new Date(time);
                this.cacheSet[key].expire = time;
                this.putSchedule(newTime, key, value, timeoutCB);
            } else {
                const newTime = new Date(curDate + time);
                this.cacheSet[key].expire = curDate + time;
                this.putSchedule(newTime, key, value, timeoutCB);
            }
        } else if (typeof time === "string") {
            const crons = time.split(/\s/);
            if (crons.length !== 5 && crons.length !== 6) {
                return false;
            }
            this.del(key);
            this.cacheSet[key] = {
                value: value,
                expire: time
            };
            this.putSchedule(time, key, value, timeoutCB);
        } else {
            return false;
        }
        return true;
    }

    public get(key: string) {
        const obj = this.cacheSet[key];
        if (!obj) {
            return null;
        } else {
            return obj.value;
        }
    }

    public del(key: string) {
        if (this.cacheSet[key]) {
            if (this.cacheSet[key].schedule) {
                this.cacheSet[key].schedule.cancel();
            }
            delete this.cacheSet[key];
            log(`Cancel Cache [${key}]`);
        }
        return true;
    }

    public keys() {
        return Object.keys(this.cacheSet);
    }

    public size() {
        return Object.keys(this.cacheSet).length;
    }

    public clear() {
        for (const key of Object.keys(this.cacheSet)) {
            this.del(key);
        }
        return true;
    }

}

export = Cache;
