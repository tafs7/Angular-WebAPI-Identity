(function () {
    'use strict';

    var serviceId = 'routemediator';

    angular
        .module('app')
        .factory(serviceId, routemediator);

    routemediator.$inject = ['$rootScope', '$location', 'logger', 'config'];

    function routemediator($rootScope, $location, logger, config) {

        var handleRouteChangeError = false;

        var service = {
            setRoutingHandlers: setRoutingHandlers,
        };

        return service;

        function setRoutingHandlers() {
            updateDocTitle();
            handleRoutingErrors();
        }

        function handleRoutingErrors() {
            $rootScope.$on('$routeChangeError',
                function (event, current, previous, rejection) {
                    if (handleRouteChangeError) {
                        return;
                    }
                    handleRouteChangeError = true;
                    var msg = 'Error routing: ' + (current && current.name) +
                        '. ' + (rejection.msg || '');
                    logger.logWarning(msg, true, current, serviceId);
                    $location.path('/');
                });
        }

        function updateDocTitle() {
            $rootScope.$on('$routeChangeSuccess',
                function (event, current, previous) {
                    handleRouteChangeError = false;
                    var title = config.docTitle + ' ' + (current.title || '');
                    $rootScope.title = title;
                }
            );
        }
    }
})();