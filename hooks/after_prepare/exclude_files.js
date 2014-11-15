#!/usr/bin/env node

var exclude_files = [
    'node_modules',
    'spec',
    'res'
];

var path = require( "path" ),
    fs = require( "fs" ),
    shell = require( "shelljs" ),
    rootdir = process.argv[ 2 ],
    config = require(rootdir + "/.cordova/config.json");
    // iconroot = rootdir + "/assets/icon/android",
    // screenroot = rootdir + "/assets/screen/android",
    // androidroot = rootdir + "/platforms/android";

var platform_roots = ['ios', 'android'].map(function(p) {
    return rootdir + "/platforms/" + p;
});

console.log('-running-hook: exclude_files');

platform_roots.forEach(function(proot) {
    try {
        fs.lstatSync(proot).isDirectory();
    } catch(e) {
        console.log(" [exclude_files] " + proot + " does not exist. skip.");
        return;
    }

    exclude_files.forEach(function(dir) {
        var d = proot + "/assets/www/" + dir;
        shell.rm('-rf', d);
        console.log(' [exclude_files] Remove ' + d);
    });

});

process.exit(0);
