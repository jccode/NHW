'use strict';

describe('Storage', function() {

    var storage, window, rootScope;
    beforeEach(function() {
        module('nhw.storage', function($provide) {
            // custom mocks
            $provide.value('_', _);
            $provide.value('User', jasmine.createSpy('User'));
            $provide.value('Floors', jasmine.createSpy('Floors'));
            $provide.value('Beacon', jasmine.createSpy('Beacon'));
            $provide.value('Log', jasmine.createSpyObj('Log', ['log']));
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

    it("should insert some data to user table successful", function() {
        // storage.User.insert({"name":"Tom", "email":"Tom@gmail.com", "photo":"img/tom.jpg"});
        // console.log('---------');
        // var users;
        // storage.User.all().then(function(data) {
        //     console.log('~~~~~~~');
        //     users = data;
        //     done();
        // });
        // rootScope.$apply();
        // expect(users.length).toEqual(1);
        // expect("Tom").toEqual(users[0]["name"]);

        
        var user;
        runs(function() {
            storage.User.insert({"name":"Tom", "email":"Tom@gmail.com", "photo":"img/tom.jpg"});
            // console.log('---------');
            storage.User.all().then(function(data) {
                user = data[data.length-1];
            });
        });

        waitsFor(function() {
            rootScope.$apply();
            return user;
        }, "The users should be return", 3000);

        runs(function() {
            // console.log("~~~~~~~");
            // console.log(users);
            // expect(users.length).toEqual(1);
            expect("Tom").toEqual(user["name"]);
        });
    });
    
});
