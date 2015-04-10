(function () {
    'use strict';

    angular
        .module('app')
        .config(['$logProvider', configLogging]);

    function configLogging ($logProvider) {
        // turn debugging off/on (no info or warn)
        if ($logProvider.debugEnabled) {
            $logProvider.debugEnabled(true);
        }
    }
})();