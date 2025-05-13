import { clerkMiddleware, createRouteMatcher } from "@clerk/astro/server";

// Rutas que deberían ser accesibles para usuarios no autenticados
const isPublicRoute = createRouteMatcher(["/"]);

// Rutas que requieren autenticación.
// La ruta `/[username]` está implícitamente protegida porque si no es pública,
// y el usuario no está autenticado, será redirigido
const isProtectedRoute = createRouteMatcher(["/[:username](.*)"]);

export const onRequest = clerkMiddleware((auth, context, next) => {
	if (isPublicRoute(context.request)) {
		return next();
	}

	if (!auth().userId) {
		return auth().redirectToSignIn({ returnBackUrl: context.url.toString() });
	}

	return next();
});
