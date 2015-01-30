(function () {
    'use strict';

    var controllerId = 'adminOnlyController';

    angular
        .module('app')
        .controller(controllerId, about);

    about.$inject = ['authDataService', 'common'];

    function about(authDataService, common) {
        /* jshint validthis:true */
        var vm = this;
        vm.title = 'Admin Only';

        vm.getPeople = function() {
            authDataService.getPeople().then(function(response) {
                vm.people = response.data;
            });
        }

        activate();

        function activate() {
            common
                .activateController([], controllerId)
                .then(function() {
                
            });
        }
    }
})();