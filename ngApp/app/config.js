(function() {
    'use strict';

    angular
        .module('app')
        .value('config', getConfiguration());

    function getConfiguration() {

        // Configure Toastr
        toastr.options.timeOut = 4000;
        toastr.options.positionClass = 'toast-bottom-right';

        var keyCodes = {
            backspace: 8,
            tab: 9,
            enter: 13,
            esc: 27,
            space: 32,
            pageup: 33,
            pagedown: 34,
            end: 35,
            home: 36,
            left: 37,
            up: 38,
            right: 39,
            insert: 45,
            del: 46
        };

        var apiServices = {
            account: 'account',
            login: 'login'
        };

        var baseUrl = 'http://localhost:58254';
        var apiBaseUrl = "/api/";


        var events = {
            controllerActivateSuccess: 'controller.activateSuccess',
            spinnerToggle: 'spinner.toggle'
        };

        return {
            appErrorPrefix: '[MyApp Error] ', //Configure the exceptionHandler decorator
            docTitle: 'MyApp Test: ',
            httpCacheName: 'httpCache',
            keyCodes: keyCodes,
            apiServices: apiServices,
            events: events,
            baseUrl: baseUrl,
            apiUrl: baseUrl + apiBaseUrl,
            version: '1.0.0',
            clientId: 'ngAuthApp'
        };
    }

})();