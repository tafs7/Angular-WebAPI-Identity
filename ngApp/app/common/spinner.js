(function () {
    'use strict';

    // Must configure the common service and set its 
    // events via the commonConfigProvider

    angular.module('common')
        .factory('spinner', spinner);

    spinner.$inject = ['common', 'config'];

    function spinner(common, config) {
        var service = {
            spinnerHide: spinnerHide,
            spinnerShow: spinnerShow
        };

        return service;

        function spinnerHide() { spinnerToggle(false); }

        function spinnerShow() { spinnerToggle(true); }

        function spinnerToggle(show) {
            common.$broadcast(config.events.spinnerToggleEvent, { show: show });
        }
    }
})();