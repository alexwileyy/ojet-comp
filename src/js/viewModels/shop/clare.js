define(['ojs/ojcore', 'knockout', 'jquery'],
    function(oj, ko, $) {

        function clareViewModel() {
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

        return new clareViewModel();
    }
);