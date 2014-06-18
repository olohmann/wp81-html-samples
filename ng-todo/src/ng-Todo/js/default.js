/*
This software is provided "AS IS," without any warranty or representation of any kind.
Copyright (C) 2014 Microsoft Corporation
--------------------------------------------------------------------------------
 * This Sample Code is provided for the purpose of illustration only and is not
 * intended to be used in a production environment. THIS SAMPLE CODE AND ANY
 * RELATED INFORMATION ARE PROVIDED "AS IS" WITHOUT WARRANTY OF ANY KIND, EITHER
 * EXPRESSED OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND/OR FITNESS FOR A PARTICULAR PURPOSE. We grant You a
 * nonexclusive, royalty-free right to use and modify the Sample Code and to
 * reproduce and distribute the object code form of the Sample Code, provided
 * that You agree: (i) to not use Our name, logo, or trademarks to market Your
 * software product in which the Sample Code is embedded; (ii) to include a
 * valid copyright notice on Your software product in which the Sample Code is
 * embedded; and (iii) to indemnify, hold harmless, and defend Us and Our
 * suppliers from and against any claims or lawsuits, including attorneys’ fees,
 * that arise or result from the use or distribution of the Sample Code.
--------------------------------------------------------------------------------
*/

(function () {
    "use strict";

    var app = WinJS.Application;
    var activation = Windows.ApplicationModel.Activation;

    app.onactivated = function (args) {
        if (args.detail.kind === activation.ActivationKind.launch) {
            if (args.detail.previousExecutionState !== activation.ApplicationExecutionState.terminated) {
                // TODO: This application has been newly launched. Initialize
                // your application here.
            } else {
                // TODO: This application has been reactivated from suspension.
                // Restore application state here.
            }

            // Bootstrap AngularJS //            
            // Use the Signal class (unfortunately currently private...) 
            // to setup a promise that we can signal as 
            // completed as soon as the AngularJS initialization 
            // is through and we've navigated to the start page.
            // This makes sure that the splash screen will 'hide'
            // the time between ready-DOM and angular bootstrap.
            var angularLoadedSignal = new WinJS._Signal();
            angular.element(document).ready(function () {
                try {
                    angular.bootstrap(document, ['todoApp']);
                    angularLoadedSignal.complete();
                } catch (e) {
                    // Init error is caught when we've already set up the angular app (resume) - Could be done more elegant I guess... 
                    // All other bootstrap errors are just passed through.
                    if (!(typeof e.message == 'string' || e.message instanceof String)) {
                        throw e;
                    }

                    if (e.message.indexOf('[ng:btstrpd]') !== 0) {
                        throw e;
                    }
                }
            });

            // The signal's promise will be completed when angular finishes its initialization.
            args.setPromise(angularLoadedSignal.promise);
        }
    };

    app.oncheckpoint = function (args) {
        // TODO: This application is about to be suspended. Save any state
        // that needs to persist across suspensions here. You might use the
        // WinJS.Application.sessionState object, which is automatically
        // saved and restored across suspension. If you need to complete an
        // asynchronous operation before your application is suspended, call
        // args.setPromise().
    };

    app.start();
})();
