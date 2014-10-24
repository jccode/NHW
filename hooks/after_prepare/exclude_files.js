#!/usr/bin/env node

var exclude_files = [
    'node_modules',
    'spec'
];

var path = require( "path" ),
    fs = require( "fs" ),
    shell = require( "shelljs" ),
    rootdir = process.argv[ 2 ],
    config = require(rootdir + "/.cordova/config.json"),
    iconroot = rootdir + "/assets/icon/android",
    screenroot = rootdir + "/assets/screen/android",
    androidroot = rootdir + "/platforms/android";

var assetwww = androidroot + "/assets/www";

console.log('-running-hook: exclude_files');

exclude_files.forEach(function(dir) {
    var d = assetwww + "/" + dir;
    shell.rm('-rf', d);
    console.log(' [exclude_files] Remove ' + d);
});

process.exit(0);
