(function () {
    'use strict';

    var controllerId = 'aboutController';

    angular
        .module('app')
        .controller(controllerId, ['authDataService', 'common', aboutController]);

    function aboutController(authDataService, common) {
        /* jshint validthis:true */
        var vm = this;
        vm.title = 'about';

        activate();

        function activate() {
            common.activateController([], controllerId)
                .then(function() {
                    //do something
                });
        }
    }
})();