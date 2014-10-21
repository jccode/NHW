
angular.module('nhw.filters', [])
    .filter('excludeId', ['_', function(_) {
        return function(items, field, id) {
            return _.reject(items, function(item) {
                return item[field] == id;
            });
        }
    }]);
