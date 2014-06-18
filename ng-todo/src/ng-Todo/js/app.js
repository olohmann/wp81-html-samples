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

/// <reference path="../scripts/angular.js" />
/// <reference path="../scripts/angular-ui-router.js" />
/// <reference path="//Microsoft.Phone.WinJS.2.1/js/ui.js" />
/// <reference path="//Microsoft.Phone.WinJS.2.1/js/base.js" />

var app = angular.module('todoApp', ['ui.router', 'ngAnimate', 'winjs']);

app.service('todoSvc', function () {
    var todoItems = [
                { itemId: 1, title: 'clean kitchen' },
                { itemId: 2, title: 'call mum' },
                { itemId: 3, title: 'relax' }
    ];

    return {
        getTodoItems: function() {
            return todoItems;
        },

        getById: function (id) {           
            for (var i = 0; i < todoItems.length; i++) {
                if (todoItems[i].itemId === id) {
                    return todoItems[i];
                }
            }

            return null;
        },        
    }
});

app.controller('todoListCtrl', ['$scope', 'navigationSvc', 'todoSvc', function ($scope, navigationSvc, todoSvc) {    
    $scope.todoItems = todoSvc.getTodoItems();

    $scope.itemClicked = function(e) {
        e.detail.itemPromise.then(function (item) {
            navigationSvc.navigateTo('todoItem', { itemId: item.data.itemId });
        });
    };
}]);

app.controller('todoItemCtrl', ['$scope', '$stateParams', 'navigationSvc', 'todoSvc', function ($scope, $stateParams, navigationSvc, todoSvc) {
    var itemId = parseInt($stateParams.itemId, 10);
    var todoItem = todoSvc.getById(itemId);
    
    $scope.itemId = itemId;
    $scope.itemTitle = todoItem.title;

    $scope.ok = function () {
        todoItem.title = $scope.itemTitle;
        navigationSvc.goBack();
    };

    $scope.cancel = function() {
        navigationSvc.goBack();
    };
}]);

app.config(function ($stateProvider) {
    $stateProvider
     .state('todoList', {
         url: '/todoList',
         templateUrl: '/views/todoListView.html',
         controller: 'todoListCtrl',
     })
    .state('todoItem', {
        url: '/todoItem/:itemId',
        templateUrl: '/views/todoItemView.html',
        controller: 'todoItemCtrl',
    });
});

app.run(function (navigationSvc) {
    navigationSvc.goHome();
});

app.animation('.turnstile-animation', function () {
    return {
        enter: function (element, done) {
            WinJS.UI.Animation.turnstileForwardIn(element[0]).then(done);
        },

        leave: function (element, done) {
            done();
        }
    };
});

app.constant('homeStateName', 'todoList');

(function () {
    var NavigationSvc = function ($q, $state, adapterSvc, homeStateName) {
        WinJS.Navigation.addEventListener('navigating', function (args) {
            var targetState = args.detail.location;
            var angularPromise = $state.go(targetState, args.detail.state);
            args.detail.setPromise(adapterSvc.toWinJSPromise(angularPromise));
        });

        this.goHome = function () {
            return adapterSvc.toAngularPromise(WinJS.Navigation.navigate(homeStateName));
        };

        this.navigateTo = function (view, initialState) {
            return adapterSvc.toAngularPromise(WinJS.Navigation.navigate(view, initialState));
        };

        this.goBack = function() {
            return adapterSvc.toAngularPromise(WinJS.Navigation.back());
        };

        this.goForward = function() {
            return adapterSvc.toAngularPromise(WinJS.Navigation.forward());
        }
    };

    app.service('navigationSvc', NavigationSvc);
}());

app.service('adapterSvc', ['$q', function ($q) {
    return {
        toAngularPromise: function (winjsPromise) {
            var deferred = $q.defer();

            winjsPromise.then(function (value) {
                deferred.resolve(value);
            }, function (err) {
                deferred.reject(err);
            }, function (value) {
                deferred.notify(value);
            });

            return deferred.promise;
        },

        toWinJSPromise: function (angularPromise) {
            var signal = new WinJS._Signal();

            angularPromise.then(function (value) {
                signal.complete(value);
            }, function (err) {
                signal.error(err);
            }, function (value) {
                signal.progress(value);
            });

            return signal.promise;
        }
    }
}]);