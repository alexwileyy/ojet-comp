# Oracle Jet Component Creator
---

```ojet-comp``` is a library developed for Oracle Jet to easily generate custom components and setup peer dependencies inside your Oracle Jet project.

## Installation
To start using ```ojet-comp``` simply download and install it using npm (make sure the ```-g``` flag is set so that you can use it across multiple projects):
```npm install ojet-comp -g```

Oracle JET requires you to specify the custom components module inside your ```main.js``` file, to do so, add the dependency like so:
```
requirejs.config(
    {
      baseUrl: 'js',
      ...
      {
        ...
        'customElements': 'libs/webcomponents/CustomElements',
        ...
      }
      ...
    }
);
```

## Usage
To use this package, you must be in the root of the project (the top level of the project folder. Simply execute the module by typing the command below into the terminal window whilst at the root of your project:
```ojet-comp```
The module will run you through a CLI creation wizard to create your component. Once the wizard is complete, your module will be ready to use.
**Note**: Your custom module must still be required inside the define block of whatever view model you intend to use it in.

## Bugs / Feature Requests
All bugs and feature requests can be submitted to the public github page located [here](https://github.com/alexwileyy/ojet-comp)
