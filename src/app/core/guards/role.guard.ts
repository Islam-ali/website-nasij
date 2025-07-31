import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map, take } from 'rxjs/operators';
import { AuthService } from '../../features/auth/services/auth.service';
import { UserRole } from '../../interfaces/user.interface';

export const roleGuard = (allowedRoles: UserRole[]) => {
  const canActivate: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    return authService.currentUser$.pipe(
      take(1),
      map(user => {
        // If no specific roles are required, allow access
        if (!allowedRoles || allowedRoles.length === 0) {
          return true;
        }

        // If user is not authenticated, redirect to login
        if (!user) {
          authService.redirectUrl = state.url;
          return router.createUrlTree(['/auth/login'], {
            queryParams: { returnUrl: state.url }
          });
        }

        // Check if user has any of the required roles
        const hasRequiredRole = allowedRoles.some(role => user.role === role);
        
        if (hasRequiredRole) {
          return true;
        }

        // User doesn't have required role, redirect to unauthorized or home
        return router.createUrlTree(['/unauthorized']);
      })
    );
  };

  return canActivate;
};
