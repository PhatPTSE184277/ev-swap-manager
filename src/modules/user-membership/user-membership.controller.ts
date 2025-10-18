import { Controller } from '@nestjs/common';
import { UserMembershipService } from './user-membership.service';

@Controller('user-membership')
export class UserMembershipController {
  constructor(private readonly userMembershipService: UserMembershipService) {}
}
