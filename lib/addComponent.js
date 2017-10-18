const fs = require('fs'),
    prompt = require('prompt'),
    colors = require("colors"),
    inquirer = require('inquirer');


/**
 * Default options input for program to run.
 * @type {{dashLength: number, basePath: string, compositePath: string}}
 */
let options = {
    dashLength: 90,
    basePath: './src/js',
    compositePath: './src/js/jet-composites'
};


/**
 * Checks to make sure that the user is in the root folder of the project
 * @return {Promise}
 */
const checkForRootFolder = () => {
    return new Promise((resolve, reject) => {
        fs.access('./src/js', fs.constants.R_OK | fs.constants.W_OK, (err) => {
            if(err) {
                console.log(new Array(options.dashLength).join("-"));
                reject('[ERROR]: User must be at root of project OR ./src | ./src/js folder does not exist.');
            } else{
                resolve();
            }
        })
    });
};


/**
 * Checks to see whether the required 'jet-composites' folder exists in the project
 * @if (does not exist) => call createCompositesFolder()
 * @return {Promise}
 */
const checkForComponentFolder = () => {
    return new Promise((resolve, reject) => {
        fs.access('./src/js/jet-composites', fs.constants.R_OK | fs.constants.W_OK, (err) => {
            if(err) {
                createCompositesFolder()
                    .then(e => resolve())
                    .catch(e => reject(e))
            } else{
                resolve();
            }
        })
    })
};


/**
 * Starts the prompt module to prompt the user for input from the console.
 * The prompt module will ask the user for four attributes:
 *  - Name
 *  - Description
 *  - Version
 *  - Enable Sass
 *  These attributes will then get passed down the promise tree.
 * @return {Promise}
 */
const pollUser = () => {
    return new Promise((resolve, reject) => {
        inquirer.prompt([
            {
                name: 'name',
                message: colors.magenta('Give your component a name: '),
                validate: function(val){
                    let done = this.async();
                    let patt = new RegExp(/([A-z]+)/);
                    let res = patt.test(val);
                    res ? done(null, true) : done('Component must have a name.');
                }
            },
            {
                name: 'description',
                message: colors.magenta('Describe what your component does: '),
            },
            {
                name: 'version',
                message: colors.magenta('Component version: '),
                default: '1.0.0',
                validate: function(val){
                    let done = this.async();
                    let patt = new RegExp(/([0-9]+\.){2}([0-9]+)/);
                    let res = patt.test(val);
                    res ? done(null, true) : done('Must be in format 1.0.0');
                }
            },
            {
                name: 'styleOpt',
                type: 'list',
                message: colors.magenta('Do you want to enable Sass?'),
                choices: [
                    'Yes',
                    'No'
                ]
            }
        ]).then((res) => {
            res.name = res.name.toLowerCase();
            resolve(res)
        });
    })
};


/**
 * Check to see whether the component already exists which is determined by res.name
 * If a component already exists, the promise tree will get rejected and the program will be stopped.
 * @param res
 * @return {Promise}
 */
const checkForComponentExists = (res) => {
    return new Promise((resolve, reject) => {
        fs.access(`./src/js/jet-composites/${res.name}-component`, fs.constants.R_OK | fs.constants.W_OK, (err) => {
            if(err) {
                //Component does not exist
                resolve(res)
            }
            else{
                reject(`[ERROR]: The component ${res.name} that you are trying to create already exists.`)
            }
        })
    });

};

/**
 * Called if a composites folder does not exist in the application. Composites must be placed inside of jet-composites
 * folders therefore this is required for the proper running of a jet project. The folder will be created in
 * ./src/js/jet-composites
 * @return {Promise}
 */
const createCompositesFolder = () => {
    return new Promise((resolve, reject) => {
        console.log(colors.yellow('[WARN]: jet-composites folder does not exist. Creating compsites folder in ./src/js/jet-composites'));
        fs.mkdir('./src/js/jet-composites', (err) => {
            if(err){
                console.log(colors.red('[ERROR]: Jet composite folder could not be created. Try creating this manually with path ./src/js/jet-composites.'));
                reject(err);
            }
            console.log(colors.green('[INFO]: jet-composites folder has been created.'));
            resolve();
        })
    });
};

/**
 * Called to create a component folder for the componet with the name 'res.name-component'
 * This folder is saved in ./src/js/jet-composites/component-name
 * @param res
 * @return {Promise}
 */
const createComponentFolder = (res) => {
    return new Promise((resolve, reject) => {
        fs.mkdir(`./src/js/jet-composites/${res.name}-component`, (err) => {
            if(err) reject(err);
            console.log(colors.green(`[INFO]: Creating component folder ${res.name}-component`));
            resolve(res);
        })
    })
};

/**
 * Generates the JSON file which is used to setup the component meta data.
 * @param name
 * @param desc
 * @param version
 * @return {Promise}
 */
