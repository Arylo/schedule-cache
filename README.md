# schedule-cache

## Installation

`npm install schedule-cache --save`

## Usage

```Javascript
var Cache = require("schedule-cache");
var cache = Cache.create();

// now just use the cache

cache.put("foo", "bar");
console.log(cache.get("foo"));

// that wasn't too interesting, here's the good part

cache.put("dapigu", "roar", 100, function(key, value) {
    console.log(key + " did " + value);
}); // Time in ms

console.log("Dapigu will now " + cache.get("dapigu"));

setTimeout(function() {
    console.log("Dapigu is " + cache.get("dapigu"));
}, 200);

// create new cache instance
var newCache = Cache.create();

newCache.put("foo", "newbaz");

setTimeout(function() {
    console.log("foo in old cache is " + cache.get("foo"));
    console.log("foo in new cache is " + newCache.get("foo"));
}, 200);
```

which should print

```
bar
dapigu will now roar
Dapigu did roar
Dapigu is null
foo in old cache is baz
foo in new cache is newbaz
```

### Or schedule style

```Javascript
// Per Minute Clear Cache
cache.put("foo1", "minute", "*/1 * * * *", function (key, value) {
    console.log("Per " + value + "Cache");
});

// Per Second Clear Cache
cache.put("foo1", "second", "*/1 * * * * *", function (key, value) {
    console.log("Per " + value + "Cache");
});
```

which should print

```
Per second Cache
Per minute Cache
```

## Reference

- [memory-cache](https://www.npmjs.com/package/memory-cache)
- [node-schedule](https://www.npmjs.com/package/node-schedule)