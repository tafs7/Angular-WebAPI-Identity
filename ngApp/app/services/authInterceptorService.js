(function () {
    'use strict';

    angular
        .module('app')
        .factory('authInterceptorService', ['localStorageService', '$injector', '$location', '$q', authInterceptor]);

    function authInterceptor(localStorageService, $injector, $location, $q) {

        var $http;
        var keyAuthData = 'authorizationData';

        var service = {
            request: request,
            responseError: responseError,
        };

        return service;

        ///////////////// PRIVATE METHODS ////////////////////////

        function request(config) {
            //makes sure that every request goes out with the bearer token in the auth header if loggedin
            config.headers = config.headers || {};

            var authData = localStorageService.get(keyAuthData);
            if (authData) {
                config.headers.Authorization = 'Bearer ' + authData.token;
            }

            return config;
        }

        function responseError(error) {
            var deferred = $q.defer();

            var loggedIn = false;
            var authData = localStorageService.get(keyAuthData);
            if (authData) {
                loggedIn = true;
            }

            //We only want to go to the login page if the user is not
            //logged in. If the user is logged in and they get a 401, it is
            //because they don't have access to the resource requested.
            if (error.status === 401) {
                if (!loggedIn) {
                    $location.path('/login').replace();
                } else {
                    var authenticator = $injector.get('authenticator');
                    authenticator.refreshToken().then(function() {
                        retryHttpRequest(error.config, deferred);
                    }, function() {
                        //TODO: investigate if this may cause an async problem since logOut() performs an async op as well
                        authenticator.logOut();
                        deferred.reject(error);
                    });
                }

            } else {
                deferred.reject(error);
            }

            return deferred.promise;
        }

        function retryHttpRequest(config, deferred) {
            //must inject $http w/ service location instead of ctor due to cyclical dependency
            $http = $http || $injector.get('$http');
            $http(config).then(function(response) {
                deferred.resolve(response);
            }, function(response) {
                deferred.reject(response);
            });
        }

    }
})();