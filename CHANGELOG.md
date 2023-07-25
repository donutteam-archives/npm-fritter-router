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