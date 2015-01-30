(function () {
    'use strict';

    var controllerId = 'shellController';

    angular
        .module('app')
        .controller(controllerId, shell);

    shell.$inject = ['$rootScope', 'authenticator', 'common', 'config', 'routes'];

    function shell($rootScope, authenticator, common, config, routes) {
        /* jshint validthis:true */
        var vm = this;
        vm.title = 'shell';
        vm.busyMessage = 'Please wait ...';
        vm.isBusy = true;
        vm.spinnerOptions = {
            radius: 40,
            lines: 7,
            length: 0,
            width: 30,
            speed: 1.7,
            corners: 1.0,
            trail: 100,
            color: '#F58A00'
        };
        vm.showSplash = true;
        vm.authentication = authenticator.authData;
        vm.logOut = logOut;
        vm.displayNav = displayNav;


        activate();

        function activate() {
            getNavRoutes();
            common.activateController([], controllerId).then(function () {
                common.logger.logSuccess('Application Loaded', true);
                vm.showSplash = false;
            });
        }

        function displayNav(r) {
            var okayToGo = false;
            //The logic below is very similar to the logic in the config.route.js 
            //checkSecurity function. It should probably be combined into a 
            //common function
            var settings = r.config.settings;
            var loginRequired = settings.loginRequired || false;
            var roles = settings.roles || [];
            if (loginRequired) {
                if (!authenticator.authData.isAuth) {
                    //nothing to do
                } else {
                    if (roles.length > 0) {
                        if (!common.checkRole(authenticator.authData.roles, roles)) {
                            //nothing to do
                        } else {
                            okayToGo = true;
                        }
                    } else {
                        okayToGo = true;
                    }
                }
            } else {
                okayToGo = true;
            }
            return okayToGo;
        }

        function getNavRoutes() {
            vm.navRoutes = routes.filter(function (r) {
                return r.config.settings && r.config.settings.nav;
            }).sort(function (r1, r2) {
                return r1.config.settings.nav - r2.config.settings.nav;
            });
        }

        function logOut() {
            authenticator.logOut();
        }

        function toggleSpinner(on) { vm.isBusy = on; }

        $rootScope.$on('$routeChangeStart',
            function (event, next, current) {
                toggleSpinner(true);
            }
        );

        $rootScope.$on(config.events.controllerActivateSuccess,
            function (data) {
                toggleSpinner(false);
            }
        );

        $rootScope.$on(config.events.spinnerToggle,
            function (data) {
                toggleSpinner(data.show);
            }
        );
    }
})();