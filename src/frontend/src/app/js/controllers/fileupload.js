GLClient.controller('WBFileUploadCtrl', ['$scope', '$route', function($scope, $route) {
  $scope.disabled = false;

  if ($scope.session && $scope.session.role === 'receiver') { $scope.disabled = true; }

  $scope.onFileAdded = function($event, $file, $flow) {
    if ($file.size > $scope.node.maximum_filesize * 1024 * 1024) {
      $file.error = true;
      $file.error_msg = "This file exceeds the maximum upload size for this server.";
      $event.preventDefault();
    } else {
      if ($scope.field !== undefined && !$scope.field.multi_entry) {
        // if the field allows to load only one file disable the button
        // as soon as a file is loaded.
        $scope.disabled = true;
      }
    }
  };
}]);
