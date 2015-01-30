(function () {
    'use strict';

    var controllerId = 'loginController';

    angular
        .module('app')
        .controller(controllerId, login);

    login.$inject = ['$scope', '$location', 'authenticator', 'common'];

    function login($scope, $location, authenticator, common) {
        
        //var vm = this;
        $scope.title = 'login';
        $scope.loginData = {
            userName: '',
            password: '',
            origin: common.newGuid()
        };
        $scope.message = '';
        $scope.loginUser = loginUser;
        $scope.useAdmin = useAdmin;
        $scope.useUser = useUser;
        $scope.selectedTenant = '';
        $scope.authentication = authenticator.authData;

        activate();

        function activate() {
            common.activateController([], controllerId).then(function () {
            });
        }

        function useAdmin() {
            $scope.loginData.userName = 'admin@example.com';
            $scope.loginData.password = 'Admin@123456';
            loginUser();
        }

        function useUser() {
            $scope.loginData.userName = 'user@example.com';
            $scope.loginData.password = 'User@123456';
            loginUser();
        }

        function loginUser() {
            authenticator.login($scope.loginData)
                .then(function (response) {
                    common.logger.logSuccess('Welcome to our world ' + authenticator.authData.userName, true);
                    $location.path('/');
                }, function (error) {
                    $scope.message = error.error_description;
                });
        }
    }
})();