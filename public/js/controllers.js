'use strict';
angular.module('myApp.controllers', []).
controller('AdminPagesCtrl', ['$scope', '$log', 'pagesFactory',
    function($scope, $log, pagesFactory) {
        pagesFactory.getPages().then(
            function(response) {
                $scope.allPages = response.data;
            },
            function(err) {
                $log.error(err);
            });
        $scope.deletePage = function(id) {
            pagesFactory.deletePage(id);
        };
    }
])
    .controller('AdminLoginCtrl', ['$scope', '$location',
        '$cookies', 'AuthService', '$log', 'flashMessageService',
        function($scope, $location, $cookies, AuthService, $log, flashMessageService) {

            $scope.credentials = {
                username: '',
                password: ''
            };
            $scope.login = function(credentials) {
                AuthService.login(credentials).then(
                    function(res, err) {
                        $cookies.loggedInUser = res.data;
                        $location.path('/admin/pages');
                    },
                    function(err) {
                        $log.log(err);
                        flashMessageService.setMessage(err.data);
                    });
            };
        }
    ])
    .controller('AddEditPageCtrl', ['$scope', '$log', 'pagesFactory',
        '$routeParams', '$location', 'flashMessageService', '$filter',
        function($scope, $log, pagesFactory, $routeParams, $location, flashMessageService, $filter) {
            $scope.pageContent = {};
            $scope.pageContent._id = $routeParams.id;
           
            $scope.heading = "Add a New Page";
            if ($scope.pageContent._id != 0) {
                $scope.heading = "Update Page";
                pagesFactory.getAdminPageContent(
                    $scope.pageContent._id).then(
                    function(response) {
                        $scope.pageContent = response.data;
                        $log.info($scope.pageContent);
                    },
                    function(err) {
                        $log.error(err);
                    });
            }
            $scope.savePage = function() {
                pagesFactory.savePage($scope.pageContent).then(
                    function() {
                        flashMessageService.setMessage("Page Saved Successfully");
                        $location.path('/admin/pages');
                    },
                    function() {
                        $log.error('error saving data');
                    }
                );
            };

            $scope.updateURL = function() {
                $scope.pageContent.url = $filter('formatURL')($scope.pageContent.title);
            };
        }
    ])
    .controller('AppCtrl', ['$scope', 'AuthService',
        'flashMessageService', '$location',
        function($scope, AuthService, flashMessageService, $location) {
            $scope.site = {
                logo: "img/angcms-logo.png",
                footer: "Copyright 2014 Angular CMS"
            };
            $scope.logout = function() {
                AuthService.logout().then(
                    function() {
                        $location.path('/admin/login');
                        flashMessageService.setMessage("Successfully logged out");
                    }, function(err) {
                    	flashMessageService.setMessage("Sorry! Error Trying to log out");
                       
                    });
            };
        }

    ])
    .controller('PageCtrl', ['$scope', 'pagesFactory', '$routeParams', '$sce','$log',
        function($scope, pagesFactory, $routeParams, $sce, $log) {
            var url = $routeParams.url;
          
            if (!url) url = "home";
            pagesFactory.getPageContent(url).then(
                function(response) {
                    $scope.pageContent = {};
                    $scope.pageContent.title = response.data.title;
                    $scope.pageContent.content = $sce.trustAsHtml(
                        response.data.content);
                }, function() {
                    $log.log('Error fetching data');
                });
        }
    ]);
