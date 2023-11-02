//
// Imports
//

import fs from "node:fs";
import path from "node:path";
import url from "node:url";

import { FritterContext, FritterMiddlewareFunction, HTTPMethod } from "@fritter/core";
import { pathToRegexp, Key, ParseOptions, TokensToRegexpOptions } from "path-to-regexp";

//
// Class
//

/** Extensions to the FritterContext made by the FritterRouterMiddleware. */
export interface FritterRouterMiddlewareFritterContext extends FritterContext
{
	/** The parameters extracted from the route's path. */
	routeParameters : { [key : string] : string };
}

/** Options for a FritterRouterMiddleware instance. */
export interface FritterRouterMiddlewareOptions
{
	/** Options passed to the path-to-regexp library this middleware uses. */
	pathToRegexpOptions? : TokensToRegexpOptions & ParseOptions;
}

/** A route that the FritterRouterMiddleware can route requests to. */
export interface FritterRouterMiddlewareRoute
{
	/** The HTTP method of the route. */
	method : HTTPMethod | "ALL";

	/** The path of the route. */
	path : string;

	/** Middleware to execute before the handler. */
	middlewares? : FritterMiddlewareFunction[];

	/** The handler for the route. */
	handler : FritterMiddlewareFunction;
}

/** A middleware that handles routing requests to the correct handler. */
export class FritterRouterMiddleware
{
	/** The middleware function that executes the routing logic. */
	public readonly execute : FritterMiddlewareFunction<FritterRouterMiddlewareFritterContext>;

	/** The routes this middleware will use to route requests. */
	protected readonly routes : FritterRouterMiddlewareRoute[] = [];

	/**
	 * Creates a new FritterRouterMiddleware instance.
	 *
	 * @param options Options for the middleware.
	 */
	public constructor(options : FritterRouterMiddlewareOptions = {})
	{
		this.execute = async (fritterContext : FritterRouterMiddlewareFritterContext, next) =>
		{
			//
			// Initialise Fritter Context
			//

			fritterContext.routeParameters = {};

			//
			// Attempt to Match Route
			//

			for (const route of this.routes)
			{
				//
				// Check Method
				//

				if (route.method != "ALL" && route.method != fritterContext.fritterRequest.getHttpMethod())
				{
					continue;
				}

				//
				// Convert Path to RegExp
				//

				const rawRouteParameters : Key[] = [];

				const regExp = pathToRegexp(route.path, rawRouteParameters, options.pathToRegexpOptions);

				//
				// Try to Match Path
				//

				const matches = regExp.exec(fritterContext.fritterRequest.getPath());

				if (matches == null)
				{
					continue;
				}

				//
				// Add Route Parameters to Fritter Context
				//

				for (const [ matchIndex, match ] of matches.slice(1).entries())
				{
					const rawRouteParameter = rawRouteParameters[matchIndex];

					if (rawRouteParameter != null)
					{
						fritterContext.routeParameters[rawRouteParameter.name] = decodeURIComponent(match);
					}
				}

				//
				// Execute Route
				//

				let currentIndex = -1;

				const middlewares =
					[
						...route.middlewares ?? [],
						route.handler,
					];

				const executeMiddleware = async () =>
				{
					currentIndex += 1;

					const nextMiddleware = middlewares[currentIndex];

					if (nextMiddleware != null)
					{
						await nextMiddleware(fritterContext, executeMiddleware);
					}
					else
					{
						await next();
					}
				};

				await executeMiddleware();

				return;
			}

			//
			// Execute Next Middleware
			//

			await next();
		};
	}

	/**
	 * Adds a route to the router.
	 *
	 * @param route The route to add.
	 */
	public addRoute(route : FritterRouterMiddlewareRoute) : void
	{
		this.routes.push(route);
	}

	/** Gets the routes this router is using. */
	public getRoutes() : FritterRouterMiddlewareRoute[]
	{
		return this.routes;
	}

	/** Attempts to load routes from the given JavaScript file. */
	public async loadRoutesFile(jsFilePath : string) : Promise<FritterRouterMiddlewareRoute[]>
	{
		const routeContainer = await import(url.pathToFileURL(jsFilePath).toString()) as
			{
				fritterRouterMiddlewareRoute? : FritterRouterMiddlewareRoute | FritterRouterMiddlewareRoute[],
				fritterRouterMiddlewareRoutes? : FritterRouterMiddlewareRoute | FritterRouterMiddlewareRoute[],
				route? : FritterRouterMiddlewareRoute | FritterRouterMiddlewareRoute[],
				routes? : FritterRouterMiddlewareRoute | FritterRouterMiddlewareRoute[],
			};

		const routeOrRoutes =
			routeContainer.fritterRouterMiddlewareRoute ??
			routeContainer.fritterRouterMiddlewareRoutes ??
			routeContainer.route ??
			routeContainer.routes;

		if (routeOrRoutes == null)
		{
			return [];
		}

		if (Array.isArray(routeOrRoutes))
		{
			for (const route of routeOrRoutes)
			{
				this.addRoute(route);
			}

			return routeOrRoutes;
		}
		else
		{
			this.addRoute(routeOrRoutes);

			return [ routeOrRoutes ];
		}
	}

	/** Recursively loads all routes in the given directory. */
	public async loadRoutesDirectory(directoryPath : string) : Promise<FritterRouterMiddlewareRoute[]>
	{
		const directoryRoutes : FritterRouterMiddlewareRoute[] = [];

		const directoryEntries = await fs.promises.readdir(directoryPath,
			{
				withFileTypes: true,
			});

		for (const directoryEntry of directoryEntries)
		{
			const directoryEntryPath = path.join(directoryPath, directoryEntry.name);

			if (directoryEntry.isDirectory())
			{
				const subdirectoryRoutes = await this.loadRoutesDirectory(directoryEntryPath);

				directoryRoutes.push(...subdirectoryRoutes);
			}
			else
			{
				const parsedPath = path.parse(directoryEntryPath);

				if (parsedPath.ext != ".js")
				{
					continue;
				}

				const fileRoutes = await this.loadRoutesFile(directoryEntryPath);

				directoryRoutes.push(...fileRoutes);
			}
		}

		return directoryRoutes;
	}

	/**
	 * Removes a route from the router.
	 *
	 * @param route The route to remove.
	 */
	public removeRoute(route : FritterRouterMiddlewareRoute) : void
	{
		const index = this.routes.indexOf(route);

		if (index !== -1)
		{
			this.routes.splice(index, 1);
		}
	}
}