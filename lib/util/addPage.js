const fs = require('fs'),
    colors = require("colors"),
    inquirer = require('inquirer'),
    options = require('../sys/options'),
    logger = require('../sys/resultLogger');

//Import root checker from addComponent
const root = require('./addComponent');

const pollUser = () => {
    return new Promise((resolve, reject) => {
        inquirer.prompt([
            {
                name: 'pageName',
                message: colors.magenta('Give your page a name: '),
                validate: function(val){
                    let done = this.async();
                    let patt = new RegExp(/([A-z]+)/);
                    let res = patt.test(val);
                    res ? done(null, true) : done('Page must have a name.');
                }
            }
        ]).then((res) => {
            res.pageName = res.pageName.toLowerCase();
            resolve(res)
        });
    })
};

const checkForPageExists = (res) => {
    return new Promise((resolve, reject) => {
        fs.access(`./src/js/viewModels/${res.pageName}.js`, fs.constants.R_OK | fs.constants.W_OK, (err) => {
            console.log(`./src/js/viewModels/${res.pageName}.js`);
            if(err) {
                //Component does not exist
                resolve(res)
            }
            else{
                reject(`[ERROR]: The page ${res.pageName} that you are trying to create already exists.`)
            }
        })
    })
};

const generateViewModel = (res) => {
    return new Promise((resolve, reject)=> {
        let vmTemplate =
`/**
 * Copyright (c) 2014, 2017, Oracle and/or its affiliates.
 * The Universal Permissive License (UPL), Version 1.0
 */
/*
 * Your about ViewModel code goes here
 */
define(['ojs/ojcore', 'knockout', 'jquery'],
    function(oj, ko, $) {

        function ${res.pageName}ViewModel() {
            var self = this;
            // Below are a subset of the ViewModel methods invoked by the ojModule binding
            // Please reference the ojModule jsDoc for additionaly available methods.

            /**
             * Optional ViewModel method invoked when this ViewModel is about to be
             * used for the View transition.  The application can put data fetch logic
             * here that can return a Promise which will delay the handleAttached function
             * call below until the Promise is resolved.
             * @param {Object} info - An object with the following key-value pairs:
             * @param {Node} info.element - DOM element or where the binding is attached. This may be a 'virtual' element (comment node).
             * @param {Function} info.valueAccessor - The binding's value accessor.
             * @return {Promise|undefined} - If the callback returns a Promise, the next phase (attaching DOM) will be delayed until
             * the promise is resolved
             */
            self.handleActivated = function(info) {
                // Implement if needed
            };

            /**
             * Optional ViewModel method invoked after the View is inserted into the
             * document DOM.  The application can put logic that requires the DOM being
             * attached here.
             * @param {Object} info - An object with the following key-value pairs:
             * @param {Node} info.element - DOM element or where the binding is attached. This may be a 'virtual' element (comment node).
             * @param {Function} info.valueAccessor - The binding's value accessor.
             * @param {boolean} info.fromCache - A boolean indicating whether the module was retrieved from cache.
             */
            self.handleAttached = function(info) {
                // Implement if needed
                
            };


            /**
             * Optional ViewModel method invoked after the bindings are applied on this View.
             * If the current View is retrieved from cache, the bindings will not be re-applied
             * and this callback will not be invoked.
             * @param {Object} info - An object with the following key-value pairs:
             * @param {Node} info.element - DOM element or where the binding is attached. This may be a 'virtual' element (comment node).
             * @param {Function} info.valueAccessor - The binding's value accessor.
             */
            self.handleBindingsApplied = function(info) {
                // Implement if needed
            };

            /*
             * Optional ViewModel method invoked after the View is removed from the
             * document DOM.
             * @param {Object} info - An object with the following key-value pairs:
             * @param {Node} info.element - DOM element or where the binding is attached. This may be a 'virtual' element (comment node).
             * @param {Function} info.valueAccessor - The binding's value accessor.
             * @param {Array} info.cachedNodes - An Array containing cached nodes for the View if the cache is enabled.
             */
            self.handleDetached = function(info) {
                // Implement if needed
            };
        }

        /*
         * Returns a constructor for the ViewModel so that the ViewModel is constrcuted
         * each time the view is displayed.  Return an instance of the ViewModel if
         * only one instance of the ViewModel is needed.
         */
        return new ${res.pageName}ViewModel();
    }
);`;
        fs.writeFile(`${options.basePath}/viewModels/${res.pageName}.js`, vmTemplate, function(err) {
            if(err) {
                reject(colors.red(`[ERROR]: ${err}`));
            }
            resolve();
        });
    });
};

const generateHTML = (res) => {
    return new Promise((resolve, reject)=> {
        let htmlTemplate =
`<div>
    This is your new page
</div>`;
        fs.writeFile(`${options.basePath}/views/${res.pageName}.html`, htmlTemplate, function(err) {
            if(err) {
                reject(colors.red(`[ERROR]: ${err}`));
            }
            resolve();
        });
    });
};

const savePages = (res) => {
    return new Promise((resolve, reject)=> {
        generateViewModel(res)
            .then(() => {return generateHTML(res)})
            .then(resolve)
            .catch(err => reject(err));
    });
};

exports.init = (opts) => {
    root.checkForRootFolder()
        .then(pollUser)
        .then((res) => { return checkForPageExists(res)})
        .then((res) => {return savePages(res)})
        .then(() => {
            logger(colors.magenta("{DONE]: The page has been created."))
        })
        .catch(err => logger(colors.red(err), "both"));
};


module.exports = exports;
