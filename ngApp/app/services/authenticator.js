(function () {
    'use strict';

    angular.module('app')
        .factory('authenticator', ['authDataService', 'localStorageService', '$q', '$location', authenticator]);


    function authenticator (authDataService, localStorageService, $q, $location) {

        var keyAuthData = "authorizationData";
        var authData = {
            isAuth: false,
            userName: '',
            userRetrieved: false,
            firstName: '',
            lastName: '',
            roles: []
        };

        var service = {
            authData: authData,
            login: login,
            logOut: logOut,
            refreshToken: refreshToken,
            fillData: fillData
        };

        return service;

        //private methods
        function login(loginData) {

            var loginPromise = authDataService.login(loginData)
                .then(function(result) {

                    var storedAuth = {
                        token: result.access_token,
                        userName: loginData.userName,
                        refreshToken: result.refresh_token,
                        expirationTime: getExpirationDateTime(result.expires_in),
                        origin: loginData.origin
                    };

                    localStorageService.set(keyAuthData, storedAuth);
                    authData.isAuth = true;
                    authData.userName = loginData.userName;
                    authData.userRetrieved = false;
                    return result;
                }, function(error) {
                    return $q.reject(error);
                });

            return loginPromise;
        }

        function logOut() {
            authDataService.logout().then(function () {
                clearAuthStorage();
                $location.path('/').replace();
            }, function() {
                clearAuthStorage();
                $location.path('/').replace();
            });
        }

        function clearAuthStorage() {
            localStorageService.remove(keyAuthData);
            authData.isAuth = false;
            authData.userName = '';
            authData.userRetrieved = false;
            authData.firstName = '';
            authData.lastName = '';
            authData.roles.slice(0, authData.roles.length);

        }

        function refreshToken() {
            var cachedAuthData = localStorageService.get(keyAuthData);
            var deferred = $q.defer();

            if (cachedAuthData) {
                localStorageService.remove(keyAuthData);
                authDataService.refreshToken(cachedAuthData.refreshToken, cachedAuthData.origin).then(function (result) {
                    var storedAuth = {
                        token: result.access_token,
                        userName: result.userName,
                        refreshToken: result.refresh_token,
                        expirationTime: getExpirationDateTime(result.expires_in),
                        origin: cachedAuthData.origin
                    };

                    localStorageService.set(keyAuthData, storedAuth);
                    deferred.resolve();

                }, function(reason) {
                    clearAuthStorage();
                    deferred.reject(reason);
                });
            } else {
                deferred.reject();
            }

            return deferred.promise;
        }

        function fillData() {
            var data = localStorageService.get(keyAuthData);
            if (data) {
                authData.isAuth = true;
                authData.userName = data.userName;
                if (!authData.userRetrieved) {
                    return authDataService.getUserInfo().then(function(result) {
                        authData.userRetrieved = true;
                        var userData = result.data;
                        authData.roles = userData.roles;
                        authData.firstName = userData.firstName;
                        authData.lastName = userData.lastName;
                    });
                }
            }

            return $q.when(true);
        }

        function getExpirationDateTime(expiresMins) {
            var future = (new Date()).getTime() + expiresMins * 1000;
            return new Date(future);
        }
    }
})();