(function () {
    'use strict';

    angular
        .module('app')
        .constant('routes', getRoutes()) // Collect the routes
        .config(['$routeProvider', 'routes', routeConfigurator]); // Configure the routes and route resolvers

    function routeConfigurator($routeProvider, routes) {

        routes.forEach(function (r) {
            setRoute(r.url, r.config);
        });

        $routeProvider.otherwise({ redirectTo: '/' });

        function setRoute(url, config) {
            //Sets resolver for all the routes
            //by extending any existing resolvers (or create a new one.)
            config.resolve = angular.extend(config.resolve || {},
            {
                checkSecurity: checkSecurity
            });

            $routeProvider.when(url, config);
            return $routeProvider;
        }
    }

    checkSecurity.$inject = ['$route', 'authenticator', 'common', '$q', '$location'];
    function checkSecurity($route, authenticator, common, $q, $location) {
        var deferred = $q.defer();
        authenticator.fillData().then(function() {
            var settings = $route.current.settings;
            var loginRequired = settings.loginRequired || false;
            var roles = settings.roles || [];
            if (loginRequired) {
                if (!authenticator.authData.isAuth) {
                    $location.path('/login');
                } else {
                    if (roles.length > 0) {
                        if (!common.checkRole(authenticator.authData.roles, roles)) {
                            $location.path('/notauthorized').replace();
                        }
                    }
                }
            }

            //We want to return just true even if we have to re-route. 
            //If we returned a reject, the global handler will re-route us to home
            deferred.resolve(true);
        }, function(error) {
            deferred.reject(error);
        });

        return deferred.promise;
    }

    // Define the routes 
    function getRoutes() {
        return [
            {
                url: '/',
                config: {
                    title: 'Home',
                    templateUrl: 'app/home/home.html',
                    controller: 'homeController as vm',
                    settings: {
                        nav: 1,
                        loginRequired: false,
                        roles: [],
                        content: '<i class="fa fa-home"></i> Home'
                    }
                }
            },
            {
                url: '/about',
                config: {
                    title: 'About',
                    templateUrl: 'app/home/about.html',
                    controller: 'aboutController as vm',
                    settings: {
                        nav: 2,
                        loginRequired: false,
                        roles: [],
                        content: '<i class="fa fa-building"></i> About'
                    }
                }
            },
            {
                url: '/adminonly',
                config: {
                    title: 'Admins - ONLY!',
                    templateUrl: 'app/home/adminOnly.html',
                    controller: 'adminOnlyController as vm',
                    settings: {
                        nav: 3,
                        loginRequired: true,
                        roles: ['Admin'],
                        content: '<i class="fa fa-lock"></i> Admin Only'
                    }
                }
            },
            {
                url: '/login',
                config: {
                    title: 'Login',
                    templateUrl: 'app/users/login.html',
                    controller: 'loginController as vm',
                    settings: {}
                }
            },
            {
                url: '/notauthorized',
                config: {
                    title: 'Not Authorized',
                    templateUrl: 'app/home/notauthorized.html',
                    controller: 'notauthorizedController as vm',
                    settings: {}
                }
            }
        ];
    }
})();