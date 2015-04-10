(function () {
    'use strict';

    var controllerId = 'loginController';

    angular
        .module('app')
        .controller(controllerId, ['$location', 'authenticator', 'common', login]);

    function login($location, authenticator, common) {

        /* jshint validthis:true */
        var vm = this;
        
        vm.title = 'login';
        vm.loginData = {
            userName: '',
            password: '',
            origin: common.newGuid()
        };
        vm.message = '';
        vm.loginUser = loginUser;
        vm.useAdmin = useAdmin;
        vm.useUser = useUser;
        vm.selectedTenant = '';
        vm.authentication = authenticator.authData;

        activate();

        function activate() {
            common.activateController([], controllerId).then(function () {
            });
        }

        function useAdmin() {
            vm.loginData.userName = 'admin@example.com';
            vm.loginData.password = 'Admin@123456';
            loginUser();
        }

        function useUser() {
            vm.loginData.userName = 'user@example.com';
            vm.loginData.password = 'User@123456';
            loginUser();
        }

        function loginUser() {
            authenticator.login(vm.loginData)
                .then(function () {
                    common.logger.logSuccess('Welcome to our world ' + authenticator.authData.userName, true);
                    $location.path('/');
                }, function (error) {
                    vm.message = error.error_description;
                });
        }
    }
})();