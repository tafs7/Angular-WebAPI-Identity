(function () {
    'use strict';

    angular.module('common').factory('logger', logger);

    logger.$inject = ['$log'];

    function logger($log) {
        var service = {
            log: log,
            logError: logError,
            logSuccess: logSuccess,
            logWarning: logWarning
        };

        return service;

        function log(message, showToast, data, source) {
            logIt(message, data, source, showToast, 'info');
        }

        function logWarning(message, showToast, data, source) {
            logIt(message, data, source, showToast, 'warning');
        }

        function logSuccess(message, showToast, data, source) {
            logIt(message, data, source, showToast, 'success');
        }

        function logError(message, showToast, data, source) {
            logIt(message, data, source, showToast, 'error');
        }

        function logIt(message, data, source, showToast, toastType) {
            var write = (toastType === 'error') ? $log.error : $log.log;
            source = source ? '[' + source + '] ' : '';
            write(source, message, data);
            if (showToast) {
                if (toastType === 'error') {
                    toastr.error(message);
                } else if (toastType === 'warning') {
                    toastr.warning(message);
                } else if (toastType === 'success') {
                    toastr.success(message);
                } else {
                    toastr.info(message);
                }
            }
        }
    }
})();