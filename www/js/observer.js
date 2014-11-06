// 
// observer.js
//
// take it from: https://github.com/shichuan/javascript-patterns/blob/master/design-patterns/observer.html
// jcchen 2014-11-05
//

;(function(window) {

    var observer = {
        addSubscriber:function (callback) {
            this.subscribers[this.subscribers.length] = callback;
        },
        removeSubscriber:function (callback) {
            for (var i = 0; i < this.subscribers.length; i++) {
                if (this.subscribers[i] === callback) {
                    delete(this.subscribers[i]);
                }
            }
        },
        publish:function (what) {
            for (var i = 0; i < this.subscribers.length; i++) {
                if (typeof this.subscribers[i] === 'function') {
                    this.subscribers[i](what);
                }
            }
        },
        make:function (o) { // turns an object into a publisher
            for (var i in this) {
                o[i] = this[i];
                o.subscribers = [];
            }
        }
    };

    window.observer = observer;
    
})(window);

