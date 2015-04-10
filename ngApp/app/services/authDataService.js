(function () {
    'use strict';

    angular
        .module('app')
        .factory('authDataService', ['$http', '$q', 'common', 'config', authDataService]);

    function authDataService($http, $q, common, config) {

        var service = {
            login: login,
            logout: logout,
            refreshToken: refreshToken,
            getUserInfo: getUserInfo,
            getPeople: getPeople,
        };

        return service;

        //////////// PRIVATE METHODS //////////////

        function login(loginData) {
            var url = common.serviceUrl(config.apiServices.login);

            var data = "grant_type=password&username=" + loginData.userName
                + "&password=" + loginData.password
                + "&client_id=" + config.clientId
                + "&origin_token=" + loginData.origin;

            var header = { 'Content-Type': 'application/x-www-form-urlencoded' };

            var deferred = $q.defer();

            $http.post(url, data, { headers: header })
                .success(function(response) {
                    deferred.resolve(response);
                })
                .error(function(error) {
                    deferred.reject(error);
                });

            return deferred.promise;
        }

        function logout() {
            var url = common.serviceUrl(config.apiServices.account) + "Logout";
            return $http.post(url);
        }

        function refreshToken(token, origin) {

            var url = common.serviceUrl(config.apiServices.login);
            var data = "grant_type=refresh_token&refresh_token=" + token + "&client_id=" + config.clientId + "&origin_token=" + origin;
            var header = { 'Content-Type': 'application/x-www-form-urlencoded' };

            var deferred = $q.defer();

            $http.post(url, data, { headers: header })
                .success(function(response) {
                    deferred.resolve(response);
                }).error(function(err) {
                    deferred.reject(err);
                });

            return deferred.promise;
        }

        function getPeople() {
            var url = common.serviceUrl(config.apiServices.account) + 'Tenants';
            return $http.get(url);
        }

        function getUserInfo() {
            var url = common.serviceUrl(config.apiServices.account) + 'LocalUserInfo';
            return $http.get(url);
        }
    }
})();