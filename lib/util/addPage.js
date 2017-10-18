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

const checkForPageExists = (name) => {
    return new Promise((resolve, reject) => {
        fs.access(`./src/js/viewModels/${name}.html`, fs.constants.R_OK | fs.constants.W_OK, (err) => {
            if(err) {
                //Component does not exist
                resolve(name)
            }
            else{
                reject(`[ERROR]: The page ${name} that you are trying to create already exists.`)
            }
        })
    })
};

const savePages = (res) => {
    return new Promise((resolve, reject)=> {
        console.log('Saving pages');
        resolve();
    });
};

exports.init = () => {
    root.checkForRootFolder()
        .then(pollUser)
        .then(res => checkForPageExists)
        .then(res => savePages)
        .then(() => {
            logger(colors.magenta("{DONE]: The page has been created."))
        })
        .catch(err => logger(colors.red(err), "both"));
};


module.exports = exports;
