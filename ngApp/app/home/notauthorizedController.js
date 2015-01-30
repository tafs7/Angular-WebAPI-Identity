(function () {
    'use strict';

    var controllerId = 'notauthorizedController';
    angular
        .module('app')
        .controller(controllerId, notauthorized);

    notauthorized.$inject = ['common'];

    function notauthorized(common) {
        /* jshint validthis:true */
        var vm = this;
        vm.title = 'not authorized';

        activate();

        function activate() {
            common.activateController([], controllerId).then(function () {

            });
        }
    }
})();