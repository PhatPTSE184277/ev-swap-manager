import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../../../common/decorators/roles.decorator';
import { RoleName } from '../../../enums/role.enum';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<RoleName[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }
    const { user } = context.switchToHttp().getRequest();
    if (!user) {
      throw new UnauthorizedException('Người dùng chưa đăng nhập hoặc token không hợp lệ');
    }
    const roleName = typeof user.role === 'object' ? user.role.name : user.role;
    return requiredRoles.includes(roleName);
  }
}