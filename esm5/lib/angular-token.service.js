/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
import { Injectable, Optional, Inject, PLATFORM_ID } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { isPlatformServer } from '@angular/common';
import { fromEvent, interval, BehaviorSubject } from 'rxjs';
import { pluck, filter, share, finalize } from 'rxjs/operators';
import { ANGULAR_TOKEN_OPTIONS } from './angular-token.token';
import * as i0 from "@angular/core";
import * as i1 from "@angular/common/http";
import * as i2 from "./angular-token.token";
import * as i3 from "@angular/router";
var AngularTokenService = /** @class */ (function () {
    function AngularTokenService(http, config, platformId, activatedRoute, router) {
        this.http = http;
        this.platformId = platformId;
        this.activatedRoute = activatedRoute;
        this.router = router;
        this.userType = new BehaviorSubject(null);
        this.authData = new BehaviorSubject(null);
        this.userData = new BehaviorSubject(null);
        this.localStorage = {};
        this.global = (typeof window !== 'undefined') ? window : {};
        if (isPlatformServer(this.platformId)) {
            // Bad pratice, needs fixing
            this.global = {
                open: function () { return null; },
                location: {
                    href: '/',
                    origin: '/'
                }
            };
            // Bad pratice, needs fixing
            this.localStorage.setItem = function () { return null; };
            this.localStorage.getItem = function () { return null; };
            this.localStorage.removeItem = function () { return null; };
        }
        else {
            this.localStorage = localStorage;
        }
        /** @type {?} */
        var defaultOptions = {
            apiPath: null,
            apiBase: null,
            signInPath: 'auth/sign_in',
            signInRedirect: null,
            signInStoredUrlStorageKey: null,
            signOutPath: 'auth/sign_out',
            validateTokenPath: 'auth/validate_token',
            signOutFailedValidate: false,
            registerAccountPath: 'auth',
            deleteAccountPath: 'auth',
            registerAccountCallback: this.global.location.href,
            updatePasswordPath: 'auth',
            resetPasswordPath: 'auth/password',
            resetPasswordCallback: this.global.location.href,
            userTypes: null,
            loginField: 'email',
            oAuthBase: this.global.location.origin,
            oAuthPaths: {
                github: 'auth/github'
            },
            oAuthCallbackPath: 'oauth_callback',
            oAuthWindowType: 'newWindow',
            oAuthWindowOptions: null,
        };
        /** @type {?} */
        var mergedOptions = ((/** @type {?} */ (Object))).assign(defaultOptions, config);
        this.options = mergedOptions;
        if (this.options.apiBase === null) {
            console.warn("[angular-token] You have not configured 'apiBase', which may result in security issues. " +
                "Please refer to the documentation at https://github.com/neroniaky/angular-token/wiki");
        }
        this.tryLoadAuthData();
    }
    Object.defineProperty(AngularTokenService.prototype, "currentUserType", {
        get: /**
         * @return {?}
         */
        function () {
            if (this.userType.value != null) {
                return this.userType.value.name;
            }
            else {
                return undefined;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AngularTokenService.prototype, "currentUserData", {
        get: /**
         * @return {?}
         */
        function () {
            return this.userData.value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AngularTokenService.prototype, "currentAuthData", {
        get: /**
         * @return {?}
         */
        function () {
            return this.authData.value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AngularTokenService.prototype, "apiBase", {
        get: /**
         * @return {?}
         */
        function () {
            console.warn('[angular-token] The attribute .apiBase will be removed in the next major release, please use' +
                '.tokenOptions.apiBase instead');
            return this.options.apiBase;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AngularTokenService.prototype, "tokenOptions", {
        get: /**
         * @return {?}
         */
        function () {
            return this.options;
        },
        set: /**
         * @param {?} options
         * @return {?}
         */
        function (options) {
            this.options = ((/** @type {?} */ (Object))).assign(this.options, options);
        },
        enumerable: true,
        configurable: true
    });
    /**
     * @return {?}
     */
    AngularTokenService.prototype.userSignedIn = /**
     * @return {?}
     */
    function () {
        if (this.authData.value == null) {
            return false;
        }
        else {
            return true;
        }
    };
    /**
     * @param {?} route
     * @param {?} state
     * @return {?}
     */
    AngularTokenService.prototype.canActivate = /**
     * @param {?} route
     * @param {?} state
     * @return {?}
     */
    function (route, state) {
        if (this.userSignedIn()) {
            return true;
        }
        else {
            // Store current location in storage (usefull for redirection after signing in)
            if (this.options.signInStoredUrlStorageKey) {
                this.localStorage.setItem(this.options.signInStoredUrlStorageKey, state.url);
            }
            // Redirect user to sign in if signInRedirect is set
            if (this.router && this.options.signInRedirect) {
                this.router.navigate([this.options.signInRedirect]);
            }
            return false;
        }
    };
    /**
     *
     * Actions
     *
     */
    // Register request
    /**
     *
     * Actions
     *
     * @param {?} registerData
     * @param {?=} additionalData
     * @return {?}
     */
    // Register request
    AngularTokenService.prototype.registerAccount = /**
     *
     * Actions
     *
     * @param {?} registerData
     * @param {?=} additionalData
     * @return {?}
     */
    // Register request
    function (registerData, additionalData) {
        registerData = Object.assign({}, registerData);
        if (registerData.userType == null) {
            this.userType.next(null);
        }
        else {
            this.userType.next(this.getUserTypeByName(registerData.userType));
            delete registerData.userType;
        }
        if (registerData.password_confirmation == null &&
            registerData.passwordConfirmation != null) {
            registerData.password_confirmation = registerData.passwordConfirmation;
            delete registerData.passwordConfirmation;
        }
        if (additionalData !== undefined) {
            registerData.additionalData = additionalData;
        }
        /** @type {?} */
        var login = registerData.login;
        delete registerData.login;
        registerData[this.options.loginField] = login;
        registerData.confirm_success_url = this.options.registerAccountCallback;
        return this.http.post(this.getServerPath() + this.options.registerAccountPath, registerData);
    };
    // Delete Account
    // Delete Account
    /**
     * @return {?}
     */
    AngularTokenService.prototype.deleteAccount = 
    // Delete Account
    /**
     * @return {?}
     */
    function () {
        return this.http.delete(this.getServerPath() + this.options.deleteAccountPath);
    };
    // Sign in request and set storage
    // Sign in request and set storage
    /**
     * @param {?} signInData
     * @param {?=} additionalData
     * @return {?}
     */
    AngularTokenService.prototype.signIn = 
    // Sign in request and set storage
    /**
     * @param {?} signInData
     * @param {?=} additionalData
     * @return {?}
     */
    function (signInData, additionalData) {
        var _this = this;
        var _a;
        this.userType.next((signInData.userType == null) ? null : this.getUserTypeByName(signInData.userType));
        /** @type {?} */
        var body = (_a = {},
            _a[this.options.loginField] = signInData.login,
            _a.password = signInData.password,
            _a);
        if (additionalData !== undefined) {
            body.additionalData = additionalData;
        }
        /** @type {?} */
        var observ = this.http.post(this.getServerPath() + this.options.signInPath, body).pipe(share());
        observ.subscribe(function (res) { return _this.userData.next(res.data); });
        return observ;
    };
    /**
     * @param {?} oAuthType
     * @param {?=} registration_token
     * @return {?}
     */
    AngularTokenService.prototype.signInOAuth = /**
     * @param {?} oAuthType
     * @param {?=} registration_token
     * @return {?}
     */
    function (oAuthType, registration_token) {
        /** @type {?} */
        var oAuthPath = this.getOAuthPath(oAuthType);
        /** @type {?} */
        var callbackUrl = this.global.location.origin + "/" + this.options.oAuthCallbackPath;
        /** @type {?} */
        var oAuthWindowType = this.options.oAuthWindowType;
        /** @type {?} */
        var authUrl = this.getOAuthUrl(oAuthPath, callbackUrl, oAuthWindowType, registration_token);
        if (oAuthWindowType === 'newWindow') {
            /** @type {?} */
            var oAuthWindowOptions = this.options.oAuthWindowOptions;
            /** @type {?} */
            var windowOptions = '';
            if (oAuthWindowOptions) {
                for (var key in oAuthWindowOptions) {
                    if (oAuthWindowOptions.hasOwnProperty(key)) {
                        windowOptions += "," + key + "=" + oAuthWindowOptions[key];
                    }
                }
            }
            /** @type {?} */
            var popup = window.open(authUrl, '_blank', "closebuttoncaption=Cancel" + windowOptions);
            return this.requestCredentialsViaPostMessage(popup);
        }
        else if (oAuthWindowType === 'sameWindow') {
            this.global.location.href = authUrl;
            return undefined;
        }
        else {
            throw new Error("Unsupported oAuthWindowType \"" + oAuthWindowType + "\"");
        }
    };
    /**
     * @return {?}
     */
    AngularTokenService.prototype.processOAuthCallback = /**
     * @return {?}
     */
    function () {
        this.getAuthDataFromParams();
    };
    // Sign out request and delete storage
    // Sign out request and delete storage
    /**
     * @return {?}
     */
    AngularTokenService.prototype.signOut = 
    // Sign out request and delete storage
    /**
     * @return {?}
     */
    function () {
        var _this = this;
        return this.http.delete(this.getServerPath() + this.options.signOutPath)
            // Only remove the localStorage and clear the data after the call
            .pipe(finalize(function () {
            _this.localStorage.removeItem('accessToken');
            _this.localStorage.removeItem('client');
            _this.localStorage.removeItem('expiry');
            _this.localStorage.removeItem('tokenType');
            _this.localStorage.removeItem('uid');
            _this.authData.next(null);
            _this.userType.next(null);
            _this.userData.next(null);
        }));
    };
    // Validate token request
    // Validate token request
    /**
     * @return {?}
     */
    AngularTokenService.prototype.validateToken = 
    // Validate token request
    /**
     * @return {?}
     */
    function () {
        var _this = this;
        /** @type {?} */
        var observ = this.http.get(this.getServerPath() + this.options.validateTokenPath).pipe(share());
        observ.subscribe(function (res) { return _this.userData.next(res.data); }, function (error) {
            if (error.status === 401 && _this.options.signOutFailedValidate) {
                _this.signOut();
            }
        });
        return observ;
    };
    // Update password request
    // Update password request
    /**
     * @param {?} updatePasswordData
     * @return {?}
     */
    AngularTokenService.prototype.updatePassword = 
    // Update password request
    /**
     * @param {?} updatePasswordData
     * @return {?}
     */
    function (updatePasswordData) {
        if (updatePasswordData.userType != null) {
            this.userType.next(this.getUserTypeByName(updatePasswordData.userType));
        }
        /** @type {?} */
        var args;
        if (updatePasswordData.passwordCurrent == null) {
            args = {
                password: updatePasswordData.password,
                password_confirmation: updatePasswordData.passwordConfirmation
            };
        }
        else {
            args = {
                current_password: updatePasswordData.passwordCurrent,
                password: updatePasswordData.password,
                password_confirmation: updatePasswordData.passwordConfirmation
            };
        }
        if (updatePasswordData.resetPasswordToken) {
            args.reset_password_token = updatePasswordData.resetPasswordToken;
        }
        /** @type {?} */
        var body = args;
        return this.http.put(this.getServerPath() + this.options.updatePasswordPath, body);
    };
    // Reset password request
    // Reset password request
    /**
     * @param {?} resetPasswordData
     * @return {?}
     */
    AngularTokenService.prototype.resetPassword = 
    // Reset password request
    /**
     * @param {?} resetPasswordData
     * @return {?}
     */
    function (resetPasswordData) {
        var _a;
        this.userType.next((resetPasswordData.userType == null) ? null : this.getUserTypeByName(resetPasswordData.userType));
        /** @type {?} */
        var body = (_a = {},
            _a[this.options.loginField] = resetPasswordData.login,
            _a.redirect_url = this.options.resetPasswordCallback,
            _a);
        return this.http.post(this.getServerPath() + this.options.resetPasswordPath, body);
    };
    /**
     *
     * Construct Paths / Urls
     *
     */
    /**
     *
     * Construct Paths / Urls
     *
     * @private
     * @return {?}
     */
    AngularTokenService.prototype.getUserPath = /**
     *
     * Construct Paths / Urls
     *
     * @private
     * @return {?}
     */
    function () {
        return (this.userType.value == null) ? '' : this.userType.value.path + '/';
    };
    /**
     * @private
     * @return {?}
     */
    AngularTokenService.prototype.getApiPath = /**
     * @private
     * @return {?}
     */
    function () {
        /** @type {?} */
        var constructedPath = '';
        if (this.options.apiBase != null) {
            constructedPath += this.options.apiBase + '/';
        }
        if (this.options.apiPath != null) {
            constructedPath += this.options.apiPath + '/';
        }
        return constructedPath;
    };
    /**
     * @private
     * @return {?}
     */
    AngularTokenService.prototype.getServerPath = /**
     * @private
     * @return {?}
     */
    function () {
        return this.getApiPath() + this.getUserPath();
    };
    /**
     * @private
     * @param {?} oAuthType
     * @return {?}
     */
    AngularTokenService.prototype.getOAuthPath = /**
     * @private
     * @param {?} oAuthType
     * @return {?}
     */
    function (oAuthType) {
        /** @type {?} */
        var oAuthPath;
        oAuthPath = this.options.oAuthPaths[oAuthType];
        if (oAuthPath == null) {
            oAuthPath = "/auth/" + oAuthType;
        }
        return oAuthPath;
    };
    /**
     * @private
     * @param {?} oAuthPath
     * @param {?} callbackUrl
     * @param {?} windowType
     * @param {?=} registration_token
     * @return {?}
     */
    AngularTokenService.prototype.getOAuthUrl = /**
     * @private
     * @param {?} oAuthPath
     * @param {?} callbackUrl
     * @param {?} windowType
     * @param {?=} registration_token
     * @return {?}
     */
    function (oAuthPath, callbackUrl, windowType, registration_token) {
        /** @type {?} */
        var url;
        url = this.options.oAuthBase + "/" + oAuthPath;
        url += "?omniauth_window_type=" + windowType;
        url += "&auth_origin_url=" + encodeURIComponent(callbackUrl);
        url += "&registration_token=" + registration_token;
        if (this.userType.value != null) {
            url += "&resource_class=" + this.userType.value.name;
        }
        return url;
    };
    /**
     *
     * Get Auth Data
     *
     */
    // Try to load auth data
    /**
     *
     * Get Auth Data
     *
     * @private
     * @return {?}
     */
    // Try to load auth data
    AngularTokenService.prototype.tryLoadAuthData = /**
     *
     * Get Auth Data
     *
     * @private
     * @return {?}
     */
    // Try to load auth data
    function () {
        /** @type {?} */
        var userType = this.getUserTypeByName(this.localStorage.getItem('userType'));
        if (userType) {
            this.userType.next(userType);
        }
        this.getAuthDataFromStorage();
        if (this.activatedRoute) {
            this.getAuthDataFromParams();
        }
        // if (this.authData) {
        //     this.validateToken();
        // }
    };
    // Parse Auth data from response
    // Parse Auth data from response
    /**
     * @param {?} data
     * @return {?}
     */
    AngularTokenService.prototype.getAuthHeadersFromResponse = 
    // Parse Auth data from response
    /**
     * @param {?} data
     * @return {?}
     */
    function (data) {
        /** @type {?} */
        var headers = data.headers;
        /** @type {?} */
        var authData = {
            accessToken: headers.get('access-token'),
            client: headers.get('client'),
            expiry: headers.get('expiry'),
            tokenType: headers.get('token-type'),
            uid: headers.get('uid')
        };
        this.setAuthData(authData);
    };
    // Parse Auth data from post message
    // Parse Auth data from post message
    /**
     * @private
     * @param {?} data
     * @return {?}
     */
    AngularTokenService.prototype.getAuthDataFromPostMessage = 
    // Parse Auth data from post message
    /**
     * @private
     * @param {?} data
     * @return {?}
     */
    function (data) {
        /** @type {?} */
        var authData = {
            accessToken: data['auth_token'],
            client: data['client_id'],
            expiry: data['expiry'],
            tokenType: 'Bearer',
            uid: data['uid']
        };
        this.setAuthData(authData);
    };
    // Try to get auth data from storage.
    // Try to get auth data from storage.
    /**
     * @return {?}
     */
    AngularTokenService.prototype.getAuthDataFromStorage = 
    // Try to get auth data from storage.
    /**
     * @return {?}
     */
    function () {
        /** @type {?} */
        var authData = {
            accessToken: this.localStorage.getItem('accessToken'),
            client: this.localStorage.getItem('client'),
            expiry: this.localStorage.getItem('expiry'),
            tokenType: this.localStorage.getItem('tokenType'),
            uid: this.localStorage.getItem('uid')
        };
        if (this.checkAuthData(authData)) {
            this.authData.next(authData);
        }
    };
    // Try to get auth data from url parameters.
    // Try to get auth data from url parameters.
    /**
     * @private
     * @return {?}
     */
    AngularTokenService.prototype.getAuthDataFromParams = 
    // Try to get auth data from url parameters.
    /**
     * @private
     * @return {?}
     */
    function () {
        var _this = this;
        this.activatedRoute.queryParams.subscribe(function (queryParams) {
            /** @type {?} */
            var authData = {
                accessToken: queryParams['token'] || queryParams['auth_token'],
                client: queryParams['client_id'],
                expiry: queryParams['expiry'],
                tokenType: 'Bearer',
                uid: queryParams['uid']
            };
            if (_this.checkAuthData(authData)) {
                _this.authData.next(authData);
            }
        });
    };
    /**
     *
     * Set Auth Data
     *
     */
    // Write auth data to storage
    /**
     *
     * Set Auth Data
     *
     * @private
     * @param {?} authData
     * @return {?}
     */
    // Write auth data to storage
    AngularTokenService.prototype.setAuthData = /**
     *
     * Set Auth Data
     *
     * @private
     * @param {?} authData
     * @return {?}
     */
    // Write auth data to storage
    function (authData) {
        if (this.checkAuthData(authData)) {
            this.authData.next(authData);
            this.localStorage.setItem('accessToken', authData.accessToken);
            this.localStorage.setItem('client', authData.client);
            this.localStorage.setItem('expiry', authData.expiry);
            this.localStorage.setItem('tokenType', authData.tokenType);
            this.localStorage.setItem('uid', authData.uid);
            if (this.userType.value != null) {
                this.localStorage.setItem('userType', this.userType.value.name);
            }
        }
    };
    /**
     *
     * Validate Auth Data
     *
     */
    // Check if auth data complete and if response token is newer
    /**
     *
     * Validate Auth Data
     *
     * @private
     * @param {?} authData
     * @return {?}
     */
    // Check if auth data complete and if response token is newer
    AngularTokenService.prototype.checkAuthData = /**
     *
     * Validate Auth Data
     *
     * @private
     * @param {?} authData
     * @return {?}
     */
    // Check if auth data complete and if response token is newer
    function (authData) {
        if (authData.accessToken != null &&
            authData.client != null &&
            authData.expiry != null &&
            authData.tokenType != null &&
            authData.uid != null) {
            if (this.authData.value != null) {
                return authData.expiry >= this.authData.value.expiry;
            }
            return true;
        }
        return false;
    };
    /**
     *
     * OAuth
     *
     */
    /**
     *
     * OAuth
     *
     * @private
     * @param {?} authWindow
     * @return {?}
     */
    AngularTokenService.prototype.requestCredentialsViaPostMessage = /**
     *
     * OAuth
     *
     * @private
     * @param {?} authWindow
     * @return {?}
     */
    function (authWindow) {
        /** @type {?} */
        var pollerObserv = interval(500);
        /** @type {?} */
        var responseObserv = fromEvent(this.global, 'message').pipe(pluck('data'), filter(this.oAuthWindowResponseFilter));
        responseObserv.subscribe(this.getAuthDataFromPostMessage.bind(this));
        /** @type {?} */
        var pollerSubscription = pollerObserv.subscribe(function () {
            if (authWindow.closed) {
                pollerSubscription.unsubscribe();
            }
            else {
                authWindow.postMessage('requestCredentials', '*');
            }
        });
        return responseObserv;
    };
    /**
     * @private
     * @param {?} data
     * @return {?}
     */
    AngularTokenService.prototype.oAuthWindowResponseFilter = /**
     * @private
     * @param {?} data
     * @return {?}
     */
    function (data) {
        if (data.message === 'deliverCredentials' || data.message === 'authFailure') {
            return data;
        }
    };
    /**
     *
     * Utilities
     *
     */
    // Match user config by user config name
    /**
     *
     * Utilities
     *
     * @private
     * @param {?} name
     * @return {?}
     */
    // Match user config by user config name
    AngularTokenService.prototype.getUserTypeByName = /**
     *
     * Utilities
     *
     * @private
     * @param {?} name
     * @return {?}
     */
    // Match user config by user config name
    function (name) {
        if (name == null || this.options.userTypes == null) {
            return null;
        }
        return this.options.userTypes.find(function (userType) { return userType.name === name; });
    };
    AngularTokenService.decorators = [
        { type: Injectable, args: [{
                    providedIn: 'root',
                },] }
    ];
    /** @nocollapse */
    AngularTokenService.ctorParameters = function () { return [
        { type: HttpClient },
        { type: undefined, decorators: [{ type: Inject, args: [ANGULAR_TOKEN_OPTIONS,] }] },
        { type: Object, decorators: [{ type: Inject, args: [PLATFORM_ID,] }] },
        { type: ActivatedRoute, decorators: [{ type: Optional }] },
        { type: Router, decorators: [{ type: Optional }] }
    ]; };
    /** @nocollapse */ AngularTokenService.ngInjectableDef = i0.defineInjectable({ factory: function AngularTokenService_Factory() { return new AngularTokenService(i0.inject(i1.HttpClient), i0.inject(i2.ANGULAR_TOKEN_OPTIONS), i0.inject(i0.PLATFORM_ID), i0.inject(i3.ActivatedRoute, 8), i0.inject(i3.Router, 8)); }, token: AngularTokenService, providedIn: "root" });
    return AngularTokenService;
}());
export { AngularTokenService };
if (false) {
    /**
     * @type {?}
     * @private
     */
    AngularTokenService.prototype.options;
    /** @type {?} */
    AngularTokenService.prototype.userType;
    /** @type {?} */
    AngularTokenService.prototype.authData;
    /** @type {?} */
    AngularTokenService.prototype.userData;
    /**
     * @type {?}
     * @private
     */
    AngularTokenService.prototype.global;
    /**
     * @type {?}
     * @private
     */
    AngularTokenService.prototype.localStorage;
    /**
     * @type {?}
     * @private
     */
    AngularTokenService.prototype.http;
    /**
     * @type {?}
     * @private
     */
    AngularTokenService.prototype.platformId;
    /**
     * @type {?}
     * @private
     */
    AngularTokenService.prototype.activatedRoute;
    /**
     * @type {?}
     * @private
     */
    AngularTokenService.prototype.router;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5ndWxhci10b2tlbi5zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6Im5nOi8vYW5ndWxhci10b2tlbi8iLCJzb3VyY2VzIjpbImxpYi9hbmd1bGFyLXRva2VuLnNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztBQUFBLE9BQU8sRUFBRSxVQUFVLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxXQUFXLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDMUUsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLEVBQTRELE1BQU0saUJBQWlCLENBQUM7QUFDbkgsT0FBTyxFQUFFLFVBQVUsRUFBbUMsTUFBTSxzQkFBc0IsQ0FBQztBQUNuRixPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQztBQUVuRCxPQUFPLEVBQWMsU0FBUyxFQUFFLFFBQVEsRUFBRSxlQUFlLEVBQUUsTUFBTSxNQUFNLENBQUM7QUFDeEUsT0FBTyxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLFFBQVEsRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBRWhFLE9BQU8sRUFBRSxxQkFBcUIsRUFBRSxNQUFNLHVCQUF1QixDQUFDOzs7OztBQWdCOUQ7SUEyQ0UsNkJBQ1UsSUFBZ0IsRUFDTyxNQUFXLEVBQ2IsVUFBa0IsRUFDM0IsY0FBOEIsRUFDOUIsTUFBYztRQUoxQixTQUFJLEdBQUosSUFBSSxDQUFZO1FBRUssZUFBVSxHQUFWLFVBQVUsQ0FBUTtRQUMzQixtQkFBYyxHQUFkLGNBQWMsQ0FBZ0I7UUFDOUIsV0FBTSxHQUFOLE1BQU0sQ0FBUTtRQVo3QixhQUFRLEdBQThCLElBQUksZUFBZSxDQUFXLElBQUksQ0FBQyxDQUFDO1FBQzFFLGFBQVEsR0FBOEIsSUFBSSxlQUFlLENBQVcsSUFBSSxDQUFDLENBQUM7UUFDMUUsYUFBUSxHQUE4QixJQUFJLGVBQWUsQ0FBVyxJQUFJLENBQUMsQ0FBQztRQUd6RSxpQkFBWSxHQUFrQixFQUFFLENBQUM7UUFTdkMsSUFB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QUFTO1FBQ3pDLElBQUksSUFBSSxDQUFDLE9BQU8sS0FBSyxvQkFBb0IsSUFBSSxJQUFJLENBQUMsT0FBTyxLQUFLLGFBQWEsRUFBRTtZQUMzRSxPQUFPLElBQUksQ0FBQztTQUNiO0lBQ0gsQ0FBQztJQUdEOzs7O09BSUc7SUFFSCx3Q0FBd0M7Ozs7Ozs7Ozs7SUFDaEMsK0NBQWlCOzs7Ozs7Ozs7SUFBekIsVUFBMEIsSUFBWTtRQUNwQyxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLElBQUksSUFBSSxFQUFFO1lBQ2xELE9BQU8sSUFBSSxDQUFDO1NBQ2I7UUFFRCxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLElBQUksQ0FDaEMsVUFBQSxRQUFRLElBQUksT0FBQSxRQUFRLENBQUMsSUFBSSxLQUFLLElBQUksRUFBdEIsQ0FBc0IsQ0FDbkMsQ0FBQztJQUNKLENBQUM7O2dCQWxrQkYsVUFBVSxTQUFDO29CQUNWLFVBQVUsRUFBRSxNQUFNO2lCQUNuQjs7OztnQkF4QlEsVUFBVTtnREFtRWQsTUFBTSxTQUFDLHFCQUFxQjtnQkFDWSxNQUFNLHVCQUE5QyxNQUFNLFNBQUMsV0FBVztnQkFyRWQsY0FBYyx1QkFzRWxCLFFBQVE7Z0JBdEVZLE1BQU0sdUJBdUUxQixRQUFROzs7OEJBeEViO0NBMmxCQyxBQW5rQkQsSUFta0JDO1NBaGtCWSxtQkFBbUI7Ozs7OztJQWdDOUIsc0NBQXFDOztJQUNyQyx1Q0FBaUY7O0lBQ2pGLHVDQUFpRjs7SUFDakYsdUNBQWlGOzs7OztJQUNqRixxQ0FBNkI7Ozs7O0lBRTdCLDJDQUF5Qzs7Ozs7SUFHdkMsbUNBQXdCOzs7OztJQUV4Qix5Q0FBK0M7Ozs7O0lBQy9DLDZDQUFrRDs7Ozs7SUFDbEQscUNBQWtDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSW5qZWN0YWJsZSwgT3B0aW9uYWwsIEluamVjdCwgUExBVEZPUk1fSUQgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IEFjdGl2YXRlZFJvdXRlLCBSb3V0ZXIsIENhbkFjdGl2YXRlLCBBY3RpdmF0ZWRSb3V0ZVNuYXBzaG90LCBSb3V0ZXJTdGF0ZVNuYXBzaG90IH0gZnJvbSAnQGFuZ3VsYXIvcm91dGVyJztcbmltcG9ydCB7IEh0dHBDbGllbnQsIEh0dHBSZXNwb25zZSwgSHR0cEVycm9yUmVzcG9uc2UgfSBmcm9tICdAYW5ndWxhci9jb21tb24vaHR0cCc7XG5pbXBvcnQgeyBpc1BsYXRmb3JtU2VydmVyIH0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uJztcblxuaW1wb3J0IHsgT2JzZXJ2YWJsZSwgZnJvbUV2ZW50LCBpbnRlcnZhbCwgQmVoYXZpb3JTdWJqZWN0IH0gZnJvbSAncnhqcyc7XG5pbXBvcnQgeyBwbHVjaywgZmlsdGVyLCBzaGFyZSwgZmluYWxpemUgfSBmcm9tICdyeGpzL29wZXJhdG9ycyc7XG5cbmltcG9ydCB7IEFOR1VMQVJfVE9LRU5fT1BUSU9OUyB9IGZyb20gJy4vYW5ndWxhci10b2tlbi50b2tlbic7XG5cbmltcG9ydCB7XG4gIFNpZ25JbkRhdGEsXG4gIFJlZ2lzdGVyRGF0YSxcbiAgVXBkYXRlUGFzc3dvcmREYXRhLFxuICBSZXNldFBhc3N3b3JkRGF0YSxcblxuICBVc2VyVHlwZSxcbiAgVXNlckRhdGEsXG4gIEF1dGhEYXRhLFxuICBBcGlSZXNwb25zZSxcblxuICBBbmd1bGFyVG9rZW5PcHRpb25zXG59IGZyb20gJy4vYW5ndWxhci10b2tlbi5tb2RlbCc7XG5cbkBJbmplY3RhYmxlKHtcbiAgcHJvdmlkZWRJbjogJ3Jvb3QnLFxufSlcbmV4cG9ydCBjbGFzcyBBbmd1bGFyVG9rZW5TZXJ2aWNlIGltcGxlbWVudHMgQ2FuQWN0aXZhdGUge1xuXG4gIGdldCBjdXJyZW50VXNlclR5cGUoKTogc3RyaW5nIHtcbiAgICBpZiAodGhpcy51c2VyVHlwZS52YWx1ZSAhPSBudWxsKSB7XG4gICAgICByZXR1cm4gdGhpcy51c2VyVHlwZS52YWx1ZS5uYW1lO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cbiAgfVxuXG4gIGdldCBjdXJyZW50VXNlckRhdGEoKTogVXNlckRhdGEge1xuICAgIHJldHVybiB0aGlzLnVzZXJEYXRhLnZhbHVlO1xuICB9XG5cbiAgZ2V0IGN1cnJlbnRBdXRoRGF0YSgpOiBBdXRoRGF0YSB7XG4gICAgcmV0dXJuIHRoaXMuYXV0aERhdGEudmFsdWU7XG4gIH1cblxuICBnZXQgYXBpQmFzZSgpOiBzdHJpbmcge1xuICAgIGNvbnNvbGUud2FybignW2FuZ3VsYXItdG9rZW5dIFRoZSBhdHRyaWJ1dGUgLmFwaUJhc2Ugd2lsbCBiZSByZW1vdmVkIGluIHRoZSBuZXh0IG1ham9yIHJlbGVhc2UsIHBsZWFzZSB1c2UnICtcbiAgICAnLnRva2VuT3B0aW9ucy5hcGlCYXNlIGluc3RlYWQnKTtcbiAgICByZXR1cm4gdGhpcy5vcHRpb25zLmFwaUJhc2U7XG4gIH1cblxuICBnZXQgdG9rZW5PcHRpb25zKCk6IEFuZ3VsYXJUb2tlbk9wdGlvbnMge1xuICAgIHJldHVybiB0aGlzLm9wdGlvbnM7XG4gIH1cblxuICBzZXQgdG9rZW5PcHRpb25zKG9wdGlvbnM6IEFuZ3VsYXJUb2tlbk9wdGlvbnMpIHtcbiAgICB0aGlzLm9wdGlvbnMgPSAoPGFueT5PYmplY3QpLmFzc2lnbih0aGlzLm9wdGlvbnMsIG9wdGlvbnMpO1xuICB9XG5cbiAgcHJpdmF0ZSBvcHRpb25zOiBBbmd1bGFyVG9rZW5PcHRpb25zO1xuICBwdWJsaWMgdXNlclR5cGU6IEJlaGF2aW9yU3ViamVjdDxVc2VyVHlwZT4gPSBuZXcgQmVoYXZpb3JTdWJqZWN0PFVzZXJUeXBlPihudWxsKTtcbiAgcHVibGljIGF1dGhEYXRhOiBCZWhhdmlvclN1YmplY3Q8QXV0aERhdGE+ID0gbmV3IEJlaGF2aW9yU3ViamVjdDxBdXRoRGF0YT4obnVsbCk7XG4gIHB1YmxpYyB1c2VyRGF0YTogQmVoYXZpb3JTdWJqZWN0PFVzZXJEYXRhPiA9IG5ldyBCZWhhdmlvclN1YmplY3Q8VXNlckRhdGE+KG51bGwpO1xuICBwcml2YXRlIGdsb2JhbDogV2luZG93IHwgYW55O1xuXG4gIHByaXZhdGUgbG9jYWxTdG9yYWdlOiBTdG9yYWdlIHwgYW55ID0ge307XG5cbiAgY29uc3RydWN0b3IoXG4gICAgcHJpdmF0ZSBodHRwOiBIdHRwQ2xpZW50LFxuICAgIEBJbmplY3QoQU5HVUxBUl9UT0tFTl9PUFRJT05TKSBjb25maWc6IGFueSxcbiAgICBASW5qZWN0KFBMQVRGT1JNX0lEKSBwcml2YXRlIHBsYXRmb3JtSWQ6IE9iamVjdCxcbiAgICBAT3B0aW9uYWwoKSBwcml2YXRlIGFjdGl2YXRlZFJvdXRlOiBBY3RpdmF0ZWRSb3V0ZSxcbiAgICBAT3B0aW9uYWwoKSBwcml2YXRlIHJvdXRlcjogUm91dGVyXG4gICkge1xuICAgIHRoaXMuZ2xvYmFsID0gKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnKSA/IHdpbmRvdyA6IHt9O1xuXG4gICAgaWYgKGlzUGxhdGZvcm1TZXJ2ZXIodGhpcy5wbGF0Zm9ybUlkKSkge1xuXG4gICAgICAvLyBCYWQgcHJhdGljZSwgbmVlZHMgZml4aW5nXG4gICAgICB0aGlzLmdsb2JhbCA9IHtcbiAgICAgICAgb3BlbjogKCk6IHZvaWQgPT4gbnVsbCxcbiAgICAgICAgbG9jYXRpb246IHtcbiAgICAgICAgICBocmVmOiAnLycsXG4gICAgICAgICAgb3JpZ2luOiAnLydcbiAgICAgICAgfVxuICAgICAgfTtcblxuICAgICAgLy8gQmFkIHByYXRpY2UsIG5lZWRzIGZpeGluZ1xuICAgICAgdGhpcy5sb2NhbFN0b3JhZ2Uuc2V0SXRlbSA9ICgpOiB2b2lkID0+IG51bGw7XG4gICAgICB0aGlzLmxvY2FsU3RvcmFnZS5nZXRJdGVtID0gKCk6IHZvaWQgPT4gbnVsbDtcbiAgICAgIHRoaXMubG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0gPSAoKTogdm9pZCA9PiBudWxsO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmxvY2FsU3RvcmFnZSA9IGxvY2FsU3RvcmFnZTtcbiAgICB9XG5cbiAgICBjb25zdCBkZWZhdWx0T3B0aW9uczogQW5ndWxhclRva2VuT3B0aW9ucyA9IHtcbiAgICAgIGFwaVBhdGg6ICAgICAgICAgICAgICAgICAgICBudWxsLFxuICAgICAgYXBpQmFzZTogICAgICAgICAgICAgICAgICAgIG51bGwsXG5cbiAgICAgIHNpZ25JblBhdGg6ICAgICAgICAgICAgICAgICAnYXV0aC9zaWduX2luJyxcbiAgICAgIHNpZ25JblJlZGlyZWN0OiAgICAgICAgICAgICBudWxsLFxuICAgICAgc2lnbkluU3RvcmVkVXJsU3RvcmFnZUtleTogIG51bGwsXG5cbiAgICAgIHNpZ25PdXRQYXRoOiAgICAgICAgICAgICAgICAnYXV0aC9zaWduX291dCcsXG4gICAgICB2YWxpZGF0ZVRva2VuUGF0aDogICAgICAgICAgJ2F1dGgvdmFsaWRhdGVfdG9rZW4nLFxuICAgICAgc2lnbk91dEZhaWxlZFZhbGlkYXRlOiAgICAgIGZhbHNlLFxuXG4gICAgICByZWdpc3RlckFjY291bnRQYXRoOiAgICAgICAgJ2F1dGgnLFxuICAgICAgZGVsZXRlQWNjb3VudFBhdGg6ICAgICAgICAgICdhdXRoJyxcbiAgICAgIHJlZ2lzdGVyQWNjb3VudENhbGxiYWNrOiAgICB0aGlzLmdsb2JhbC5sb2NhdGlvbi5ocmVmLFxuXG4gICAgICB1cGRhdGVQYXNzd29yZFBhdGg6ICAgICAgICAgJ2F1dGgnLFxuXG4gICAgICByZXNldFBhc3N3b3JkUGF0aDogICAgICAgICAgJ2F1dGgvcGFzc3dvcmQnLFxuICAgICAgcmVzZXRQYXNzd29yZENhbGxiYWNrOiAgICAgIHRoaXMuZ2xvYmFsLmxvY2F0aW9uLmhyZWYsXG5cbiAgICAgIHVzZXJUeXBlczogICAgICAgICAgICAgICAgICBudWxsLFxuICAgICAgbG9naW5GaWVsZDogICAgICAgICAgICAgICAgICdlbWFpbCcsXG5cbiAgICAgIG9BdXRoQmFzZTogICAgICAgICAgICAgICAgICB0aGlzLmdsb2JhbC5sb2NhdGlvbi5vcmlnaW4sXG4gICAgICBvQXV0aFBhdGhzOiB7XG4gICAgICAgIGdpdGh1YjogICAgICAgICAgICAgICAgICAgJ2F1dGgvZ2l0aHViJ1xuICAgICAgfSxcbiAgICAgIG9BdXRoQ2FsbGJhY2tQYXRoOiAgICAgICAgICAnb2F1dGhfY2FsbGJhY2snLFxuICAgICAgb0F1dGhXaW5kb3dUeXBlOiAgICAgICAgICAgICduZXdXaW5kb3cnLFxuICAgICAgb0F1dGhXaW5kb3dPcHRpb25zOiAgICAgICAgIG51bGwsXG4gICAgfTtcblxuICAgIGNvbnN0IG1lcmdlZE9wdGlvbnMgPSAoPGFueT5PYmplY3QpLmFzc2lnbihkZWZhdWx0T3B0aW9ucywgY29uZmlnKTtcbiAgICB0aGlzLm9wdGlvbnMgPSBtZXJnZWRPcHRpb25zO1xuXG4gICAgaWYgKHRoaXMub3B0aW9ucy5hcGlCYXNlID09PSBudWxsKSB7XG4gICAgICBjb25zb2xlLndhcm4oYFthbmd1bGFyLXRva2VuXSBZb3UgaGF2ZSBub3QgY29uZmlndXJlZCAnYXBpQmFzZScsIHdoaWNoIG1heSByZXN1bHQgaW4gc2VjdXJpdHkgaXNzdWVzLiBgICtcbiAgICAgICAgICAgICAgICAgICBgUGxlYXNlIHJlZmVyIHRvIHRoZSBkb2N1bWVudGF0aW9uIGF0IGh0dHBzOi8vZ2l0aHViLmNvbS9uZXJvbmlha3kvYW5ndWxhci10b2tlbi93aWtpYCk7XG4gICAgfVxuXG4gICAgdGhpcy50cnlMb2FkQXV0aERhdGEoKTtcbiAgfVxuXG4gIHVzZXJTaWduZWRJbigpOiBib29sZWFuIHtcbiAgICBpZiAodGhpcy5hdXRoRGF0YS52YWx1ZSA9PSBudWxsKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgfVxuXG4gIGNhbkFjdGl2YXRlKHJvdXRlOiBBY3RpdmF0ZWRSb3V0ZVNuYXBzaG90LCBzdGF0ZTogUm91dGVyU3RhdGVTbmFwc2hvdCk6IGJvb2xlYW4ge1xuICAgIGlmICh0aGlzLnVzZXJTaWduZWRJbigpKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gU3RvcmUgY3VycmVudCBsb2NhdGlvbiBpbiBzdG9yYWdlICh1c2VmdWxsIGZvciByZWRpcmVjdGlvbiBhZnRlciBzaWduaW5nIGluKVxuICAgICAgaWYgKHRoaXMub3B0aW9ucy5zaWduSW5TdG9yZWRVcmxTdG9yYWdlS2V5KSB7XG4gICAgICAgIHRoaXMubG9jYWxTdG9yYWdlLnNldEl0ZW0oXG4gICAgICAgICAgdGhpcy5vcHRpb25zLnNpZ25JblN0b3JlZFVybFN0b3JhZ2VLZXksXG4gICAgICAgICAgc3RhdGUudXJsXG4gICAgICAgICk7XG4gICAgICB9XG5cbiAgICAgIC8vIFJlZGlyZWN0IHVzZXIgdG8gc2lnbiBpbiBpZiBzaWduSW5SZWRpcmVjdCBpcyBzZXRcbiAgICAgIGlmICh0aGlzLnJvdXRlciAmJiB0aGlzLm9wdGlvbnMuc2lnbkluUmVkaXJlY3QpIHtcbiAgICAgICAgdGhpcy5yb3V0ZXIubmF2aWdhdGUoW3RoaXMub3B0aW9ucy5zaWduSW5SZWRpcmVjdF0pO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG5cblxuICAvKipcbiAgICpcbiAgICogQWN0aW9uc1xuICAgKlxuICAgKi9cblxuICAvLyBSZWdpc3RlciByZXF1ZXN0XG4gIHJlZ2lzdGVyQWNjb3VudChyZWdpc3RlckRhdGE6IFJlZ2lzdGVyRGF0YSwgYWRkaXRpb25hbERhdGE/OiBhbnkpOiBPYnNlcnZhYmxlPEFwaVJlc3BvbnNlPiB7XG5cbiAgICByZWdpc3RlckRhdGEgPSBPYmplY3QuYXNzaWduKHt9LCByZWdpc3RlckRhdGEpO1xuXG4gICAgaWYgKHJlZ2lzdGVyRGF0YS51c2VyVHlwZSA9PSBudWxsKSB7XG4gICAgICB0aGlzLnVzZXJUeXBlLm5leHQobnVsbCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMudXNlclR5cGUubmV4dCh0aGlzLmdldFVzZXJUeXBlQnlOYW1lKHJlZ2lzdGVyRGF0YS51c2VyVHlwZSkpO1xuICAgICAgZGVsZXRlIHJlZ2lzdGVyRGF0YS51c2VyVHlwZTtcbiAgICB9XG5cbiAgICBpZiAoXG4gICAgICByZWdpc3RlckRhdGEucGFzc3dvcmRfY29uZmlybWF0aW9uID09IG51bGwgJiZcbiAgICAgIHJlZ2lzdGVyRGF0YS5wYXNzd29yZENvbmZpcm1hdGlvbiAhPSBudWxsXG4gICAgKSB7XG4gICAgICByZWdpc3RlckRhdGEucGFzc3dvcmRfY29uZmlybWF0aW9uID0gcmVnaXN0ZXJEYXRhLnBhc3N3b3JkQ29uZmlybWF0aW9uO1xuICAgICAgZGVsZXRlIHJlZ2lzdGVyRGF0YS5wYXNzd29yZENvbmZpcm1hdGlvbjtcbiAgICB9XG5cbiAgICBpZiAoYWRkaXRpb25hbERhdGEgIT09IHVuZGVmaW5lZCkge1xuICAgICAgcmVnaXN0ZXJEYXRhLmFkZGl0aW9uYWxEYXRhID0gYWRkaXRpb25hbERhdGE7XG4gICAgfVxuXG4gICAgY29uc3QgbG9naW4gPSByZWdpc3RlckRhdGEubG9naW47XG4gICAgZGVsZXRlIHJlZ2lzdGVyRGF0YS5sb2dpbjtcbiAgICByZWdpc3RlckRhdGFbdGhpcy5vcHRpb25zLmxvZ2luRmllbGRdID0gbG9naW47XG5cbiAgICByZWdpc3RlckRhdGEuY29uZmlybV9zdWNjZXNzX3VybCA9IHRoaXMub3B0aW9ucy5yZWdpc3RlckFjY291bnRDYWxsYmFjaztcblxuICAgIHJldHVybiB0aGlzLmh0dHAucG9zdDxBcGlSZXNwb25zZT4oXG4gICAgICB0aGlzLmdldFNlcnZlclBhdGgoKSArIHRoaXMub3B0aW9ucy5yZWdpc3RlckFjY291bnRQYXRoLCByZWdpc3RlckRhdGFcbiAgICApO1xuICB9XG5cbiAgLy8gRGVsZXRlIEFjY291bnRcbiAgZGVsZXRlQWNjb3VudCgpOiBPYnNlcnZhYmxlPEFwaVJlc3BvbnNlPiB7XG4gICAgcmV0dXJuIHRoaXMuaHR0cC5kZWxldGU8QXBpUmVzcG9uc2U+KHRoaXMuZ2V0U2VydmVyUGF0aCgpICsgdGhpcy5vcHRpb25zLmRlbGV0ZUFjY291bnRQYXRoKTtcbiAgfVxuXG4gIC8vIFNpZ24gaW4gcmVxdWVzdCBhbmQgc2V0IHN0b3JhZ2VcbiAgc2lnbkluKHNpZ25JbkRhdGE6IFNpZ25JbkRhdGEsIGFkZGl0aW9uYWxEYXRhPzogYW55KTogT2JzZXJ2YWJsZTxBcGlSZXNwb25zZT4ge1xuICAgIHRoaXMudXNlclR5cGUubmV4dCgoc2lnbkluRGF0YS51c2VyVHlwZSA9PSBudWxsKSA/IG51bGwgOiB0aGlzLmdldFVzZXJUeXBlQnlOYW1lKHNpZ25JbkRhdGEudXNlclR5cGUpKTtcblxuICAgIGNvbnN0IGJvZHkgPSB7XG4gICAgICBbdGhpcy5vcHRpb25zLmxvZ2luRmllbGRdOiBzaWduSW5EYXRhLmxvZ2luLFxuICAgICAgcGFzc3dvcmQ6IHNpZ25JbkRhdGEucGFzc3dvcmRcbiAgICB9O1xuXG4gICAgaWYgKGFkZGl0aW9uYWxEYXRhICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIGJvZHkuYWRkaXRpb25hbERhdGEgPSBhZGRpdGlvbmFsRGF0YTtcbiAgICB9XG5cbiAgICBjb25zdCBvYnNlcnYgPSB0aGlzLmh0dHAucG9zdDxBcGlSZXNwb25zZT4oXG4gICAgICB0aGlzLmdldFNlcnZlclBhdGgoKSArIHRoaXMub3B0aW9ucy5zaWduSW5QYXRoLCBib2R5XG4gICAgKS5waXBlKHNoYXJlKCkpO1xuXG4gICAgb2JzZXJ2LnN1YnNjcmliZShyZXMgPT4gdGhpcy51c2VyRGF0YS5uZXh0KHJlcy5kYXRhKSk7XG5cbiAgICByZXR1cm4gb2JzZXJ2O1xuICB9XG5cbiAgc2lnbkluT0F1dGgob0F1dGhUeXBlOiBzdHJpbmcsIHJlZ2lzdHJhdGlvbl90b2tlbj86IHN0cmluZykge1xuXG4gICAgY29uc3Qgb0F1dGhQYXRoOiBzdHJpbmcgPSB0aGlzLmdldE9BdXRoUGF0aChvQXV0aFR5cGUpO1xuICAgIGNvbnN0IGNhbGxiYWNrVXJsID0gYCR7dGhpcy5nbG9iYWwubG9jYXRpb24ub3JpZ2lufS8ke3RoaXMub3B0aW9ucy5vQXV0aENhbGxiYWNrUGF0aH1gO1xuICAgIGNvbnN0IG9BdXRoV2luZG93VHlwZTogc3RyaW5nID0gdGhpcy5vcHRpb25zLm9BdXRoV2luZG93VHlwZTtcbiAgICBjb25zdCBhdXRoVXJsOiBzdHJpbmcgPSB0aGlzLmdldE9BdXRoVXJsKG9BdXRoUGF0aCwgY2FsbGJhY2tVcmwsIG9BdXRoV2luZG93VHlwZSwgcmVnaXN0cmF0aW9uX3Rva2VuKTtcblxuICAgIGlmIChvQXV0aFdpbmRvd1R5cGUgPT09ICduZXdXaW5kb3cnKSB7XG4gICAgICBjb25zdCBvQXV0aFdpbmRvd09wdGlvbnMgPSB0aGlzLm9wdGlvbnMub0F1dGhXaW5kb3dPcHRpb25zO1xuICAgICAgbGV0IHdpbmRvd09wdGlvbnMgPSAnJztcblxuICAgICAgaWYgKG9BdXRoV2luZG93T3B0aW9ucykge1xuICAgICAgICBmb3IgKGNvbnN0IGtleSBpbiBvQXV0aFdpbmRvd09wdGlvbnMpIHtcbiAgICAgICAgICBpZiAob0F1dGhXaW5kb3dPcHRpb25zLmhhc093blByb3BlcnR5KGtleSkpIHtcbiAgICAgICAgICAgICAgd2luZG93T3B0aW9ucyArPSBgLCR7a2V5fT0ke29BdXRoV2luZG93T3B0aW9uc1trZXldfWA7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHBvcHVwID0gd2luZG93Lm9wZW4oXG4gICAgICAgICAgYXV0aFVybCxcbiAgICAgICAgICAnX2JsYW5rJyxcbiAgICAgICAgICBgY2xvc2VidXR0b25jYXB0aW9uPUNhbmNlbCR7d2luZG93T3B0aW9uc31gXG4gICAgICApO1xuICAgICAgcmV0dXJuIHRoaXMucmVxdWVzdENyZWRlbnRpYWxzVmlhUG9zdE1lc3NhZ2UocG9wdXApO1xuICAgIH0gZWxzZSBpZiAob0F1dGhXaW5kb3dUeXBlID09PSAnc2FtZVdpbmRvdycpIHtcbiAgICAgIHRoaXMuZ2xvYmFsLmxvY2F0aW9uLmhyZWYgPSBhdXRoVXJsO1xuICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBVbnN1cHBvcnRlZCBvQXV0aFdpbmRvd1R5cGUgXCIke29BdXRoV2luZG93VHlwZX1cImApO1xuICAgIH1cbiAgfVxuXG4gIHByb2Nlc3NPQXV0aENhbGxiYWNrKCk6IHZvaWQge1xuICAgIHRoaXMuZ2V0QXV0aERhdGFGcm9tUGFyYW1zKCk7XG4gIH1cblxuICAvLyBTaWduIG91dCByZXF1ZXN0IGFuZCBkZWxldGUgc3RvcmFnZVxuICBzaWduT3V0KCk6IE9ic2VydmFibGU8QXBpUmVzcG9uc2U+IHtcbiAgICByZXR1cm4gdGhpcy5odHRwLmRlbGV0ZTxBcGlSZXNwb25zZT4odGhpcy5nZXRTZXJ2ZXJQYXRoKCkgKyB0aGlzLm9wdGlvbnMuc2lnbk91dFBhdGgpXG4gICAgICAvLyBPbmx5IHJlbW92ZSB0aGUgbG9jYWxTdG9yYWdlIGFuZCBjbGVhciB0aGUgZGF0YSBhZnRlciB0aGUgY2FsbFxuICAgICAgLnBpcGUoXG4gICAgICAgIGZpbmFsaXplKCgpID0+IHtcbiAgICAgICAgICAgIHRoaXMubG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oJ2FjY2Vzc1Rva2VuJyk7XG4gICAgICAgICAgICB0aGlzLmxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKCdjbGllbnQnKTtcbiAgICAgICAgICAgIHRoaXMubG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oJ2V4cGlyeScpO1xuICAgICAgICAgICAgdGhpcy5sb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbSgndG9rZW5UeXBlJyk7XG4gICAgICAgICAgICB0aGlzLmxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKCd1aWQnKTtcblxuICAgICAgICAgICAgdGhpcy5hdXRoRGF0YS5uZXh0KG51bGwpO1xuICAgICAgICAgICAgdGhpcy51c2VyVHlwZS5uZXh0KG51bGwpO1xuICAgICAgICAgICAgdGhpcy51c2VyRGF0YS5uZXh0KG51bGwpO1xuICAgICAgICAgIH1cbiAgICAgICAgKVxuICAgICAgKTtcbiAgfVxuXG4gIC8vIFZhbGlkYXRlIHRva2VuIHJlcXVlc3RcbiAgdmFsaWRhdGVUb2tlbigpOiBPYnNlcnZhYmxlPEFwaVJlc3BvbnNlPiB7XG4gICAgY29uc3Qgb2JzZXJ2ID0gdGhpcy5odHRwLmdldDxBcGlSZXNwb25zZT4oXG4gICAgICB0aGlzLmdldFNlcnZlclBhdGgoKSArIHRoaXMub3B0aW9ucy52YWxpZGF0ZVRva2VuUGF0aFxuICAgICkucGlwZShzaGFyZSgpKTtcblxuICAgIG9ic2Vydi5zdWJzY3JpYmUoXG4gICAgICAocmVzKSA9PiB0aGlzLnVzZXJEYXRhLm5leHQocmVzLmRhdGEpLFxuICAgICAgKGVycm9yKSA9PiB7XG4gICAgICAgIGlmIChlcnJvci5zdGF0dXMgPT09IDQwMSAmJiB0aGlzLm9wdGlvbnMuc2lnbk91dEZhaWxlZFZhbGlkYXRlKSB7XG4gICAgICAgICAgdGhpcy5zaWduT3V0KCk7XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIHJldHVybiBvYnNlcnY7XG4gIH1cblxuICAvLyBVcGRhdGUgcGFzc3dvcmQgcmVxdWVzdFxuICB1cGRhdGVQYXNzd29yZCh1cGRhdGVQYXNzd29yZERhdGE6IFVwZGF0ZVBhc3N3b3JkRGF0YSk6IE9ic2VydmFibGU8QXBpUmVzcG9uc2U+IHtcblxuICAgIGlmICh1cGRhdGVQYXNzd29yZERhdGEudXNlclR5cGUgIT0gbnVsbCkge1xuICAgICAgdGhpcy51c2VyVHlwZS5uZXh0KHRoaXMuZ2V0VXNlclR5cGVCeU5hbWUodXBkYXRlUGFzc3dvcmREYXRhLnVzZXJUeXBlKSk7XG4gICAgfVxuXG4gICAgbGV0IGFyZ3M6IGFueTtcblxuICAgIGlmICh1cGRhdGVQYXNzd29yZERhdGEucGFzc3dvcmRDdXJyZW50ID09IG51bGwpIHtcbiAgICAgIGFyZ3MgPSB7XG4gICAgICAgIHBhc3N3b3JkOiAgICAgICAgICAgICAgIHVwZGF0ZVBhc3N3b3JkRGF0YS5wYXNzd29yZCxcbiAgICAgICAgcGFzc3dvcmRfY29uZmlybWF0aW9uOiAgdXBkYXRlUGFzc3dvcmREYXRhLnBhc3N3b3JkQ29uZmlybWF0aW9uXG4gICAgICB9O1xuICAgIH0gZWxzZSB7XG4gICAgICBhcmdzID0ge1xuICAgICAgICBjdXJyZW50X3Bhc3N3b3JkOiAgICAgICB1cGRhdGVQYXNzd29yZERhdGEucGFzc3dvcmRDdXJyZW50LFxuICAgICAgICBwYXNzd29yZDogICAgICAgICAgICAgICB1cGRhdGVQYXNzd29yZERhdGEucGFzc3dvcmQsXG4gICAgICAgIHBhc3N3b3JkX2NvbmZpcm1hdGlvbjogIHVwZGF0ZVBhc3N3b3JkRGF0YS5wYXNzd29yZENvbmZpcm1hdGlvblxuICAgICAgfTtcbiAgICB9XG5cbiAgICBpZiAodXBkYXRlUGFzc3dvcmREYXRhLnJlc2V0UGFzc3dvcmRUb2tlbikge1xuICAgICAgYXJncy5yZXNldF9wYXNzd29yZF90b2tlbiA9IHVwZGF0ZVBhc3N3b3JkRGF0YS5yZXNldFBhc3N3b3JkVG9rZW47XG4gICAgfVxuXG4gICAgY29uc3QgYm9keSA9IGFyZ3M7XG4gICAgcmV0dXJuIHRoaXMuaHR0cC5wdXQ8QXBpUmVzcG9uc2U+KHRoaXMuZ2V0U2VydmVyUGF0aCgpICsgdGhpcy5vcHRpb25zLnVwZGF0ZVBhc3N3b3JkUGF0aCwgYm9keSk7XG4gIH1cblxuICAvLyBSZXNldCBwYXNzd29yZCByZXF1ZXN0XG4gIHJlc2V0UGFzc3dvcmQocmVzZXRQYXNzd29yZERhdGE6IFJlc2V0UGFzc3dvcmREYXRhKTogT2JzZXJ2YWJsZTxBcGlSZXNwb25zZT4ge1xuXG4gICAgdGhpcy51c2VyVHlwZS5uZXh0KFxuICAgICAgKHJlc2V0UGFzc3dvcmREYXRhLnVzZXJUeXBlID09IG51bGwpID8gbnVsbCA6IHRoaXMuZ2V0VXNlclR5cGVCeU5hbWUocmVzZXRQYXNzd29yZERhdGEudXNlclR5cGUpXG4gICAgKTtcblxuICAgIGNvbnN0IGJvZHkgPSB7XG4gICAgICBbdGhpcy5vcHRpb25zLmxvZ2luRmllbGRdOiByZXNldFBhc3N3b3JkRGF0YS5sb2dpbixcbiAgICAgIHJlZGlyZWN0X3VybDogdGhpcy5vcHRpb25zLnJlc2V0UGFzc3dvcmRDYWxsYmFja1xuICAgIH07XG5cbiAgICByZXR1cm4gdGhpcy5odHRwLnBvc3Q8QXBpUmVzcG9uc2U+KHRoaXMuZ2V0U2VydmVyUGF0aCgpICsgdGhpcy5vcHRpb25zLnJlc2V0UGFzc3dvcmRQYXRoLCBib2R5KTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqXG4gICAqIENvbnN0cnVjdCBQYXRocyAvIFVybHNcbiAgICpcbiAgICovXG5cbiAgcHJpdmF0ZSBnZXRVc2VyUGF0aCgpOiBzdHJpbmcge1xuICAgIHJldHVybiAodGhpcy51c2VyVHlwZS52YWx1ZSA9PSBudWxsKSA/ICcnIDogdGhpcy51c2VyVHlwZS52YWx1ZS5wYXRoICsgJy8nO1xuICB9XG5cbiAgcHJpdmF0ZSBnZXRBcGlQYXRoKCk6IHN0cmluZyB7XG4gICAgbGV0IGNvbnN0cnVjdGVkUGF0aCA9ICcnO1xuXG4gICAgaWYgKHRoaXMub3B0aW9ucy5hcGlCYXNlICE9IG51bGwpIHtcbiAgICAgIGNvbnN0cnVjdGVkUGF0aCArPSB0aGlzLm9wdGlvbnMuYXBpQmFzZSArICcvJztcbiAgICB9XG5cbiAgICBpZiAodGhpcy5vcHRpb25zLmFwaVBhdGggIT0gbnVsbCkge1xuICAgICAgY29uc3RydWN0ZWRQYXRoICs9IHRoaXMub3B0aW9ucy5hcGlQYXRoICsgJy8nO1xuICAgIH1cblxuICAgIHJldHVybiBjb25zdHJ1Y3RlZFBhdGg7XG4gIH1cblxuICBwcml2YXRlIGdldFNlcnZlclBhdGgoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5nZXRBcGlQYXRoKCkgKyB0aGlzLmdldFVzZXJQYXRoKCk7XG4gIH1cblxuICBwcml2YXRlIGdldE9BdXRoUGF0aChvQXV0aFR5cGU6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgbGV0IG9BdXRoUGF0aDogc3RyaW5nO1xuXG4gICAgb0F1dGhQYXRoID0gdGhpcy5vcHRpb25zLm9BdXRoUGF0aHNbb0F1dGhUeXBlXTtcblxuICAgIGlmIChvQXV0aFBhdGggPT0gbnVsbCkge1xuICAgICAgb0F1dGhQYXRoID0gYC9hdXRoLyR7b0F1dGhUeXBlfWA7XG4gICAgfVxuXG4gICAgcmV0dXJuIG9BdXRoUGF0aDtcbiAgfVxuXG4gIHByaXZhdGUgZ2V0T0F1dGhVcmwob0F1dGhQYXRoOiBzdHJpbmcsIGNhbGxiYWNrVXJsOiBzdHJpbmcsIHdpbmRvd1R5cGU6IHN0cmluZywgcmVnaXN0cmF0aW9uX3Rva2VuPzogc3RyaW5nKTogc3RyaW5nIHtcbiAgICBsZXQgdXJsOiBzdHJpbmc7XG5cbiAgICB1cmwgPSAgIGAke3RoaXMub3B0aW9ucy5vQXV0aEJhc2V9LyR7b0F1dGhQYXRofWA7XG4gICAgdXJsICs9ICBgP29tbmlhdXRoX3dpbmRvd190eXBlPSR7d2luZG93VHlwZX1gO1xuICAgIHVybCArPSAgYCZhdXRoX29yaWdpbl91cmw9JHtlbmNvZGVVUklDb21wb25lbnQoY2FsbGJhY2tVcmwpfWA7XG4gICAgdXJsICs9ICBgJnJlZ2lzdHJhdGlvbl90b2tlbj0ke3JlZ2lzdHJhdGlvbl90b2tlbn1gO1xuXG4gICAgaWYgKHRoaXMudXNlclR5cGUudmFsdWUgIT0gbnVsbCkge1xuICAgICAgdXJsICs9IGAmcmVzb3VyY2VfY2xhc3M9JHt0aGlzLnVzZXJUeXBlLnZhbHVlLm5hbWV9YDtcbiAgICB9XG5cbiAgICByZXR1cm4gdXJsO1xuICB9XG5cblxuICAvKipcbiAgICpcbiAgICogR2V0IEF1dGggRGF0YVxuICAgKlxuICAgKi9cblxuICAvLyBUcnkgdG8gbG9hZCBhdXRoIGRhdGFcbiAgcHJpdmF0ZSB0cnlMb2FkQXV0aERhdGEoKTogdm9pZCB7XG5cbiAgICBjb25zdCB1c2VyVHlwZSA9IHRoaXMuZ2V0VXNlclR5cGVCeU5hbWUodGhpcy5sb2NhbFN0b3JhZ2UuZ2V0SXRlbSgndXNlclR5cGUnKSk7XG5cbiAgICBpZiAodXNlclR5cGUpIHtcbiAgICAgIHRoaXMudXNlclR5cGUubmV4dCh1c2VyVHlwZSk7XG4gICAgfVxuXG4gICAgdGhpcy5nZXRBdXRoRGF0YUZyb21TdG9yYWdlKCk7XG5cbiAgICBpZiAodGhpcy5hY3RpdmF0ZWRSb3V0ZSkge1xuICAgICAgdGhpcy5nZXRBdXRoRGF0YUZyb21QYXJhbXMoKTtcbiAgICB9XG5cbiAgICAvLyBpZiAodGhpcy5hdXRoRGF0YSkge1xuICAgIC8vICAgICB0aGlzLnZhbGlkYXRlVG9rZW4oKTtcbiAgICAvLyB9XG4gIH1cblxuICAvLyBQYXJzZSBBdXRoIGRhdGEgZnJvbSByZXNwb25zZVxuICBwdWJsaWMgZ2V0QXV0aEhlYWRlcnNGcm9tUmVzcG9uc2UoZGF0YTogSHR0cFJlc3BvbnNlPGFueT4gfCBIdHRwRXJyb3JSZXNwb25zZSk6IHZvaWQge1xuICAgIGNvbnN0IGhlYWRlcnMgPSBkYXRhLmhlYWRlcnM7XG5cbiAgICBjb25zdCBhdXRoRGF0YTogQXV0aERhdGEgPSB7XG4gICAgICBhY2Nlc3NUb2tlbjogICAgaGVhZGVycy5nZXQoJ2FjY2Vzcy10b2tlbicpLFxuICAgICAgY2xpZW50OiAgICAgICAgIGhlYWRlcnMuZ2V0KCdjbGllbnQnKSxcbiAgICAgIGV4cGlyeTogICAgICAgICBoZWFkZXJzLmdldCgnZXhwaXJ5JyksXG4gICAgICB0b2tlblR5cGU6ICAgICAgaGVhZGVycy5nZXQoJ3Rva2VuLXR5cGUnKSxcbiAgICAgIHVpZDogICAgICAgICAgICBoZWFkZXJzLmdldCgndWlkJylcbiAgICB9O1xuXG4gICAgdGhpcy5zZXRBdXRoRGF0YShhdXRoRGF0YSk7XG4gIH1cblxuICAvLyBQYXJzZSBBdXRoIGRhdGEgZnJvbSBwb3N0IG1lc3NhZ2VcbiAgcHJpdmF0ZSBnZXRBdXRoRGF0YUZyb21Qb3N0TWVzc2FnZShkYXRhOiBhbnkpOiB2b2lkIHtcbiAgICBjb25zdCBhdXRoRGF0YTogQXV0aERhdGEgPSB7XG4gICAgICBhY2Nlc3NUb2tlbjogICAgZGF0YVsnYXV0aF90b2tlbiddLFxuICAgICAgY2xpZW50OiAgICAgICAgIGRhdGFbJ2NsaWVudF9pZCddLFxuICAgICAgZXhwaXJ5OiAgICAgICAgIGRhdGFbJ2V4cGlyeSddLFxuICAgICAgdG9rZW5UeXBlOiAgICAgICdCZWFyZXInLFxuICAgICAgdWlkOiAgICAgICAgICAgIGRhdGFbJ3VpZCddXG4gICAgfTtcblxuICAgIHRoaXMuc2V0QXV0aERhdGEoYXV0aERhdGEpO1xuICB9XG5cbiAgLy8gVHJ5IHRvIGdldCBhdXRoIGRhdGEgZnJvbSBzdG9yYWdlLlxuICBwdWJsaWMgZ2V0QXV0aERhdGFGcm9tU3RvcmFnZSgpOiB2b2lkIHtcblxuICAgIGNvbnN0IGF1dGhEYXRhOiBBdXRoRGF0YSA9IHtcbiAgICAgIGFjY2Vzc1Rva2VuOiAgICB0aGlzLmxvY2FsU3RvcmFnZS5nZXRJdGVtKCdhY2Nlc3NUb2tlbicpLFxuICAgICAgY2xpZW50OiAgICAgICAgIHRoaXMubG9jYWxTdG9yYWdlLmdldEl0ZW0oJ2NsaWVudCcpLFxuICAgICAgZXhwaXJ5OiAgICAgICAgIHRoaXMubG9jYWxTdG9yYWdlLmdldEl0ZW0oJ2V4cGlyeScpLFxuICAgICAgdG9rZW5UeXBlOiAgICAgIHRoaXMubG9jYWxTdG9yYWdlLmdldEl0ZW0oJ3Rva2VuVHlwZScpLFxuICAgICAgdWlkOiAgICAgICAgICAgIHRoaXMubG9jYWxTdG9yYWdlLmdldEl0ZW0oJ3VpZCcpXG4gICAgfTtcblxuICAgIGlmICh0aGlzLmNoZWNrQXV0aERhdGEoYXV0aERhdGEpKSB7XG4gICAgICB0aGlzLmF1dGhEYXRhLm5leHQoYXV0aERhdGEpO1xuICAgIH1cbiAgfVxuXG4gIC8vIFRyeSB0byBnZXQgYXV0aCBkYXRhIGZyb20gdXJsIHBhcmFtZXRlcnMuXG4gIHByaXZhdGUgZ2V0QXV0aERhdGFGcm9tUGFyYW1zKCk6IHZvaWQge1xuICAgIHRoaXMuYWN0aXZhdGVkUm91dGUucXVlcnlQYXJhbXMuc3Vic2NyaWJlKHF1ZXJ5UGFyYW1zID0+IHtcbiAgICAgIGNvbnN0IGF1dGhEYXRhOiBBdXRoRGF0YSA9IHtcbiAgICAgICAgYWNjZXNzVG9rZW46ICAgIHF1ZXJ5UGFyYW1zWyd0b2tlbiddIHx8IHF1ZXJ5UGFyYW1zWydhdXRoX3Rva2VuJ10sXG4gICAgICAgIGNsaWVudDogICAgICAgICBxdWVyeVBhcmFtc1snY2xpZW50X2lkJ10sXG4gICAgICAgIGV4cGlyeTogICAgICAgICBxdWVyeVBhcmFtc1snZXhwaXJ5J10sXG4gICAgICAgIHRva2VuVHlwZTogICAgICAnQmVhcmVyJyxcbiAgICAgICAgdWlkOiAgICAgICAgICAgIHF1ZXJ5UGFyYW1zWyd1aWQnXVxuICAgICAgfTtcblxuICAgICAgaWYgKHRoaXMuY2hlY2tBdXRoRGF0YShhdXRoRGF0YSkpIHtcbiAgICAgICAgdGhpcy5hdXRoRGF0YS5uZXh0KGF1dGhEYXRhKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKlxuICAgKiBTZXQgQXV0aCBEYXRhXG4gICAqXG4gICAqL1xuXG4gIC8vIFdyaXRlIGF1dGggZGF0YSB0byBzdG9yYWdlXG4gIHByaXZhdGUgc2V0QXV0aERhdGEoYXV0aERhdGE6IEF1dGhEYXRhKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuY2hlY2tBdXRoRGF0YShhdXRoRGF0YSkpIHtcblxuICAgICAgdGhpcy5hdXRoRGF0YS5uZXh0KGF1dGhEYXRhKTtcblxuICAgICAgdGhpcy5sb2NhbFN0b3JhZ2Uuc2V0SXRlbSgnYWNjZXNzVG9rZW4nLCBhdXRoRGF0YS5hY2Nlc3NUb2tlbik7XG4gICAgICB0aGlzLmxvY2FsU3RvcmFnZS5zZXRJdGVtKCdjbGllbnQnLCBhdXRoRGF0YS5jbGllbnQpO1xuICAgICAgdGhpcy5sb2NhbFN0b3JhZ2Uuc2V0SXRlbSgnZXhwaXJ5JywgYXV0aERhdGEuZXhwaXJ5KTtcbiAgICAgIHRoaXMubG9jYWxTdG9yYWdlLnNldEl0ZW0oJ3Rva2VuVHlwZScsIGF1dGhEYXRhLnRva2VuVHlwZSk7XG4gICAgICB0aGlzLmxvY2FsU3RvcmFnZS5zZXRJdGVtKCd1aWQnLCBhdXRoRGF0YS51aWQpO1xuXG4gICAgICBpZiAodGhpcy51c2VyVHlwZS52YWx1ZSAhPSBudWxsKSB7XG4gICAgICAgIHRoaXMubG9jYWxTdG9yYWdlLnNldEl0ZW0oJ3VzZXJUeXBlJywgdGhpcy51c2VyVHlwZS52YWx1ZS5uYW1lKTtcbiAgICAgIH1cblxuICAgIH1cbiAgfVxuXG5cbiAgLyoqXG4gICAqXG4gICAqIFZhbGlkYXRlIEF1dGggRGF0YVxuICAgKlxuICAgKi9cblxuICAvLyBDaGVjayBpZiBhdXRoIGRhdGEgY29tcGxldGUgYW5kIGlmIHJlc3BvbnNlIHRva2VuIGlzIG5ld2VyXG4gIHByaXZhdGUgY2hlY2tBdXRoRGF0YShhdXRoRGF0YTogQXV0aERhdGEpOiBib29sZWFuIHtcblxuICAgIGlmIChcbiAgICAgIGF1dGhEYXRhLmFjY2Vzc1Rva2VuICE9IG51bGwgJiZcbiAgICAgIGF1dGhEYXRhLmNsaWVudCAhPSBudWxsICYmXG4gICAgICBhdXRoRGF0YS5leHBpcnkgIT0gbnVsbCAmJlxuICAgICAgYXV0aERhdGEudG9rZW5UeXBlICE9IG51bGwgJiZcbiAgICAgIGF1dGhEYXRhLnVpZCAhPSBudWxsXG4gICAgKSB7XG4gICAgICBpZiAodGhpcy5hdXRoRGF0YS52YWx1ZSAhPSBudWxsKSB7XG4gICAgICAgIHJldHVybiBhdXRoRGF0YS5leHBpcnkgPj0gdGhpcy5hdXRoRGF0YS52YWx1ZS5leHBpcnk7XG4gICAgICB9XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cblxuICAvKipcbiAgICpcbiAgICogT0F1dGhcbiAgICpcbiAgICovXG5cbiAgcHJpdmF0ZSByZXF1ZXN0Q3JlZGVudGlhbHNWaWFQb3N0TWVzc2FnZShhdXRoV2luZG93OiBhbnkpOiBPYnNlcnZhYmxlPGFueT4ge1xuICAgIGNvbnN0IHBvbGxlck9ic2VydiA9IGludGVydmFsKDUwMCk7XG5cbiAgICBjb25zdCByZXNwb25zZU9ic2VydiA9IGZyb21FdmVudCh0aGlzLmdsb2JhbCwgJ21lc3NhZ2UnKS5waXBlKFxuICAgICAgcGx1Y2soJ2RhdGEnKSxcbiAgICAgIGZpbHRlcih0aGlzLm9BdXRoV2luZG93UmVzcG9uc2VGaWx0ZXIpXG4gICAgKTtcblxuICAgIHJlc3BvbnNlT2JzZXJ2LnN1YnNjcmliZShcbiAgICAgIHRoaXMuZ2V0QXV0aERhdGFGcm9tUG9zdE1lc3NhZ2UuYmluZCh0aGlzKVxuICAgICk7XG5cbiAgICBjb25zdCBwb2xsZXJTdWJzY3JpcHRpb24gPSBwb2xsZXJPYnNlcnYuc3Vic2NyaWJlKCgpID0+IHtcbiAgICAgIGlmIChhdXRoV2luZG93LmNsb3NlZCkge1xuICAgICAgICBwb2xsZXJTdWJzY3JpcHRpb24udW5zdWJzY3JpYmUoKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGF1dGhXaW5kb3cucG9zdE1lc3NhZ2UoJ3JlcXVlc3RDcmVkZW50aWFscycsICcqJyk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICByZXR1cm4gcmVzcG9uc2VPYnNlcnY7XG4gIH1cblxuICBwcml2YXRlIG9BdXRoV2luZG93UmVzcG9uc2VGaWx0ZXIoZGF0YTogYW55KTogYW55IHtcbiAgICBpZiAoZGF0YS5tZXNzYWdlID09PSAnZGVsaXZlckNyZWRlbnRpYWxzJyB8fCBkYXRhLm1lc3NhZ2UgPT09ICdhdXRoRmFpbHVyZScpIHtcbiAgICAgIHJldHVybiBkYXRhO1xuICAgIH1cbiAgfVxuXG5cbiAgLyoqXG4gICAqXG4gICAqIFV0aWxpdGllc1xuICAgKlxuICAgKi9cblxuICAvLyBNYXRjaCB1c2VyIGNvbmZpZyBieSB1c2VyIGNvbmZpZyBuYW1lXG4gIHByaXZhdGUgZ2V0VXNlclR5cGVCeU5hbWUobmFtZTogc3RyaW5nKTogVXNlclR5cGUge1xuICAgIGlmIChuYW1lID09IG51bGwgfHwgdGhpcy5vcHRpb25zLnVzZXJUeXBlcyA9PSBudWxsKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5vcHRpb25zLnVzZXJUeXBlcy5maW5kKFxuICAgICAgdXNlclR5cGUgPT4gdXNlclR5cGUubmFtZSA9PT0gbmFtZVxuICAgICk7XG4gIH1cbn1cbiJdfQ==