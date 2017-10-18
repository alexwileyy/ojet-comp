#! /usr/bin/env node

'use strict';

const fs = require('fs'),
    prompt = require('prompt'),
    colors = require("colors");

/**
 * Default options input for program to run.
 * @type {{dashLength: number, basePath: string, compositePath: string}}
 */
let options = {
    dashLength: 90,
    basePath: './src/js',
    compositePath: './src/js/jet-composites'
};



const addComponent = require('./lib/addComponent');

addComponent()


