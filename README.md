# Oracle Jet Component Creator

```ojet-comp``` is a library developed for Oracle Jet to easily generate custom components and setup peer dependencies inside your Oracle Jet project.

# Index
- [External Tutorial](#external-tutorial)
- [Installation](#installation)
- [Usage](#usage)
- [Component Setup](#component-setup)
    - [Adding Your Component To The View Model](#adding-your-component-to-the-view-model)
    - [Adding your componet to your page](#adding-your-component-to-the-page)
    - [Enabling Custom Components In Jet](#enabling-custom-components-in-jet)
- [Running A Project With Sass](#serving-with-sass)
- [Bugs & Feature Requests](#bugs-%2F-feature-requests)

### External Tutorial
I have written a Medium post which includes an overview of this component along with a tutorial of creating a jet project and using the module in your project. [Read it here](https://medium.com/@speedatw/generating-composite-components-in-oracle-jet-b2f2a432fc55)

## Installation
To start using ```ojet-comp``` simply download and install it using npm (make sure the ```-g``` flag is set so that you can use it across multiple projects):

```npm install ojet-comp -g```


## Usage
To use this package, you must be in the root of the project (the top level of the project folder). Simply execute the module by typing the command below into the terminal window whilst at the root of your project

```$: ojet-comp <action>```

The module will run you through a CLI creation wizard to create your component. Once the wizard is complete, your module will be ready to use.

### Actions
The following actions are currently available:
- page (generates JET pages ready to be used in your project)
- components (generates custom web components ready to be imported into your project) 

**Note**: For ```components``` your custom module must still be required inside the define block of whatever view model you intend to use it in.

---

## Component Setup
For the ```component``` action, a little further setup is required.

### Adding Your Component To The View Model

You must add the ```ojs.composites``` and the ```loader``` files to any view model that you wish to use your generated components with. This is discussed in the [Oracle Jet Docs](https://docs.oracle.com/middleware/jet320/jet/developer/GUID-18F9F429-1A80-4A9F-9B78-09428EFD2530.htm) however this is also demonstrated below. Where you have your view model, it should look like this:

```
define(['ojs/ojcore', 'knockout', 'jquery', 'ojs/ojcomposite', 'jet-composites/accordion-component/loader'],
    function(oj, ko, $) {
        function AccordionViewModel() {
            var self = this;

        }
        return new AccordionViewModel();
    }
);
```

Add the ```'ojs/composite'``` and ```'jet-composites/component-name'``` into the define block so that they are required and run when your viewModel is loaded.

### Adding Your Component To The Page

To include your component on the page, simple write the component in the HTML file for your view model with the component name in the tags. **Note**, components will be automatically appended with -component, therefore if you called your component test, you would render it on the page like so:
```<test-component></test-component>```

### Enabling Custom Components In JET
Oracle JET requires you to specify the custom components module inside your ```main.js``` file, to do so, add the dependency like so:
```
requirejs.config(
    {
      baseUrl: 'js',
      ...
      paths: {
        ...
        'customElements': 'libs/webcomponents/CustomElements',
        ...
      }
      ...
    }
);
```

## Serving with SASS
To serve your project with sass, you can use the Oracle Jet CLI. With the ojet cli installed, run the following command:
```ojet serve --sass```

## Bugs / Feature Requests
All bugs and feature requests can be submitted to the public github issue page located [here](https://github.com/alexwileyy/ojet-comp/issues)

## Change Log

**V1.2.0**
Closed two bugs:
- [#2](https://github.com/alexwileyy/ojet-comp/issues/2)
- [#3](https://github.com/alexwileyy/ojet-comp/issues/3)

**V1.0.0**
Initial creation of component including the features:
- Add Page
- Create component