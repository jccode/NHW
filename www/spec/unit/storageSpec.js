'use strict';

describe('Storage', function() {

    var storage, window, rootScope;
    beforeEach(function() {
        module('nhw.storage', function($provide) {
            // custom mocks
            $provide.value('_', _);
            $provide.value('User', jasmine.createSpy('User'));
            $provide.value('User', jasmine.createSpy('Floors'));
            $provide.value('User', jasmine.createSpy('Beacon'));
        });

        inject(function(Storage, $window, $rootScope) {
            storage = Storage;
            window = $window;
            rootScope = $rootScope;
        });
    });

    // afterEach(function() {
    //     rootScope.$apply();
    // });

    it("should create databases", function() {
        storage.createDBs();
        var db = window.openDatabase('nhw.db', "1.0", "nhw", -1);
        expect(db).not.toBeNull();
    });

    it("should insert some data to user table successful", function(done) {
        // storage.User.insert({"name":"Tom", "email":"Tom@gmail.com", "photo":"img/tom.jpg"});
        // console.log('---------');
        // storage.User.all().then(function(data) {
        //     rootScope.$apply();
        //     console.log('~~~~~~~');
        //     console.log(data);
        //     expect(data.length).toEqual(1);
        //     expect("Tom").toEqual(data[0]["name"]);
        //     done();
        // });

        // var users, flag;
        
        // runs(function() {
        //     flag = false;
        //     storage.User.insert({"name":"Tom", "email":"Tom@gmail.com", "photo":"img/tom.jpg"});
        //     console.log('---------');
        //     rootScope.$apply();
        //     storage.User.all().then(function(data) {
        //         users = data;
        //         flag = true;
        //     });
        // });

        // waitsFor(function() {
        //     return flag;
        // }, "The users should be return", 3000);

        // runs(function() {
        //     console.log("~~~~~~~");
        //     expect(users.length).toEqual(1);
        //     expect("Tom").toEqual(users[0]["name"]);
        // });
    });
    
});
