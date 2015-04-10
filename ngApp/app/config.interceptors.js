(function () {
    'use strict';

    angular
        .module('app')
        .config(['$httpProvider', 'localStorageServiceProvider', configureInterceptors]);

    function configureInterceptors($httpProvider, localStorageServiceProvider) {
        $httpProvider.interceptors.push('authInterceptorService');
        localStorageServiceProvider
            .setPrefix('spa')
            .setStorageType('sessionStorage');
    }
    
})();