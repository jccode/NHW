

var normalizeAttrName = Util.normalizeAttrName;

angular.module('nhw.directives', [])
    .directive('autoHeight', ['$window', '$timeout', function($window, $timeout) {
        return {
            link: function($scope, $element, $attrs) {
                var combineHeights, siblings;
                combineHeights = function(collection) {
                    var heights, node, _i, _len;
                    heights = 0;
                    for (_i = 0, _len = collection.length; _i < _len; _i++) {
                        node = collection[_i];
                        heights += node.offsetHeight;
                    }
                    return heights;
                };
                siblings = function($elm) {
                    var elm, _i, _len, _ref, _results;
                    _ref = $elm.parent().children();
                    _results = [];
                    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                        elm = _ref[_i];
                        if (elm !== $elm[0]) {
                            _results.push(elm);
                        }
                    }
                    return _results;
                };
                var setHeight = function() {
                    var additionalHeight, parentHeight;
                    additionalHeight = $attrs.additionalHeight || 0;
                    parentHeight = $window.innerHeight - $element.parent()[0].getBoundingClientRect().top;
                    // console.log('parentHeight:'+parentHeight+', combineHeights:'+combineHeights(siblings($element)));
                    return $element.css('height', (parentHeight - combineHeights(siblings($element)) - additionalHeight)+'px');
                }
                angular.element($window).bind('resize', setHeight);
                setHeight();
                return $timeout(function() {
                    return angular.element($window).triggerHandler('resize');
                }, 1000);
            }
        };
    }])

    .directive('stopEvent', function () {
        return {
            restrict: 'A',
            link: function (scope, element, attr) {
                element.bind(attr.stopEvent, function (e) {
                    e.stopPropagation();
                });
            }
        };
    })

    .directive('btnLoading',function () {
        return {
            link:function (scope, element, attrs) {
                scope.$watch(
                    function () {
                        return scope.$eval(attrs.btnLoading);
                    },
                    function (value) {
                        if(value) {
                            element.addClass("disabled").attr("disabled","disabled");
                            element.data('resetText', element.html());
                            element.html(element.attr('data-loading'));
                        } else {
                            element.removeClass("disabled").removeAttr("disabled");
                            element.html(element.data('resetText'));
                        }
                    }
                );
            }
        };
    })

    .directive('nhwSrc', ['$rootScope', '_', 'Util', function($rootScope, _, Util) {
        return {
            link: function(scope, element, attr) {
                var attrName = normalizeAttrName("nhwSrc");
                var FILE_PROTOCOL_REGEX = /^file:\/\//g;
                var IMG_REGEX = /.*\/(\w+\.(jpg|png|gif|bmp|jpeg))/i;

                var imgName = function(url) {
                    return url.replace(IMG_REGEX, '$1');
                };
                
                attr.$observe(attrName, function(value) {
                    if(!value || !IMG_REGEX.test(value)) {
                        return;
                    }
                    
                    // For desktop user. as the same as ng-src
                    if(!Util.isRunningOnPhonegap()) {
                        attr.$set("src", value);
                        return;
                    }

                    // For phonegap user. download to local file system
                    if(FILE_PROTOCOL_REGEX.test(value)) {
                        attr.$set("src", value);
                        return;
                    }
                    
                    var name = imgName(value),
                        localUrl = $rootScope.AVATAR_DIR + name;
                    if(_.contains($rootScope.userpics, name)) {
                        attr.$set("src", localUrl);
                    } else {
                        var ft = new FileTransfer();
                        ft.download(value, localUrl, function(entity) {
                            console.log('Download ' + value + ' successful. stored to ' + localUrl);
                            $rootScope.userpics.push(name);
                            attr.$set("src", localUrl);
                        }, function(e) {
                            console.log('ERROR: Download ' + value + ' failed.');
                            console.log( JSON.stringify(e) );
                            attr.$set("src", value);
                        });
                    }
                    
                });
            }
        };
    }])
;


