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


const setupOpts = () => {
    argv.option({
        name: 'template',
        short: 't',
        type: 'string',
        description: 'Defines an option for your script',
        example: "'ojet-comp --template=navdrawer' or 'script -t navdrawer'"
    });
};

const parseArgs = () => {
    //setupOpts()
    argv.info(
`        Oracle Jet Comp - Alex Wiley
        ---
        Available commands:
            - page
            - component
        
        Options:
`);
    let command = argv.run().targets[0] ;
    let opts = argv.run().options;
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


