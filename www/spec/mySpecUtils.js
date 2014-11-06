
function sleep(n) {        //millis
    var s = Date.now();
    while(Date.now() - s < n) {
    }
}

function mockFn(obj, methodName) {
    if(obj[methodName] && typeof(obj[methodName]) == 'function') {
        obj["__" + methodName] = obj[methodName];
        obj[methodName] = function() {
            obj[methodName].callCount ++;
        }
        obj[methodName].callCount = 0;
    }
}

function unmockFn(obj, methodName) {
    if(obj[methodName] && typeof(obj[methodName]) == 'function' && obj["__" + methodName]) {
        obj[methodName] = obj["__" + methodName];
        if(obj[methodName].callCount) {
            delete obj[methodName].callCount;
        }
    }
}



