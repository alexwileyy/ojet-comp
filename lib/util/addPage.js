const fs = require('fs'),
    mkdirp = require('mkdirp'),
    colors = require("colors"),
    inquirer = require('inquirer'),
    Rx = require('rx-lite-aggregates'),
    options = require('../sys/options'),
    logger = require('../sys/resultLogger');

//Import root checker from addComponent
const root = require('./addComponent');


const pollUser = () => {
    return new Promise((resolve, reject)=> {

        //Setup the main questions for the prompt wizard
        let questions = [
            {
                name: 'pageName',
                message: colors.magenta('Give your page a name: '),
                validate: function(val){
                    let done = this.async();
                    let patt = new RegExp(/([A-z]+)/);
                    let res = patt.test(val);
                    res ? done(null, true) : done('Page must have a name.');
                }
            },
            {
                name: 'allowSub',
                type: "confirm",
                message: colors.magenta('Do you want to specify a sub directory structure? '),
                default: "n",
                validate: function(val){
                    console.log('Something' + val);
                    return true;
                }
            }
        ];

        //Setup any conditional questions for the prompt wizard
        let condQuestions = [
            {
                name: 'pageDirectory',
                message: colors.magenta('Enter the directory structure ( folder/folder2 ): ')
            }
        ];

        /* Initialise Prompter Variables */
        const prompts = new Rx.Subject();
        let finalAnswers = {};
        let i = 0;
        let questionsLength = questions.length + condQuestions.length;

        //Generate new prompt and pull the appropriate question from the questions array
        const createPrompts = () => {
            return questions[i]
        };

        //Subscribe to interactions with the prompt wizard
        inquirer.prompt(prompts).ui.process.subscribe((ans) => {
            finalAnswers[ans.name] = ans.answer;
            i += 1;
            if(ans.name === 'allowSub'){
                if(ans.answer){
                    questionsLength -= 1;
                    i -= 1;
                    prompts.onNext(condQuestions[0]);
                    return;
                } else{
                    questionsLength -= 1;
                }
            }
            if(i === questionsLength){
                prompts.onCompleted();
                finalAnswers.pageName = finalAnswers.pageName.toLowerCase();
                finalAnswers.pageDirectory = finalAnswers.pageDirectory === '/' ? null :  finalAnswers.pageDirectory;
                logger(null, "bottom");
                resolve(finalAnswers);
            }
            prompts.onNext(createPrompts())
        }, err => {reject(err)});

        //Init prompt process with a starting index of 0
        prompts.onNext(createPrompts());

    });
};

/**
 * Check to see whether the page exists
 * @param res
 * @return {Promise}
 */
const checkForPageExists = (res) => {
    return new Promise((resolve, reject) => {
        let addPath = '';
        if(res.pageDirectory){
            addPath = res.pageDirectory + '/';
        }
        fs.access(`./src/js/viewModels/${addPath}${res.pageName}.js`, fs.constants.R_OK | fs.constants.W_OK, (err) => {
            if(err) {
                //Component does not exist
                resolve(res)
            }
            else{
                console.log(colors.yellow(`[WARN]: The page ${res.pageName} has already been created.`));
                reject(`[ERROR]: The page ${res.pageName} that you are trying to create already exists.`)
            }
        })
    })
};

/**
 * If sub-directories have been specified, this function will generate all sub directories needed for the vm and html
 * file to be saved in.
 * @param res
 * @return {Promise}
 */
const generateSubDirectory = (res) => {
    return new Promise((resolve, reject)=> {
        if(res.pageDirectory){
            mkdirp(`./src/js/viewModels/${res.pageDirectory}`, (err) => {
                if(err) reject(err);
                mkdirp(`./src/js/views/${res.pageDirectory}`, (err) => {
                    if(err) reject(err);
                    resolve(res)
                })
            })
        } else{
            resolve(res)
        }

    });
};

/**
 * Generated the view model JS code templating with the page name.
 * @param res
 * @return {Promise}
 */
const generateViewModel = (res) => {
    return new Promise((resolve, reject)=> {
        let vmTemplate =
`define(['ojs/ojcore', 'knockout', 'jquery'],
    function(oj, ko, $) {

        function ${res.pageName}ViewModel() {
            var self = this;
            // Below are a subset of the ViewModel methods invoked by the ojModule binding
            // Please reference the ojModule jsDoc for additionaly available methods.

            
            self.handleActivated = function(info) {
                // Implement if needed
            };

            
            self.handleAttached = function(info) {
                // Implement if needed
                
            };


            
            self.handleBindingsApplied = function(info) {
                // Implement if needed
            };

            
            self.handleDetached = function(info) {
                // Implement if needed
            };
        }

        return new ${res.pageName}ViewModel();
    }
);`;
        let additPath = '';
        if(res.pageDirectory){
            additPath = res.pageDirectory + '/';
        }
        fs.writeFile(`${options.basePath}/viewModels/${additPath}${res.pageName}.js`, vmTemplate, function(err) {
            if(err) {
                reject(colors.red(`[ERROR]: ${err}`));
            }
            console.log(colors.green(`[INFO]: Generating view model for ${res.pageName}`));
            resolve(res);
        });
    });
};

/**
 * Generates a HTML file which can be used for the basic scaffolding of the page
 * @param res
 * @return {Promise}
 */
const generateHTML = (res) => {
    return new Promise((resolve, reject)=> {
        let htmlTemplate =
`<div>
    This is your new page
</div>`;
        let additPath = '';
        if(res.pageDirectory){
            additPath = res.pageDirectory + '/';
        }
        fs.writeFile(`${options.basePath}/views/${additPath}${res.pageName}.html`, htmlTemplate, function(err) {
            if(err) {
                reject(colors.red(`[ERROR]: ${err}`));
            }
            console.log(colors.green(`[INFO]: Generating HTML for ${res.pageName}`));
            resolve();
        });
    });
};

const savePages = (res) => {
    return new Promise((resolve, reject)=> {
        generateSubDirectory(res)
            .then(res => {return generateViewModel(res)})
            .then(res => {return generateHTML(res)})
            .then(resolve)
            .catch(err => reject(err));
    });
};

exports.init = () => {
    root.checkForRootFolder()
        .then(pollUser)
        .then((res) => { return checkForPageExists(res)})
        .then((res) => {return savePages(res)})
        .then(() => {
            logger(null, "top");
            logger(colors.blue("{DONE]: The page has been created."));
            logger(null, "top");
        })
        .catch(err => logger(colors.red(err), "both"));
};


module.exports = exports;
