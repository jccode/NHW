

var nhwUtils = angular.module("nhw.utils", []);

nhwUtils.factory('Util', ['_', function(_) {

    return {
        getAthorizationKey: function() {
            return "sdfkihernvioerj";
        },

        createLocalNotification: function(msg) {
            var defaultOpts = {
                id: +new Date() + "",
                title: "NHW",
                message: ""
            };
            var obj = _.isObject(msg)? msg: {"message": msg};
            obj = _.extend(defaultOpts, obj);
            window.plugin.notification.local.add(obj);
        }
    };
    
}]);


/**
 * Helper function to return a factory function which construct 
 * `localStorage` & `sessionStorage` service
 * 
 * @param type: localStorage / sessionStorage
 */
var WebStorage = function(type) {

    return function($window) {
        var storage = $window[ type.charAt(0).toLowerCase() + type.slice(1) ];

        return {
            get: function(key) {
                var item = storage.getItem(key);
                if(!item || item === "null") return null;
                if(item.charAt(0) === "{" || item.charAt(0) === "[") {
                    return angular.fromJson(item);
                }
                return item;
            }, 

            set: function(key, value) {
                if(typeof value === "undefined") {
                    value = null;
                } else if( angular.isObject(value) || angular.isArray(value) ){
                    value = angular.toJson(value);
                }
                storage.setItem(key, value);
            },

            remove: function(key) {
                storage.removeItem(key);
            },

            clear: function() {
                storage.clear();
            }

        };
    }

}


_.each(['LocalStorage', 'SessionStorage'], function(storageType) {    
    nhwUtils.factory(storageType, ['$window', WebStorage(storageType)]);
});

