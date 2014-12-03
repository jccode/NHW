#!/usr/bin/env python

import os
from os.path import join, abspath, dirname
import shutil
import logging
from slimit import minify
from rcssmin import cssmin


# variables
src_root = dirname(abspath(__file__))
src_www = os.path.join(src_root, 'www')

deploy_root = os.path.join(dirname(src_root), 'nhw-deploy')
deploy_www = os.path.join(deploy_root, 'www')

logger = logging.getLogger(__name__)
logger.addHandler(logging.StreamHandler())
logger.setLevel(logging.DEBUG)



def emmpty_www(path):
    shutil.rmtree(path)
    os.mkdir(path)

def copy_files_as_orignal(src_www, deploy_www):
    files = [
        "icon.png",
        "config.xml", 
    ]
    dirs = [
        "img",
        "res"
    ]
    for f in files:
        shutil.copy(join(src_www, f), join(deploy_www, f))
    for d in dirs:
        shutil.copytree(join(src_www, d), join(deploy_www, d))


def exclude_files(deploy_www):
    files = [
        "img/map.svg"
        "img/map.svg.bak"
    ]
    for f in files:
        os.remove(join(deploy_www, f))

        
def copy_libs(src_www, deploy_www):
    """
    copy libs/ directory. 
    for js/css, only minified file will be copy

    Arguments:
    - `src_www`:
    - `deploy_www`:
    """

    os.mkdir(join(deploy_www, "lib"))
    for root, dirs, files in os.walk(join(src_www, "lib")):
        r = root.replace(src_www+"/", "")
        # print r
        for d in dirs:
            p = join(deploy_www, r, d)
            os.mkdir(p)
        for f in files:
            if f.endswith(".js") and (not f.endswith("min.js")):
                continue
            if f.endswith(".css") and (not f.endswith("min.css")):
                continue
            shutil.copy(join(root, f), join(deploy_www, r))


def copy_and_minify_css(src_www, deploy_www):
    os.mkdir(join(deploy_www, "css"))
    css = [
        'css/style.css'
    ]
    css_min(map(lambda f: join(src_www, f), css), join(deploy_www, 'css/style.min.css'))
    

def copy_and_minify_js(src_www, deploy_www):
    os.mkdir(join(deploy_www, "js"))
    js = [
        'js/utils.js', 
        'js/index.js', 
        'js/observer.js', 
        'js/app.js', 
        'js/directives.js', 
        'js/filters.js', 
        'js/services.js', 
        'js/controllers.js', 
        'js/beacon_model.js', 
        'js/test.js', 
    ]
    js_min(map(lambda f: join(src_www, f), js), join(deploy_www, 'js/all.min.js'))
    

def copy_and_minify_html(src_www, deploy_www):
    # os.mkdir(join(deploy_www, "partials"))
    shutil.copytree(join(src_www, "partials"), join(deploy_www, "partials"), ignore=shutil.ignore_patterns("*.bak"))

def copy_index_html(deploy_root):    
    shutil.copy(join(deploy_root, 'index.html.tpl'), join(deploy_root, 'www', 'index.html'))
    
    
def minify_css_proc(content):
    return cssmin(content, keep_bang_comments=True)
    
def minify_js_proc(content):
    return minify(content, mangle=True, mangle_toplevel=True)

def doProcessFiles(minifyProc, sourcePaths, header, minPath):
    print "Combining to %s" % minPath
    try:
        mf = open(minPath, 'w')
        mf.write(header)
        for srcFile in sourcePaths:
            print(srcFile)
            with open(srcFile) as inputFile:
                srcText = inputFile.read()
                minText = minifyProc(srcText)
            mf.write(minText)
    finally:
        if mf and not mf.closed:
            mf.close()

def js_min(sourcePaths, minPath):
    return doProcessFiles(minify_js_proc, sourcePaths, '', minPath)

def css_min(sourcePaths, minPath):
    return doProcessFiles(minify_css_proc, sourcePaths, '', minPath)

            
        
if __name__ == '__main__':
    logger.info("Prepare for deployment ")
    logger.info( "src root: %s " % src_root )
    logger.info( "deploy root: %s " % deploy_root )

    logger.info( "Empty deploy www folder %s " % deploy_www )
    emmpty_www(deploy_www)

    logger.info( "Copy files as original ")
    copy_files_as_orignal(src_www, deploy_www)

    logger.info("Copy lib")
    copy_libs(src_www, deploy_www)

    logger.info("copy and minify css files")
    copy_and_minify_css(src_www, deploy_www)

    logger.info("copy and minify js files")
    copy_and_minify_js(src_www, deploy_www)

    logger.info("copy index.html")
    copy_index_html(deploy_root)

    logger.info("copy html")
    copy_and_minify_html(src_www, deploy_www)
    
    logger.info("Remove exclude files")
    exclude_files(deploy_www)


