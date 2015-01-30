(function () {
    'use strict';

    var app = angular.module('app', [
        // Angular modules 
        'ngAnimate',        // animations
        'ngRoute',          // routing
        'ngSanitize',       // sanitizes html bindings (ex: sidebar.js)

        // Custom modules 
        'common',           // common functions, logger, spinner
        //'common.bootstrap', // bootstrap dialog wrapper functions        

        // 3rd Party Modules
        'ui.bootstrap',      // ui-bootstrap (ex: carousel, pagination, dialog)
        'LocalStorageModule'
    ]);

    app.config(['$httpProvider', 'localStorageServiceProvider', function ($httpProvider, localStorageServiceProvider) {
        $httpProvider.interceptors.push('authInterceptorService');
        localStorageServiceProvider
            .setPrefix('spa')
            .setStorageType('sessionStorage');
    }]);

    // Handle routing errors and success events
    app.run(['$route', 'routemediator',
        function ($route, routemediator) {
            // Include $route to kick start the router.   

            routemediator.setRoutingHandlers();
        }
    ]);
})();