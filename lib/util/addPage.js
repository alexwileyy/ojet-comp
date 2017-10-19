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

        let finalAnswers = {};
        let i = 0;


        const prompts = new Rx.Subject();

        const createPrompts = (msg) => {
            return questions[i]
        };

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
                message: colors.magenta('Do you want to specify a sub directory structure?: '),
                default: "n",
                validate: function(val){
                    console.log('Something' + val);
                    return true;
                }
            },
            {
                name: 'randomQ',
                message: colors.magenta('Enter your home city: ')
            }
        ];

        inquirer.prompt(prompts).ui.process.subscribe((ans) => {
            let questionName = ans.name;
            let questionRes = ans.answer;
            finalAnswers[questionName] = questionRes;
            i += 1;
            if(i === questions.length){
                console.log(finalAnswers);
                prompts.onCompleted();
            }
            if(ans.name === 'allowSub' && ans.answer){
                i -= 1;
                prompts.onNext({
                    name: 'pageDirectory',
                    message: colors.magenta('Enter the directory structure ( folder/folder2 ): ')
                });
                return;
            }
            prompts.onNext(createPrompts())
        }, (err) => {
            console.log(err);
        });

        //Init prompt module
        prompts.onNext(createPrompts());

        // inquirer.prompt(questions).then((res) => {
        //     res.pageName = res.pageName.toLowerCase();
        //     res.pageDirectory = res.pageDirectory === '/' ? null :  res.pageDirectory;
        //     logger(null, "bottom");
        //     resolve(res)
        // });
    });
    // {
    //     name: 'pageDirectory',
    //         message: colors.magenta('Specify sub-directory format, if any (eg. profile-pages/stats): '),
    // default: "/"
    // }
    // return new Promise((resolve, reject) => {
    //
    //     let completed = false;
    //
    //     let observe = Rx.Observable.create(function(obs){
    //         obs.onNext({
    //             type: 'input',
    //             name: 'first_name',
    //             message: 'What\'s your first name'
    //         });
    //
    //         obs.onNext({
    //             type: 'input',
    //             name: 'last_name',
    //             message: 'What\'s your last name',
    //             default: function () {
    //                 return 'Doe';
    //             },
    //             validate: function(val){
    //                 console.log(val);
    //                 if(val === 't'){
    //                     finish();
    //                     return true;
    //                 } else{
    //                     return 'Please try again.'
    //                 }
    //             }
    //         });
    //
    //     });
    //
    //     inquirer.prompt(observe).then((res) => {
    //        console.log(res);
    //     });
    //
    //

    // })
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
