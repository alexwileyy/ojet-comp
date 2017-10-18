const options = require('./options');

const logResult = (message, layout, spacing = false) => {
    if(spacing){
        console.log("\n");
    }
    if(layout === "top" || layout === "both"){
        console.log(new Array(options.dashLength).join("-"));
    }
    if(message){
        console.log(message);
    }
    if(layout === "bottom" || layout === "both"){
        console.log(new Array(options.dashLength).join("-"));
    }
    if(spacing){
        console.log("\n");
    }
};

module.exports = logResult;