import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomBytes } from 'crypto';
import * as bcrypt from 'bcrypt';
import { TeamInvitation, InvitationStatus, UserBusiness } from './entities';
import { User } from '../user/user.entity';
import { Business } from '../business/business.entity';
import {
  InviteTeamMemberDto,
  CreateTeamMemberDto,
  AcceptInvitationDto,
  UpdateTeamMemberDto,
  AssignBusinessDto,
} from './dto';
import { Role } from '../../common/enums';

@Injectable()
export class TeamService {
  constructor(
    @InjectRepository(TeamInvitation)
    private readonly invitationRepository: Repository<TeamInvitation>,
    @InjectRepository(UserBusiness)
    private readonly userBusinessRepository: Repository<UserBusiness>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Business)
    private readonly businessRepository: Repository<Business>
  ) {}

  // Get all team members for an enterprise
  async getTeamMembers(enterpriseId: string) {
    const users = await this.userRepository.find({
      where: { enterpriseId },
      select: ['id', 'email', 'firstName', 'lastName', 'role', 'avatar', 'isActive', 'createdAt'],
      order: { createdAt: 'DESC' },
    });

    // Get business assignments for each user
    const membersWithBusinesses = await Promise.all(
      users.map(async (user) => {
        const assignments = await this.userBusinessRepository.find({
          where: { userId: user.id },
          relations: ['business'],
        });
        return {
          ...user,
          businesses: assignments.map((a) => ({
            id: a.business.id,
            name: a.business.name,
            role: a.role,
          })),
        };
      })
    );

    return membersWithBusinesses;
  }

  // Get pending invitations
  async getPendingInvitations(enterpriseId: string) {
    return this.invitationRepository.find({
      where: { enterpriseId, status: InvitationStatus.PENDING },
      order: { createdAt: 'DESC' },
    });
  }

  // Send invitation (Option B)
  async inviteTeamMember(enterpriseId: string, inviterId: string, dto: InviteTeamMemberDto) {
    // Check if user already exists
    const existingUser = await this.userRepository.findOne({ where: { email: dto.email } });
    if (existingUser) {
      if (existingUser.enterpriseId === enterpriseId) {
        throw new ConflictException('User is already a member of this enterprise');
      }
      throw new ConflictException('User already exists with another enterprise');
    }

    // Check for pending invitation
    const existingInvitation = await this.invitationRepository.findOne({
      where: { email: dto.email, enterpriseId, status: InvitationStatus.PENDING },
    });
    if (existingInvitation) {
      throw new ConflictException('An invitation is already pending for this email');
    }

    // Validate business IDs
    if (dto.businessIds?.length) {
      const businesses = await this.businessRepository.find({
        where: dto.businessIds.map((id) => ({ id, enterpriseId })),
      });
      if (businesses.length !== dto.businessIds.length) {
        throw new BadRequestException('Some business IDs are invalid');
      }
    }

    // Create invitation
    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

    const invitation = this.invitationRepository.create({
      email: dto.email,
      enterpriseId,
      role: dto.role,
      invitedBy: inviterId,
      token,
      expiresAt,
      businessIds: dto.businessIds || [],
    });

    await this.invitationRepository.save(invitation);

    // TODO: Send email with invitation link
    // For now, return the token (in production, this would be sent via email)
    return {
      message: 'Invitation sent successfully',
      invitationId: invitation.id,
      // Remove in production - only for testing
      invitationLink: `/accept-invitation?token=${token}`,
    };
  }

  // Accept invitation
  async acceptInvitation(dto: AcceptInvitationDto) {
    const invitation = await this.invitationRepository.findOne({
      where: { token: dto.token, status: InvitationStatus.PENDING },
    });

    if (!invitation) {
      throw new NotFoundException('Invalid or expired invitation');
    }

    if (new Date() > invitation.expiresAt) {
      invitation.status = InvitationStatus.EXPIRED;
      await this.invitationRepository.save(invitation);
      throw new BadRequestException('Invitation has expired');
    }

    // Create user
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = this.userRepository.create({
      email: invitation.email,
      password: hashedPassword,
      firstName: dto.firstName,
      lastName: dto.lastName,
      role: invitation.role,
      enterpriseId: invitation.enterpriseId,
      avatar: `https://ui-avatars.com/api/?name=${dto.firstName}+${dto.lastName}&background=random`,
    });

    await this.userRepository.save(user);

    // Create business assignments
    if (invitation.businessIds?.length) {
      const assignments = invitation.businessIds.map((businessId) =>
        this.userBusinessRepository.create({
          userId: user.id,
          businessId,
          role: invitation.role,
        })
      );
      await this.userBusinessRepository.save(assignments);
    }

    // Mark invitation as accepted
    invitation.status = InvitationStatus.ACCEPTED;
    await this.invitationRepository.save(invitation);

    return { message: 'Account created successfully', userId: user.id };
  }

  // Create team member directly (Option A)
  async createTeamMember(enterpriseId: string, dto: CreateTeamMemberDto) {
    // Check if user already exists
    const existingUser = await this.userRepository.findOne({ where: { email: dto.email } });
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Validate business IDs
    if (dto.businessIds?.length) {
      const businesses = await this.businessRepository.find({
        where: dto.businessIds.map((id) => ({ id, enterpriseId })),
      });
      if (businesses.length !== dto.businessIds.length) {
        throw new BadRequestException('Some business IDs are invalid');
      }
    }

    // Create user with temp password
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = this.userRepository.create({
      email: dto.email,
      password: hashedPassword,
      firstName: dto.firstName,
      lastName: dto.lastName,
      role: dto.role,
      enterpriseId,
      avatar: `https://ui-avatars.com/api/?name=${dto.firstName}+${dto.lastName}&background=random`,
    });

    await this.userRepository.save(user);

    // Create business assignments
    if (dto.businessIds?.length) {
      const assignments = dto.businessIds.map((businessId) =>
        this.userBusinessRepository.create({
          userId: user.id,
          businessId,
          role: dto.role,
        })
      );
      await this.userBusinessRepository.save(assignments);
    }

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      message: 'Team member created. They can login with the provided credentials.',
    };
  }

  // Update team member
  async updateTeamMember(
    enterpriseId: string,
    memberId: string,
    dto: UpdateTeamMemberDto,
    currentUserId: string
  ) {
    const member = await this.userRepository.findOne({
      where: { id: memberId, enterpriseId },
    });

    if (!member) {
      throw new NotFoundException('Team member not found');
    }

    // Can't modify yourself
    if (memberId === currentUserId) {
      throw new ForbiddenException('Cannot modify your own account through this endpoint');
    }

    // Can't modify owner
    if (member.role === Role.BUSINESS_OWNER) {
      throw new ForbiddenException('Cannot modify the business owner');
    }

    // Update role
    if (dto.role) {
      member.role = dto.role;
    }

    // Update active status
    if (dto.isActive !== undefined) {
      member.isActive = dto.isActive;
    }

    await this.userRepository.save(member);

    // Update business assignments
    if (dto.businessIds) {
      // Remove existing assignments
      await this.userBusinessRepository.delete({ userId: memberId });

      // Create new assignments
      const assignments = dto.businessIds.map((businessId) =>
        this.userBusinessRepository.create({
          userId: memberId,
          businessId,
          role: dto.role || member.role,
        })
      );
      if (assignments.length) {
        await this.userBusinessRepository.save(assignments);
      }
    }

    return { message: 'Team member updated successfully' };
  }

  // Remove team member
  async removeTeamMember(enterpriseId: string, memberId: string, currentUserId: string) {
    const member = await this.userRepository.findOne({
      where: { id: memberId, enterpriseId },
    });

    if (!member) {
      throw new NotFoundException('Team member not found');
    }

    if (memberId === currentUserId) {
      throw new ForbiddenException('Cannot remove yourself');
    }

    if (member.role === Role.BUSINESS_OWNER) {
      throw new ForbiddenException('Cannot remove the business owner');
    }

    // Soft delete - deactivate
    member.isActive = false;
    await this.userRepository.save(member);

    // Or hard delete:
    // await this.userBusinessRepository.delete({ userId: memberId });
    // await this.userRepository.delete(memberId);

    return { message: 'Team member removed successfully' };
  }

  // Cancel invitation
  async cancelInvitation(enterpriseId: string, invitationId: string) {
    const invitation = await this.invitationRepository.findOne({
      where: { id: invitationId, enterpriseId, status: InvitationStatus.PENDING },
    });

    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    invitation.status = InvitationStatus.CANCELLED;
    await this.invitationRepository.save(invitation);

    return { message: 'Invitation cancelled' };
  }

  // Assign user to business
  async assignToBusiness(enterpriseId: string, dto: AssignBusinessDto) {
    // Verify user belongs to enterprise
    const user = await this.userRepository.findOne({
      where: { id: dto.userId, enterpriseId },
    });
    if (!user) {
      throw new NotFoundException('User not found in enterprise');
    }

    // Verify business belongs to enterprise
    const business = await this.businessRepository.findOne({
      where: { id: dto.businessId, enterpriseId },
    });
    if (!business) {
      throw new NotFoundException('Business not found in enterprise');
    }

    // Check if assignment already exists
    const existing = await this.userBusinessRepository.findOne({
      where: { userId: dto.userId, businessId: dto.businessId },
    });
    if (existing) {
      throw new ConflictException('User is already assigned to this business');
    }

    const assignment = this.userBusinessRepository.create({
      userId: dto.userId,
      businessId: dto.businessId,
      role: dto.role || user.role,
    });

    await this.userBusinessRepository.save(assignment);
    return { message: 'User assigned to business successfully' };
  }

  // Remove user from business
  async removeFromBusiness(enterpriseId: string, userId: string, businessId: string) {
    const assignment = await this.userBusinessRepository.findOne({
      where: { userId, businessId },
      relations: ['business'],
    });

    if (!assignment || assignment.business.enterpriseId !== enterpriseId) {
      throw new NotFoundException('Assignment not found');
    }

    await this.userBusinessRepository.delete({ userId, businessId });
    return { message: 'User removed from business successfully' };
  }

  // Get my accessible businesses (for non-owners)
  async getMyBusinesses(userId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.enterpriseId) {
      return [];
    }

    // Business owners and admins see all businesses in enterprise
    if (user.role === Role.BUSINESS_OWNER || user.role === Role.PLATFORM_ADMIN) {
      return this.businessRepository.find({
        where: { enterpriseId: user.enterpriseId },
      });
    }

    // Other roles only see assigned businesses
    const assignments = await this.userBusinessRepository.find({
      where: { userId, isActive: true },
      relations: ['business'],
    });

    return assignments.map((a) => a.business);
  }
}
