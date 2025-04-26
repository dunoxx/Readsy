import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    if (!requiredRoles) {
      return true;
    }
    
    const { user } = context.switchToHttp().getRequest();
    
    if (!user) {
      throw new UnauthorizedException('Usuário não autenticado');
    }
    
    // Verifica se o usuário tem pelo menos uma das roles exigidas
    const hasRole = requiredRoles.some(role => user.role === role);
    
    if (!hasRole) {
      throw new UnauthorizedException('Usuário não tem permissão para acessar este recurso');
    }
    
    return true;
  }
} 