const createJson = (name, desc, version) => {
    return new Promise((resolve, reject) => {
        let jsonTemplate =
            `{
    "name": "${name}-component",
    "description": "${desc}",
    "version": "${version}",
    "displayName": "${name.charAt(0).toUpperCase() + name.slice(1)} Component",
    "icon":{
        "iconPath":"extension/dt/images/components/card.png",
        "selectedIconPath":"extension/dt/images/components/card_selected.png",
        "hoverIconPath":"extension/dt/images/components/card_hover.png"
    },
    "jetVersion": "^3.0.0",
    "properties": {}
}`;
        fs.writeFile(`${options.compositePath}/${name}-component/component.json`, jsonTemplate, function(err) {
            if(err) {
                reject(err)
            }
            resolve();
        });
    });
};

/**
 * Generates the loader file placing the component name into the required places.
 * @param name
 * @return {Promise}
 */
const createLoader = (name) => {
    return new Promise((resolve, reject) => {
        let loaderTemplate =
            `define(['ojs/ojcore', 'text!./${name}-component.html', './${name}-component', 'text!./component.json', 'css!./${name}-component', 'ojs/ojcomposite'],
    function(oj, view, viewModel, metadata) {
        oj.Composite.register('${name}-component', {
            view: {inline: view},
            viewModel: {inline: viewModel},
            metadata: {inline: JSON.parse(metadata)}
        });
    }
);`;
        fs.writeFile(`${options.compositePath}/${name}-component/loader.js`, loaderTemplate, function(err) {
            if(err) {
                reject(err)
            }
            resolve();
        });
    });
};

/**
 * Generate the JS code for the view model placing the name into the required places.
 * @param name
 * @return {Promise}
 */
const createViewModel = (name) => {
    return new Promise((resolve, reject) => {
        let viewModelTemplate =
            `define(['knockout'],
    function (ko) {
        function ${name}Model (context) {
            let self = this;
        
        }
        return ${name}Model;
    }
);`;
        fs.writeFile(`${options.compositePath}/${name}-component/${name}-component.js`, viewModelTemplate, function(err) {
            if(err) {
                reject(err)
            }
            resolve();
        });
    })
};

/**
 * Generates a basic layout for the HTML file so that when the component is loaded, it has some default text to display.
 * @param name
 * @return {Promise}
 */
const createHTML = (name) => {
    let htmlTemplate =
        `<div class="${name}-component">
    <h1>${name.charAt(0).toUpperCase() + name.slice(1)} has loaded!</h1>
</div>`
    return new Promise((resolve, reject) => {
        fs.writeFile(`${options.compositePath}/${name}-component/${name}-component.html`, htmlTemplate, (err) => {
            if(err) reject(err);
        })
    });
};

/**
 * Creates the CSS or SCSS file depending on what the user choose to use. This will create a blank file with a comment
 * at the top.
 * @param name
 * @param opt
 */
const createStyles = (name, opt) => {
    let ext;
    let styleTemplate = `/* Component styles for ${name}-componennt should be placed in this file.*/`;
    if(opt.toUpperCase() === 'Y'){
        ext = 'scss';
        styleTemplate += `\n/*For sass, the project will need to be served / built with the --sass option stated on the ojet / gulp CLI.*/\n`;
    } else{
        ext = 'css'
    }
    fs.writeFile(`${options.compositePath}/${name}-component/${name}-component.${ext}`, styleTemplate, (err) => {
        if(err) reject(err);
    })
};

/**
 * Returns a promise tree which generates and saves all of the files to the jet-composites folder.
 * @param name
 * @param desc
 * @param version
 * @param styleOpt
 * @return {Promise}
 */
const saveFiles = (name, desc, version, styleOpt) => {
    return new Promise((resolve, reject) => {
        createJson(name, desc, version)
            .then(()=>{
                console.log(colors.green("[INFO]: Created JSON file."));
                createLoader(name)
            })
            .then(()=>{
                console.log(colors.green("[INFO]: Created loader file."));
                createHTML(name)
            })
            .then(()=>{
                console.log(colors.green('[INFO]: Created HTML file.'));
                createViewModel(name)
            })
            .then(()=>{
                console.log(colors.green("[INFO]: Created view model file."));
                createStyles(name, styleOpt);
                console.log(colors.green("[INFO]: Created styles file."));
            })
            .catch(err => reject(err));
    })
};

/**
 * Main application logic function, all code is executed and managed from this promise tree.
 */
const init = () => {
    //Call the user input for prompt
    checkForRootFolder()
        .then(checkForComponentFolder)
        .then(() => {
            return pollUser()
        })
        .then((res) => {
            return checkForComponentExists(res);
        })
        .then((res) => {
            return createComponentFolder(res);
        })
        .then((res)=>{
            return saveFiles(res.name, res.desc, res.version, res.styleOpt)
        })
        .then(() => {
            console.log(colors.blue('Done...!'));
            console.log(new Array(options.dashLength).join("-"));
        })
        .catch((err)=>{
            console.error(colors.red(err));
            console.log(new Array(options.dashLength).join("-"));
        })
};

module.exports = init;