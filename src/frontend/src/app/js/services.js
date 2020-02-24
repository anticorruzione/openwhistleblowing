"use strict";

angular.module('GLServices', ['ngResource']).
  factory('GLCache',['$cacheFactory', function ($cacheFactory) {
    return $cacheFactory('GLCache');
  }]).
  factory('GLResource', ['$resource', 'GLCache', function($resource, GLCache) {
    return function(url, params, actions) {
      var defaults = {
        get:    {method: 'get'},
        query:  {method: 'get', isArray:true},
        update: {method: 'put'}
      };

      actions = angular.extend(defaults, actions);

      return $resource(url, params, actions);
    };
  }]).
  factory('Authentication',
    ['$http', '$location', '$routeParams', '$rootScope', '$timeout', 'UserPreferences', 'ReceiverPreferences',
    function($http, $location, $routeParams, $rootScope, $timeout, UserPreferences, ReceiverPreferences) {
      function Session(){
        var self = this;

        $rootScope.login = function(username, password, cb) {
          $rootScope.loginInProgress = true;

          var success_fn = function(response) {
            self.session = {
              'id': response.data.session_id,
              'user_id': response.data.user_id,
              'username': username,
              'role': response.data.role,
              'state': response.data.state,
              'password_change_needed': response.data.password_change_needed,
              'homepage': '',
              'auth_landing_page': ''
            };

            if (self.session.role === 'admin') {
              self.session.homepage = '#!/admin/landing';
              self.session.auth_landing_page = '/admin/landing';
              self.session.preferencespage = '#!/user/preferences';
              $rootScope.preferences = UserPreferences.get();
            } else if (self.session.role === 'custodian') {
              self.session.homepage = '#!/custodian/identityaccessrequests';
              self.session.auth_landing_page = '/custodian/identityaccessrequests';
              self.session.preferencespage = '#!/user/preferences';
              $rootScope.preferences = UserPreferences.get();
            } else if (self.session.role === 'receiver') {
              self.session.homepage = '#!/receiver/dashboard';
              self.session.auth_landing_page = '/receiver/dashboard';
              self.session.preferencespage = '#!/receiver/preferences';
              $rootScope.preferences = ReceiverPreferences.get();
            } else if (self.session.role === 'whistleblower') {
              self.session.auth_landing_page = '/status';
            }

            // reset login state before returning
            $rootScope.loginInProgress = false;

            if (cb){
              return cb(response);
            }

            if ($routeParams.src) {
              $location.path($routeParams.src);
            } else {
              // Override the auth_landing_page if a password change is needed
              if (self.session.password_change_needed) {
                $location.path('/forcedpasswordchange');
              } else {
                $location.path(self.session.auth_landing_page);
              }
            }

            $location.search('');
          };

          if (username === 'whistleblower') {
            return $http.post('receiptauth', {'receipt': password}).
            then(success_fn).
            catch(function(response) {
              $rootScope.loginInProgress = false;
            });
          } else {
            return $http.post('authentication', {'username': username, 'password': password}).
            then(success_fn).
            catch(function(response) {
              $rootScope.loginInProgress = false;
            });
          }
        };

        self.getLoginUri = function (role, path) {
          var loginUri = "/login";
          if (role === undefined ) {
            if (path === '/status') {
              // If we are whistleblowers on the status page, redirect to homepage
              loginUri = '/';
            } else if (path.indexOf('/admin') === 0) {
              // If we are admins on the /admin(/*) pages, redirect to /admin
              loginUri = '/admin';
            } else if (path.indexOf('/custodian') === 0) {
              // If we are custodians on the /custodian(/*) pages, redirect to /custodian
              loginUri = '/custodian';
            }
          } else if (role === 'whistleblower') {
            loginUri = ('/');
          } else if (role === 'admin') {
            loginUri = '/admin';
          } else if (role === 'custodian') {
            loginUri = '/custodian';
          }

          return loginUri;
        };

        self.keycode = '';

        $rootScope.logout = function() {
          // we use $http['delete'] in place of $http.delete due to
          // the magical IE7/IE8 that do not allow delete as identifier
          // https://github.com/globaleaks/GlobaLeaks/issues/943
          if (self.session.role === 'whistleblower') {
            $http['delete']('receiptauth').then($rootScope.logoutPerformed,
                                                $rootScope.logoutPerformed);
          } else {
            $http['delete']('authentication').then($rootScope.logoutPerformed,
                                                   $rootScope.logoutPerformed);
          }
        };

        $rootScope.loginRedirect = function(sessionExpired) {
          var role = self.session === undefined ? undefined : self.session.role;

          self.session = undefined;

          var source_path = $location.path();

          var redirect_path = self.getLoginUri(role, source_path);

          // Only redirect if we are not already on the login page
          if (source_path !== redirect_path) {
            $location.path(redirect_path);
            if (sessionExpired) {
              $location.search('src=' + source_path);
            }
          }
        };

        $rootScope.logoutPerformed = function() {
          $rootScope.loginRedirect(false);
        };

        self.get_auth_headers = function() {
          var h = {};

          if (self.session) {
            h['X-Session'] = self.session.id;
          }

          if ($rootScope.language) {
            h['GL-Language'] = $rootScope.language;
          }

          return h;
        };

      }

      return new Session();
}]).
  factory('globalInterceptor', ['$q', '$injector', '$rootScope', '$location',
  function($q, $injector, $rootScope, $location) {
    var $http = null;

    /* This interceptor is responsible for keeping track of the HTTP requests
     * that are sent and their result (error or not error) */
    return {
      request: function(config) {
        // A new request should display the loader overlay
        $rootScope.showLoadingPanel = true;
        return config;
      },

      response: function(response) {
        $http = $http || $injector.get('$http');

        $rootScope.pendingRequests = function () {
          return $http.pendingRequests.length;
        };

        // the last response should hide the loader overlay
        if ($http.pendingRequests.length < 1) {
          $rootScope.showLoadingPanel = false;
        }

        return response;
      },

      responseError: function(response) {
        /*
           When the response has failed write the rootScope
           errors array the error message.
        */
        $http = $http || $injector.get('$http');

        if (response.data !== null) {
          var error = {
            'url': response.config.url,
            'message': response.data.error_message,
            'code': response.data.error_code,
            'arguments': response.data.arguments
          };

          /* 30: Not Authenticated / 24: Wrong Authentication */
          if (error.code === 30 || error.code === 24) {
            $rootScope.loginRedirect(error.code === 30);
          }

          $rootScope.errors.push(error);
        }

        if ($http.pendingRequests.length < 1) {
          $rootScope.showLoadingPanel = false;
        }

        return $q.reject(response);
      }
    };
}]).
  factory('Node', ['GLResource', function(GLResource) {
    return new GLResource('node');
}]).
  factory('Contexts', ['GLResource', function(GLResource) {
    return new GLResource('contexts');
}]).
  factory('Receivers', ['GLResource', function(GLResource) {
    return new GLResource('receivers');
}]).
  factory('TokenResource', ['GLResource', function(GLResource) {
    return new GLResource('token/:id', {id: '@id'});
}]).
  factory('SubmissionResource', ['GLResource', function(GLResource) {
    return new GLResource('submission/:id', {id: '@token_id'});
}]).
  // In here we have all the functions that have to do with performing
  // submission requests to the backend
  factory('Submission', ['$q', 'GLResource', '$filter', '$location', '$rootScope', 'Authentication', 'TokenResource', 'SubmissionResource',
      function($q, GLResource, $filter, $location, $rootScope, Authentication, TokenResource, SubmissionResource) {

    return function(fn) {
      /**
       * This factory returns a Submission object that will call the fn
       * callback once all the information necessary for creating a submission
       * has been collected.
       *
       * This means getting the node information, the list of receivers and the
       * list of contexts.
       */
      var self = this;

      self._submission = null;
      self.context = undefined;
      self.receivers = [];
      self.receivers_selected = {};
      self.done = false;

      self.isDisabled = function() {
        return (self.count_selected_receivers() === 0 ||
                self.wait ||
                !self.pow ||
                self.done);
      };

      self.count_selected_receivers = function () {
        var count = 0;

        angular.forEach(self.receivers_selected, function (selected) {
          if (selected) {
            count += 1;
          }
        });

        return count;
      };

      var setCurrentContextReceivers = function(context_id, receivers_ids) {
        self.context = angular.copy($filter('filter')($rootScope.contexts, {"id": context_id})[0]);

        self.receivers_selected = {};
        self.receivers = [];
        angular.forEach($rootScope.receivers, function(receiver) {
          if (self.context.receivers.indexOf(receiver.id) !== -1) {
            self.receivers.push(receiver);

            self.receivers_selected[receiver.id] = false;

            if (receivers_ids.length) {
              if (receivers_ids.indexOf(receiver.id) !== -1) {
                if ((receiver.pgp_key_status === 'enabled' || $rootScope.node.allow_unencrypted) ||
                    receiver.configuration !== 'unselectable') {
                  self.receivers_selected[receiver.id] = true;
                }
              }
            } else {
              if (receiver.pgp_key_status === 'enabled' || $rootScope.node.allow_unencrypted) {
                if (receiver.configuration === 'default') {
                  self.receivers_selected[receiver.id] = self.context.select_all_receivers;
                } else if (receiver.configuration === 'forcefully_selected') {
                  self.receivers_selected[receiver.id] = true;
                }
              }
            }
          }
        });

        // temporary fix for contitions in which receiver selection step is disabled but
        // select_all_receivers is marked false and the admin has forgotten to mark at least
        // one receiver to automtically selected nor the user is coming from a link with
        // explicit receivers selection.
        // in all this conditions we select all receivers for which submission is allowed.
        if (!self.context.allow_recipients_selection) {
          if (self.count_selected_receivers() === 0 && !self.context.select_all_receivers) {
            angular.forEach($rootScope.receivers, function(receiver) {
              if (self.context.receivers.indexOf(receiver.id) !== -1) {
                if (receiver.pgp_key_status === 'enabled' || $rootScope.node.allow_unencrypted) {
                  if (receiver.configuration !== 'unselectable') {
                    self.receivers_selected[receiver.id] = true;
                  }
                }
              }
            });
          }
        }
      };

      /**
       * @name Submission.create
       * @description
       * Create a new submission based on the currently selected context.
       *
       * */
      self.create = function(context_id, receivers_ids, cb) {
        setCurrentContextReceivers(context_id, receivers_ids);

        self._submission = new SubmissionResource({
          context_id: self.context.id,
          receivers: [],
          identity_provided: false,
          answers: {},
          human_captcha_answer: 0,
          proof_of_work_answer: 0,
          graph_captcha_answer: "",
          total_score: 0
        });

        self._token = new TokenResource({'type': 'submission'}).$save(function(token) {
          self._token = token;
          self._submission.token_id = self._token.id;

          if (cb) {
            cb();
          }
        });
      };

      /**
       * @name Submission.submit
       * @description
       * Submit the currently configured submission.
       * This involves setting the receivers of the submission object to those
       * currently selected and setting up the submission fields entered by the
       * whistleblower.
       */
      self.submit = function() {
        if (!self._submission || !self.receivers_selected) {
          return;
        }

        self.done = true;

        self._submission.receivers = [];
        angular.forEach(self.receivers_selected, function(selected, id){
          if (selected) {
            self._submission.receivers.push(id);
          }
        });

        self._submission.$update(function(result){
          if (result) {
            Authentication.keycode = self._submission.receipt;
            $location.url("/receipt");
          }
        });

      };

      fn(self);
    };
}]).
  factory('RTipResource', ['GLResource', function(GLResource) {
    return new GLResource('rtip/:id', {id: '@id'});
}]).
  factory('RTipReceiverResource', ['GLResource', function(GLResource) {
    return new GLResource('rtip/:id/receivers', {id: '@id'});
}]).
  factory('RTipCommentResource', ['GLResource', function(GLResource) {
    return new GLResource('rtip/:id/comments', {id: '@id'});
}]).
factory('RTipStatusResource', ['GLResource', function(GLResource) {
  return new GLResource('rtip/:id/status', {id: '@id'});
}]).
  factory('RTipMessageResource', ['GLResource', function(GLResource) {
    return new GLResource('rtip/:id/messages', {id: '@id'});
}]).
  factory('RTipIdentityAccessRequestResource', ['GLResource', function(GLResource) {
    return new GLResource('rtip/:id/identityaccessrequests', {id: '@id'});
}]).
  factory('RTip', ['$http', '$q', '$filter', 'RTipResource', 'RTipReceiverResource', 'RTipMessageResource', 'RTipCommentResource', 'RTipIdentityAccessRequestResource', 'RTipStatusResource',
          function($http, $q, $filter, RTipResource, RTipReceiverResource, RTipMessageResource, RTipCommentResource, RTipIdentityAccessRequestResource, RTipStatusResource) {
    return function(tipID, fn) {
      var self = this;

      self.tip = RTipResource.get(tipID, function (tip) {
        tip.receivers = RTipReceiverResource.query(tipID);
        tip.comments = tip.enable_comments ? RTipCommentResource.query(tipID) : [];
        tip.messages = tip.enable_messages ? RTipMessageResource.query(tipID) : [];
        tip.status = RTipStatusResource.query(tipID);
        tip.iars = tip.identity_provided ? RTipIdentityAccessRequestResource.query(tipID) : [];

        $q.all([tip.receivers.$promise, tip.comments.$promise, tip.messages.$promise, tip.iars.$promise, tip.status.$promise]).then(function() {
          tip.iars = $filter('orderBy')(tip.iars, 'request_date');
          tip.last_iar = tip.iars.length > 0 ? tip.iars[tip.iars.length - 1] : null;

          tip.newComment = function(content) {
            var c = new RTipCommentResource(tipID);
            c.content = content;
            c.$save(function(newComment) {
              tip.comments.unshift(newComment);
            });
          };

          tip.newMessage = function(content) {
            var m = new RTipMessageResource(tipID);
            m.content = content;
            m.$save(function(newMessage) {
              tip.messages.unshift(newMessage);
            });
          };

          tip.newStatus = function(content) {
            var c = new RTipStatusResource(tipID);
            c.content = content;
            c.$save(function(newStatus) {
              tip.status.unshift(newStatus);
            });
          };

          tip.setVar = function(var_name, var_value) {
            var req = {
              'operation': 'set',
              'args': {
                'key': var_name,
                'value': var_value
              }
            };

            return $http({method: 'PUT', url: '/rtip/' + tip.id, data: req}).then(function (response) {
              tip[var_name] = var_value;
            });

          };

          tip.updateLabel = function(label) {
            return tip.setVar('label', label);
          };

          if (fn) {
            fn(tip);
          }
        });
      });
    };
}]).
  factory('WBTipResource', ['GLResource', function(GLResource) {
    return new GLResource('wbtip');
}]).
  factory('WBTipReceiverResource', ['GLResource', function(GLResource) {
    return new GLResource('wbtip/receivers');
}]).
  factory('WBTipCommentResource', ['GLResource', function(GLResource) {
    return new GLResource('wbtip/comments');
}]).
  factory('WBTipMessageResource', ['GLResource', function(GLResource) {
    return new GLResource('wbtip/messages/:id', {id: '@id'});
}]).
  factory('WBTip', ['$q', '$rootScope', 'WBTipResource', 'WBTipReceiverResource', 'WBTipCommentResource', 'WBTipMessageResource',
      function($q, $rootScope, WBTipResource, WBTipReceiverResource, WBTipCommentResource, WBTipMessageResource) {
    return function(fn) {
      var self = this;

      self.tip = WBTipResource.get(function (tip) {
        tip.receivers = WBTipReceiverResource.query();
        tip.comments = tip.enable_comments ? WBTipCommentResource.query() : [];
        tip.messages = [];

        $q.all([tip.receivers.$promise, tip.comments.$promise]).then(function() {
          tip.msg_receiver_selected = null;
          tip.msg_receivers_selector = [];

          angular.forEach(tip.receivers, function(r1) {
            angular.forEach($rootScope.receivers, function(r2) {
              if (r2.id === r1.id) {
                tip.msg_receivers_selector.push({
                  key: r2.id,
                  value: r2.name
                });
              }
            });
          });

          tip.newComment = function(content) {
            var c = new WBTipCommentResource();
            c.content = content;
            c.$save(function(newComment) {
              tip.comments.unshift(newComment);
            });
          };

          tip.newMessage = function(content) {
            var m = new WBTipMessageResource({id: tip.msg_receiver_selected});
            m.content = content;
            m.$save(function(newMessage) {
              tip.messages.unshift(newMessage);
            });
          };

          tip.updateMessages = function () {
            if (tip.msg_receiver_selected) {
              WBTipMessageResource.query({id: tip.msg_receiver_selected}, function (messageCollection) {
                tip.messages = messageCollection;
              });
            }
          };

          if (fn) {
            fn(tip);
          }
        });
      });
    };
}]).
  factory('WhistleblowerTip', ['$rootScope', function($rootScope){
    return function(keycode, fn) {
      $rootScope.login('whistleblower', keycode).then(function() {
        fn();
      });
    };
}]).
  factory('ReceiverPreferences', ['GLResource', function(GLResource) {
    return new GLResource('receiver/preferences');
}]).
  factory('ReceiverTips', ['GLResource', function(GLResource) {
    return new GLResource('receiver/tips');
}]).
  factory('IdentityAccessRequests', ['GLResource', function(GLResource) {
    return new GLResource('custodian/identityaccessrequests');
}]).
  factory('ReceiverOverview', ['GLResource', function(GLResource) {
    return new GLResource('admin/overview/users');
}]).
  factory('AdminContextResource', ['GLResource', function(GLResource) {
    return new GLResource('admin/contexts/:id', {id: '@id'});
}]).
  factory('AdminQuestionnaireResource', ['GLResource', function(GLResource) {
    return new GLResource('admin/questionnaires/:id', {id: '@id'});
}]).
  factory('AdminStepResource', ['GLResource', function(GLResource) {
    return new GLResource('admin/steps/:id', {id: '@id'});
}]).
  factory('AdminFieldResource', ['GLResource', function(GLResource) {
    return new GLResource('admin/fields/:id',{id: '@id'});
}]).
  factory('AdminFieldTemplateResource', ['GLResource', function(GLResource) {
    return new GLResource('admin/fieldtemplates/:id', {id: '@id'});
}]).
  factory('AdminShorturlResource', ['GLResource', function(GLResource) {
    return new GLResource('admin/shorturls/:id', {id: '@id'});
}]).
  factory('AdminUserResource', ['GLResource', function(GLResource) {
    return new GLResource('admin/users/:id', {id: '@id'});
}]).
  factory('AdminReceiverResource', ['GLResource', function(GLResource) {
    return new GLResource('admin/receivers/:id', {id: '@id'});
}]).
  factory('AdminNodeResource', ['GLResource', function(GLResource) {
    return new GLResource('admin/node');
}]).
  factory('AdminNotificationResource', ['GLResource', function(GLResource) {
    return new GLResource('admin/notification');
}]).
  factory('Admin', ['GLResource', '$q', 'AdminContextResource', 'AdminQuestionnaireResource', 'AdminStepResource', 'AdminFieldResource', 'AdminFieldTemplateResource', 'AdminUserResource', 'AdminReceiverResource', 'AdminNodeResource', 'AdminNotificationResource', 'AdminShorturlResource',
    function(GLResource, $q, AdminContextResource, AdminQuestionnaireResource, AdminStepResource, AdminFieldResource, AdminFieldTemplateResource, AdminUserResource, AdminReceiverResource, AdminNodeResource, AdminNotificationResource, AdminShorturlResource) {
  return function(fn) {
      var self = this;

      self.node = AdminNodeResource.get();
      self.contexts = AdminContextResource.query();
      self.questionnaires = AdminQuestionnaireResource.query();
      self.fieldtemplates = AdminFieldTemplateResource.query();
      self.users = AdminUserResource.query();
      self.receivers = AdminReceiverResource.query();
      self.notification = AdminNotificationResource.get();
      self.shorturls = AdminShorturlResource.query();

      $q.all([self.node.$promise,
              self.contexts.$promise,
              self.questionnaires.$promise,
              self.fieldtemplates.$promise,
              self.receivers.$promise,
              self.notification.$promise,
              self.shorturls.$promise]).then(function() {

        self.new_context = function() {
          var context = new AdminContextResource();
          context.id = '';
          context.name = '';
          context.description = '';
          context.presentation_order = 0;
          context.tip_timetolive = 15;
          context.show_context = true;
          context.show_recipients_details = false;
          context.allow_recipients_selection = false;
          context.show_receivers_in_alphabetical_order = true;
          context.select_all_receivers = false;
          context.maximum_selectable_receivers = 0;
          context.show_small_cards = false;
          context.enable_comments = true;
          context.enable_messages = false;
          context.enable_two_way_comments = true;
          context.enable_two_way_messages = true;
          context.enable_attachments = true;
          context.status_page_message = '';
          context.questionnaire_id = '';
          context.custodians = [];
          context.receivers = [];
          return context;
        };

        self.new_questionnaire = function() {
          var questionnaire = new AdminQuestionnaireResource();
          questionnaire.id = '';
          questionnaire.key = '';
          questionnaire.name = '';
          questionnaire.show_steps_navigation_bar = true;
          questionnaire.steps_navigation_requires_completion = true;
          questionnaire.layout = 'horizontal';
          questionnaire.steps = [];
          questionnaire.editable = true;
          return questionnaire;
        };

        self.new_step = function(questionnaire_id) {
          var step = new AdminStepResource();
          step.id = '';
          step.label = '';
          step.description = '';
          step.presentation_order = 0;
          step.children = [];
          step.questionnaire_id = questionnaire_id;
          step.triggered_by_score = 0;
          return step;
        };

        self.field_attrs = {
          "inputbox": {
            "min_len": {"type": "int", "value": "-1"},
            "max_len": {"type": "int", "value": "-1"},
            "regexp": {"type": "unicode", "value": ""}
          },
          "textarea": {
            "min_len": {"type": "int", "value": "-1"},
            "max_len": {"type": "int", "value": "-1"},
            "regexp": {"type": "unicode", "value": ""}
          },
          "multichoice": {
            "layout_orientation": {"type": "unicode", "value": "vertical"}
          },
          "checkbox": {
            "layout_orientation": {"type": "unicode", "value": "vertical"}
          },
          "tos": {
            "clause": {"type": "unicode", "value": ""},
            "agreement_statement": {"type": "unicode", "value": ""}
          }
        };

        self.get_field_attrs = function(type) {
          if (type in self.field_attrs) {
            return self.field_attrs[type];
          } else {
            return {};
          }
        };

        self.new_field = function(step_id, fieldgroup_id) {
          var field = new AdminFieldResource();
          field.id = '';
          field.key = '';
          field.instance = 'instance';
          field.editable = true;
          field.descriptor_id = '';
          field.label = '';
          field.type = 'inputbox';
          field.description = '';
          field.hint = '';
          field.multi_entry = false;
          field.multi_entry_hint = '';
          field.required = false;
          field.preview = false;
          field.stats_enabled = false;
          field.attrs = {};
          field.options = [];
          field.x = 0;
          field.y = 0;
          field.width = 0;
          field.children = [];
          field.fieldgroup_id = fieldgroup_id;
          field.step_id = step_id;
          field.template_id = '';
          field.triggered_by_score = 0;
          return field;
        };

        self.new_field_from_template = function(template_id, step_id, fieldgroup_id) {
          var field = self.new_field(step_id, fieldgroup_id);
          field.template_id = template_id;
          field.instance = 'reference';
          return field;
        };

        self.new_field_template = function (fieldgroup_id) {
          var field = new AdminFieldTemplateResource();
          field.id = '';
          field.key = '';
          field.instance = 'template';
          field.editable = true;
          field.label = '';
          field.type = 'inputbox';
          field.description = '';
          field.hint = '';
          field.multi_entry = false;
          field.multi_entry_hint = '';
          field.required = false;
          field.preview = false;
          field.stats_enabled = false;
          field.attrs = {};
          field.options = [];
          field.x = 0;
          field.y = 0;
          field.width = 0;
          field.children = [];
          field.fieldgroup_id = fieldgroup_id;
          field.step_id = '';
          field.template_id = '';
          field.triggered_by_score = 0;
          return field;
        };

        self.new_user = function () {
          var user = new AdminUserResource();
          user.id = '';
          user.username = '';
          user.role = 'receiver';
          user.state = 'enable';
          user.deletable = 'true';
          user.password = 'globaleaks';
          user.old_password = '';
          user.password_change_needed = true;
          user.state = 'enabled';
          user.name = '';
          user.description = '';
          user.mail_address = '';
          user.pgp_key_info = '';
          user.pgp_key_fingerprint = '';
          user.pgp_key_remove = false;
          user.pgp_key_public = '';
          user.pgp_key_expiration = '';
          user.pgp_key_status = 'ignored';
          user.language = 'en';
          user.timezone = 0;
          return user;
        };

        self.new_receiver = function () {
          var receiver = new AdminReceiverResource();
          receiver.id = '';
          receiver.username = '';
          receiver.role = 'receiver';
          receiver.state = 'enable';
          receiver.deletable = 'true';
          receiver.configuration = 'default';
          receiver.password = 'globaleaks';
          receiver.old_password = '';
          receiver.password_change_needed = true;
          receiver.state = 'enabled';
          receiver.contexts = [];
          receiver.name = '';
          receiver.description = '';
          receiver.mail_address = '';
          receiver.can_delete_submission = false;
          receiver.can_postpone_expiration = false;
          receiver.tip_notification = true;
          receiver.pgp_key_info = '';
          receiver.pgp_key_fingerprint = '';
          receiver.pgp_key_remove = false;
          receiver.pgp_key_public = '';
          receiver.pgp_key_expiration = '';
          receiver.pgp_key_status = 'ignored';
          receiver.presentation_order = 0;
          receiver.language = 'en';
          receiver.timezone = 0;
          return receiver;
        };

        self.new_shorturl = function () {
          return new AdminShorturlResource();
        };

        fn(this);

      });
    };
}]).
  factory('UserPreferences', ['GLResource', function(GLResource) {
    return new GLResource('preferences', {}, {'update': {method: 'PUT'}});
}]).
  factory('TipOverview', ['GLResource', function(GLResource) {
    return new GLResource('admin/overview/tips');
}]).
  factory('FileOverview', ['GLResource', function(GLResource) {
    return new GLResource('admin/overview/files');
}]).
  factory('StatsCollection', ['GLResource', function(GLResource) {
    return new GLResource('admin/stats/:week_delta', {week_delta: '@week_delta'}, {});
}]).
  factory('AnomaliesCollection', ['GLResource', function(GLResource) {
    return new GLResource('admin/anomalies');
}]).
  factory('ActivitiesCollection', ['GLResource', function(GLResource) {
    return new GLResource('admin/activities/details');
}]).
  factory('StaticFiles', ['GLResource', function(GLResource) {
    return new GLResource('admin/staticfiles');
}]).
  factory('DefaultAppdata', ['GLResource', function(GLResource) {
    return new GLResource('data/appdata_l10n.json', {});
}]).
  factory('passwordWatcher', ['$parse', function($parse) {
    return function(scope, password) {
      /** This is used to watch the new password and check that is
       *  effectively the same. Sets a local variable mismatch_password.
       *
       *  @param {obj} scope the scope under which we should register watchers
       *                     and insert the mismatch_password field.
       *  @param {string} old_password the old password model name.
       *  @param {string} password the new password model name.
       *  @param {string} check_password need to be equal to the new password.
       **/
      scope.mismatch_password = false;
      scope.unsafe_password = false;
      scope.pwdValidLength = true;
      scope.pwdHasLetter = true;
      scope.pwdHasNumber = true;

      var validatePasswordChange = function () {
        if (scope.$eval(password) !== undefined && scope.$eval(password) !== '') {
          scope.pwdValidLength = ( scope.$eval(password)).length >= 8;
          scope.pwdHasLetter = ( /[A-z]/.test(scope.$eval(password))) ? true : false;
          scope.pwdHasNumber = ( /\d/.test(scope.$eval(password))) ? true : false;
          scope.unsafe_password = !(scope.pwdValidLength && scope.pwdHasLetter && scope.pwdHasNumber);
        } else {
          /*
           * This values permits to not show errors when
           * the user has not yed typed any password.
           */
          scope.unsafe_password = false;
          scope.pwdValidLength = true;
          scope.pwdHasLetter = true;
          scope.pwdHasNumber = true;
        }
      };

      scope.$watch(password, function(){
          validatePasswordChange();
      }, true);

    };
}]).
  factory('changePasswordWatcher', ['$parse', function($parse) {
    return function(scope, old_password, password, check_password) {
      /** This is used to watch the new password and check that is
       *  effectively the same. Sets a local variable mismatch_password.
       *
       *  @param {obj} scope the scope under which we should register watchers
       *                     and insert the mismatch_password field.
       *  @param {string} old_password the old password model name.
       *  @param {string} password the new password model name.
       *  @param {string} check_password need to be equal to the new password.
       **/
      scope.invalid = true;

      scope.mismatch_password = false;
      scope.missing_old_password = false;
      scope.unsafe_password = false;

      scope.pwdValidLength = true;
      scope.pwdHasLetter = true;
      scope.pwdHasNumber = true;

      var validatePasswordChange = function () {
        if (scope.$eval(password) !== undefined && scope.$eval(password) !== '') {
          scope.pwdValidLength = (scope.$eval(password)).length >= 8;
          scope.pwdHasLetter = (/[A-z]/.test(scope.$eval(password))) ? true : false;
          scope.pwdHasNumber = ( /\d/.test(scope.$eval(password))) ? true : false;
          scope.unsafe_password = !(scope.pwdValidLength && scope.pwdHasLetter && scope.pwdHasNumber);
        } else {
          /*
           * This values permits to not show errors when
           * the user has not yed typed any password.
           */
          scope.unsafe_password = false;
          scope.pwdValidLength = true;
          scope.pwdHasLetter = true;
          scope.pwdHasNumber = true;
        }

        if (((scope.$eval(password) === undefined || scope.$eval(password) === '') &&
             (scope.$eval(check_password) === undefined || scope.$eval(check_password === ''))) ||
            (scope.$eval(password) === scope.$eval(check_password))) {
          scope.mismatch_password = false;
        } else {
          scope.mismatch_password = true;
        }

        if (scope.$eval(old_password) !== undefined && (scope.$eval(old_password)).length >= 1) {
          scope.missing_old_password = false;
        } else {
          scope.missing_old_password = true;
        }

        scope.invalid = scope.$eval(password) === undefined ||
          scope.$eval(password) === '' ||
          scope.mismatch_password ||
          scope.unsafe_password ||
          scope.missing_old_password;
      };

      scope.$watch(password, function(){
          validatePasswordChange();
      }, true);

      scope.$watch(old_password, function(){
          validatePasswordChange();
      }, true);

      scope.$watch(check_password, function(){
          validatePasswordChange();
      }, true);

    };
}]).
  factory('fieldsUtilities', ['$filter', function($filter) {
      var minY = function(arr) {
        return $filter('min')($filter('map')(arr, 'y'));
      };

      var splitRows = function(fields) {
        var rows = $filter('groupBy')(fields, 'y');
        rows = $filter('toArray')(rows);
        rows = $filter('orderBy')(rows, minY);
        return rows;
      };

      var prepare_field_answers_structure = function(field) {
        if (field.answers_structure === undefined) {
          field.answer_structure = {};
          if (field.type === 'fieldgroup') {
            angular.forEach(field.children, function(child) {
              field.answer_structure[child.id] = [prepare_field_answers_structure(child)];
            });
          }
        }
        return field.answer_structure;
      };

      return {
        minY: minY,
        splitRows: splitRows,
        prepare_field_answers_structure: prepare_field_answers_structure
      };
}]).
  constant('CONSTANTS', {
     /* The email regexp restricts email addresses to less than 400 chars. See #1215 */
     "email_regexp": /^(([\w+-\.]){0,100}[\w]{1,100}@([\w+-\.]){0,100}[\w]{1,100})$/,
     "https_regexp": /^(https:\/\/([a-z0-9-]+)\.(.*)$|^)$/,
     "http_or_https_regexp": /^(http(s?):\/\/([a-z0-9-]+)\.(.*)$|^)$/,
     "tor_regexp": /^http(s?):\/\/[0-9a-z]{16}\.onion$/,
     "shortener_shorturl_regexp": /^\/s\/[a-z0-9]{1,100}$/,
     "shortener_longurl_regexp": /^\/[a-z0-9_\-%?\[\]\'\"]{1,100}$/,
     "timezones": [
        {"timezone": -12.0, "label": "(GMT -12:00) Eniwetok, Kwajalein"},
        {"timezone": -11.0, "label": "(GMT -11:00) Midway Island, Samoa"},
        {"timezone": -10.0, "label": "(GMT -10:00) Hawaii"},
        {"timezone": -9.0, "label": "(GMT -9:00) Alaska"},
        {"timezone": -8.0, "label": "(GMT -8:00) Pacific Time (US &amp; Canada)"},
        {"timezone": -7.0, "label": "(GMT -7:00) Mountain Time (US &amp; Canada)"},
        {"timezone": -6.0, "label": "(GMT -6:00) Central Time (US &amp; Canada), Mexico City"},
        {"timezone": -5.0, "label": "(GMT -5:00) Eastern Time (US &amp; Canada), Bogota, Lima"},
        {"timezone": -4.0, "label": "(GMT -4:00) Atlantic Time (Canada), Caracas, La Paz"},
        {"timezone": -3.5, "label": "(GMT -3:30) Newfoundland"},
        {"timezone": -3.0, "label": "(GMT -3:00) Brazil, Buenos Aires, Georgetown"},
        {"timezone": -2.0, "label": "(GMT -2:00) Mid-Atlantic"},
        {"timezone": -1.0, "label": "(GMT -1:00 hour) Azores, Cape Verde Islands"},
        {"timezone": 0.0, "label": "(GMT) Western Europe Time, London, Lisbon, Casablanca"},
        {"timezone": 1.0, "label": "(GMT +1:00 hour) Brussels, Copenhagen, Madrid, Paris"},
        {"timezone": 2.0, "label": "(GMT +2:00) Kaliningrad, South Africa"},
        {"timezone": 3.0, "label": "(GMT +3:00) Baghdad, Riyadh, Moscow, St. Petersburg"},
        {"timezone": 3.5, "label": "(GMT +3:30) Tehran"},
        {"timezone": 4.0, "label": "(GMT +4:00) Abu Dhabi, Muscat, Baku, Tbilisi"},
        {"timezone": 4.5, "label": "(GMT +4:30) Kabul"},
        {"timezone": 5.0, "label": "(GMT +5:00) Ekaterinburg, Islamabad, Karachi, Tashkent"},
        {"timezone": 5.5, "label": "(GMT +5:30) Bombay, Calcutta, Madras, New Delhi"},
        {"timezone": 5.75, "label": "(GMT +5:45) Kathmandu"},
        {"timezone": 6.0, "label": "(GMT +6:00) Almaty, Dhaka, Colombo"},
        {"timezone": 7.0, "label": "(GMT +7:00) Bangkok, Hanoi, Jakarta"},
        {"timezone": 8.0, "label": "(GMT +8:00) Beijing, Perth, Singapore, Hong Kong"},
        {"timezone": 9.0, "label": "(GMT +9:00) Tokyo, Seoul, Osaka, Sapporo, Yakutsk"},
        {"timezone": 9.5, "label": "(GMT +9:30) Adelaide, Darwin"},
        {"timezone": 10.0, "label": "(GMT +10:00) Eastern Australia, Guam, Vladivostok"},
        {"timezone": 11.0, "label": "(GMT +11:00) Magadan, Solomon Islands, New Caledonia"},
        {"timezone": 12.0, "label": "(GMT +12:00) Auckland, Wellington, Fiji, Kamchatka"}
     ]
}).
  config(['$httpProvider', function($httpProvider) {
    $httpProvider.interceptors.push('globalInterceptor');
}]);
