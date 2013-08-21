/*jslint browser: true, devel: true */
/*global angular: true, $: true, Markdown: true, ace: true, MathJax: true */

(function() {
  'use strict';

  MathJax.Hub.Config({
    skipStartupTypeset: true,
    messageStyle: "none",
    "HTML-CSS": {
        showMathMenu: false
    }
  });
  MathJax.Hub.Configured();


  angular.module('mathjax', []).directive('mathjax', function() {

    return function(scope, el, attrs, ctrl) {
      var first = true;
      function runMathjax() {
        console.log("mathjaxing");
        MathJax.Hub.Queue(['Typeset', MathJax.Hub, el[0]]);
      }

      var timeoutId;
      scope.$watch(attrs.mathjax, function(value) {
        if (!value) return;
        // Run MathJax directly the first time.
        if (first) {
          runMathjax();
          first = false;
        }
        // Force a delay, running mathjax directly when inputting text causes a slight lag, since it has to run so often.
        clearTimeout(timeoutId);
        timeoutId = setTimeout(function() {
          runMathjax();
        }, 300);
      });
    };
  });


  var app = angular.module('app', ['mathjax', 'ui.ace'], function($routeProvider, $locationProvider) {
    $routeProvider.
      when('/articles', {
        templateUrl: 'articles.html',
        controller: ArticlesCtrl
      }).
      when('/*urn', {
        templateUrl: 'article.html',
        controller: ArticleCtrl
      });
      // otherwise({redirectTo: '/'});
    $locationProvider.html5Mode(true);
  });

  app.filter('markdown', function() {
    var converter = new Markdown.Converter();
    return function(data) {
      if (!data) return;
      return converter.makeHtml(data);
    };
  });


  function ArticleCtrl($scope, $http, $location, $routeParams) {
    console.log('- - - -');
    console.log('ArticleCtrl @ ' + $routeParams.urn);
    window.$scope = $scope;
    $scope.editing = false;
    // document.getElementsByTagName('base')[0].href = (window.location.pathname === '/') ? '/' : (window.location.pathname + '/');
    var baseUrl = $routeParams.urn ? '/' + $routeParams.urn + '/' : '/';
    document.getElementsByTagName('base')[0].href = baseUrl;

    var articleApiPath = '/api/articleByPath/' + ($routeParams.urn || 'index');
    console.log('initiate GET ' + articleApiPath);
    $http.get(articleApiPath).
      success(function(data) {
        var msg = 'success  GET ' + articleApiPath;
        console.log(msg, arguments);
        $scope.article = data;
        // $scope.$apply(); // TODO: Not needed?
        window.document.title = data.title + ' | Viktor Qvarfordt';
      }).
      error(function(data) {
        var msg = 'error    GET ' + articleApiPath;
        console.log(msg, arguments);
        alert(msg);
      });

    document.addEventListener('keydown', function(e) {
      // ctrl + e
      if (e.keyCode === 69 && e.ctrlKey) {
        console.log('ctrl + e');
        e.preventDefault();
        $scope.editing = !$scope.editing;
        $scope.$apply();
      }
      // ctrl + s
      else if (e.keyCode === 83 && e.ctrlKey) {
        console.log('ctrl + s');
        e.preventDefault();
        // $http.put('/api/articleById/' + $scope.article._id, $scope.article).
        console.log('initiate PUT ' + articleApiPath);
        $http.put(articleApiPath, $scope.article).
          success(function() {
            var msg = 'success  PUT ' + articleApiPath;
            console.log(msg, arguments);
            alert(msg);
          }).
          error(function() {
            var msg = 'error    PUT ' + articleApiPath;
            console.log(msg, arguments);
            alert(msg);
          });
        $scope.$apply();
      }
    });

    $scope.$watch('editing', function() {
      if ($scope.editing) {
        console.log('enabling editor');
        $scope.editor && $scope.editor.focus();
      }
    });

    $scope.delArticle = function() {
      console.log('NOT IMPLEMENTED(?)');
      return;
      // console.log('init DEL' + articleApiPath);
      // $http.delete('/api/articleById/' + $scope.article._id).
      //   success(function() {
      //     console.log('deleted', arguments);
      //     alert('deleted');
      //   }).
      //   error(function() {
      //     console.log('error', arguments);
      //     alert('error');
      //   });
      // $scope.$apply();
    };

    $scope.aceLoaded = function(editor) {
      $scope.editor = editor;
      var session = editor.getSession();
      session.setMode('ace/mode/markdown');
      // editor.setTheme("ace/theme/monokai");
      editor.setHighlightActiveLine(false);
      editor.renderer.setShowGutter(false);
      session.setUseWrapMode(true);
      editor.setShowPrintMargin(false);
    };

  }


  function ArticlesCtrl($scope, $http) {
    console.log("ArticlesCtrl");
    $http.get('/api/articles').success(function(data) {
      $scope.articles = data;
    });
  }


}());