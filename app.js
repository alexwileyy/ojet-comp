#! /usr/bin/env node

'use strict';

const fs = require('fs'),
    colors = require("colors"),
    inquirer = require('inquirer'),
    argv = require( 'argv' ),
    logger = require('./lib/sys/resultLogger');

//Import app modules
const addComponent = require('./lib/util/addComponent'),
    addPage = require('./lib/util/addPage');

/**
 * Default options input for program to run.
 * @type {{dashLength: number, basePath: string, compositePath: string}}
 */
let options = {
    dashLength: 90,
    basePath: './src/js',
    compositePath: './src/js/jet-composites'
};

const setupOpts = () => {
    argv.option({
        name: 'option',
        short: 'o',
        type: 'string',
        description: 'Defines an option for your script',
        example: "'script --opiton=value' or 'script -o value'"
    });
}

const parseArgs = () => {
    // setupOpts();
    let command = argv.run().targets[0] ;
    switch (command){
        case 'component':
            addComponent.init();
            break;
        case 'page':
            addPage.init();
            break;
        default:
            logger(colors.red(`[ERROR]: ${command} is not a command. Please try again.`), "both", true);
    }
};


module.exports = parseArgs();


