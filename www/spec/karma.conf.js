module.exports = function(config){
    config.set({

        basePath : '../',

        files : [
            "lib/angular/angular.min.js",
            "lib/angular/angular-resource.min.js",
            "lib/angular-ui/angular-ui-router.min.js",
            "lib/mobile-angular-ui/js/mobile-angular-ui.min.js",
            "lib/d3.v3.min.js",
            "lib/underscore-min.js",
            
            'lib/angular/angular-mocks.js',
            
            'js/**/*.js',
            'spec/unit/**/*.js'
        ],

        autoWatch : true,

        frameworks: ['jasmine'],

        browsers : ['Chrome'],

        plugins : [
            'karma-chrome-launcher',
            'karma-firefox-launcher',
            'karma-jasmine',
            'karma-junit-reporter'
        ],

        junitReporter : {
            outputFile: 'test_out/unit.xml',
            suite: 'unit'
        }

    });
};
