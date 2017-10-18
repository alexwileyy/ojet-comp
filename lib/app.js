const fs = require('fs'),
    prompt = require('prompt'),
    colors = require("colors");


let options = {
    dashLength: 90,
    basePath: './src/js',
    compositePath: './src/js/jet-composites'
};

const checkForRootFolder = () => {
    return new Promise((resolve, reject) => {
        fs.access('./src', fs.constants.R_OK | fs.constants.W_OK, (err) => {
            if(err) {
                console.log(new Array(options.dashLength).join("-"));
                reject('[ERROR]: User must be at root of project.');
            } else{
                resolve();
            }
        })
    });
};

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
const promptUser = () => {
    return new Promise((resolve, reject) => {
        //Setup prompt
        prompt.message = "";
        //
        // Start the prompt
        //
        prompt.start();
        //
        // Get two properties from the user: username and email
        //
        prompt.get(
            [
                {
                    name: 'name',
                    description: colors.magenta("Component name: "),
                    required: true,
                    type: 'string',
                },
                {
                    name: 'description',
                    description: colors.magenta("Component description: "),
                    default: "This is a component description",
                    required: false,
                    type: 'string'
                },
                {
                    name: 'version',
                    description: colors.magenta("Component version: "),
                    default: '1.0.0',
                    required: false,
                    pattern: /([0-9]+\.){2}([0-9]+)/,
                    type: 'string'
                },
                {
                    name: 'styleOpt',
                    description: colors.magenta("Enable sass (y/n): "),
                    default: 'n',
                    required: true,
                    type: 'string'
                }
            ],
            function (err, result) {
                if(err) reject(err);
                // resolve(result.name, result.description, result.version)
                console.log(new Array(options.dashLength).join("-"));
                resolve({
                    name: result.name,
                    desc: result.description,
                    version: result.version,
                    styleOpt: result.styleOpt
                })
            }
        );
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
 *
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

const init = () => {
    //Call the user input for prompt
    checkForRootFolder()
        .then(checkForComponentFolder)
        .then(() => {
            return promptUser()
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

const test = () => {
    console.log('Module working!');
}

exports.moduleTest = test;
exports.generate = init;

