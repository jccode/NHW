'use strict';

/* jasmine specs for controllers go here */

describe('controllers', function(){
    beforeEach(module('nhw.controllers'));


    it('should ....', inject(function($controller) {
        //spec body
        var myCtrl1 = $controller('LoginCtrl', { $scope: {}, $rootScope: {}, $state: {}, User: {}, LicenseServer:{}, Util:{}, Bootstrap:{} });
        expect(myCtrl1).toBeDefined();
    }));

    // it('should ....', inject(function($controller) {
    //     //spec body
    //     var myCtrl2 = $controller('NavCtrl', { $scope: {}, $state:{}, User:{}, Util:{} });
    //     expect(myCtrl2).toBeDefined();
    // }));
    
});
