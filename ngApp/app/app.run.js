(function () {
    'use strict';

    angular
        .module('app')
        .run(['$route', 'routemediator', appRun]);

    function appRun($route, routemediator) {
        // Include $route to kick start the router
        routemediator.setRoutingHandlers();
    }
    
})();