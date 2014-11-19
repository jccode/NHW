

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
                    console.log('auto-heigth trigger resize');
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
                var IMG_REGEX = /.*\/(.+\.(jpg|png|gif|bmp|jpeg))/i;

                var imgName = function(url) {
                    return url.replace(IMG_REGEX, '$1');
                };

                attr.$observe(attrName, function(value) {

                    // console.log( 'nhw src observe: ' + value );

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

    .directive('popwin', ['$window', function($window) {
        return {
            link: function(scope, element, attr) {
                var height = $window.document.documentElement.offsetHeight;
                // console.log('in popwin directive ' + height);
                // return element.css('height', height-500);
                // return element[0].style.height = "50px";
                return element.css({
                    'height': (height - 200)+'px',
                    'overflow': 'auto'
                });
            }
        };
    }])

    .directive('hidesidemenu', ['$rootScope', '$window', function($rootScope, $window) {
        return {
            link: function(scope, element, attr) {
                /*
                $rootScope.$watch('cuser', function(newval, oldval) {
                    var w = $window.innerWidth;
                    if(w < 980)
                        return;
                    
                    var c1 = element.hasClass('has-sidebar-left'),
                        c2 = element.hasClass('sidebar-left-in');
                    if(!newval) {
                        if(c1)
                            element.removeClass('has-sidebar-left');
                        if(c2)
                            element.removeClass('sidebar-left-in');
                    } else {
                        if(!c1 && !c2)
                            element.addClass('has-sidebar-left');
                    }
                });
                 */

                function detect_size_change() {
                    var w = $window.innerWidth;
                    // console.log( 'hide sidemenu. width:' + w );
                    if(w < 980)
                        return;

                    var c1 = element.hasClass('has-sidebar-left'),
                        c2 = element.hasClass('sidebar-left-in');
                    if(!$rootScope.cuser) {
                        if(c1)
                            element.removeClass('has-sidebar-left');
                        if(c2)
                            element.removeClass('sidebar-left-in');
                    } else {
                        if(!c1 && !c2)
                            element.addClass('has-sidebar-left');
                    }
                }


                angular.element($window).bind('resize', detect_size_change);
                $rootScope.$watch('cuser', function(newval, oldval) {
                    detect_size_change();
                });
            }
        };
    }])
;


