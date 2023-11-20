## 2.0.1

* Updating packages.
* Removed `eslint` and `@donutteam/eslint-config` dev dependencies.

## 2.0.0

* Updating packages.
* Removing deprecated fields and methods.
* Removed support for exporting `fritterRouterRoute` and `fritterRouterRoutes`.
* Now allows any of `fritterRouterMiddlewareRoute`, `fritterRouterMiddlewareRoutes`, `route` and `routes` to be a single route or an array to allow more flexibility.

## 1.2.3
Fixed a mistake that caused Node to straight up crash.

## 1.2.2

* Updating packages.
* Renaming various symbols and deprecating the old names. This is to make the library more consistent with the rest of the Fritter ecosystem.
* Added support for exporting routes as `fritterRouterMiddlewareRoute`, `fritterRouterMiddlewareRoutes`, `route` or `routes` from route files loaded with `loadRoutesFile` or `loadRoutesDirectory`.
	* The original `fritterRouterRoute` and `fritterRouterRoutes` are prioritized first.
	* Then `frirterRouterMiddlewareRoute` and `fritterRouterMiddlewareRoutes`.
	* Then `route` and `routes`.

## 1.2.1

* Updated packages.
* Fixed a bug where routeParameters were not decoded when they should have been.

## 1.2.0

* Added the `loadRoutesFile` method. This method takes the path to a JavaScript file that exports `fritterRouterRoute` and/or `fritterRouterRoutes`.
	* This allows multiple routes to be loaded from a single file.
* Updated `loadRoutesDirectory` to use `loadRoutesFile` instead of `loadRoute`.
* Subsequently, the `loadRoute` method has been deprecated.

## 1.1.0
Adding the ability to recursively load routes from a directory.

## 1.0.3
Fixing some stupid mistakes that made no sense and caused this to not really work at all.

## 1.0.2
Setting `type` to `module` in `package.json`.

## 1.0.1
Added missing `index.ts`.

## 1.0.0
Initial release.