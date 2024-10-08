import { PrismaService } from '@/root/prisma'
import {
	Injectable,
	NotFoundException,
	UnauthorizedException
} from '@nestjs/common'

import { hash, verify } from 'argon2'
import { plainToInstance } from 'class-transformer'
import { UUID } from 'crypto'
import { RoleService } from '../role/roles.service'
import { UserDto } from '../user/dto/user.response'
import { UserService } from '../user/user.service'
import {
	LoginDto,
	RefreshTokenDto,
	RegisterDto,
	TokenDto
} from './dto/auth.request'
import { AuthResponseDto, TokenResponse } from './dto/auth.response'
import { JwtAuthService } from './jwt/jwt.service'

@Injectable()
export class AuthService {
	constructor(
		private readonly prismaService: PrismaService,
		private readonly jwtService: JwtAuthService,
		private readonly userService: UserService,
		private readonly roleService: RoleService
	) {}

	async getProfile(id: UUID): Promise<UserDto> {
		return await this.userService.getById(id)
	}

	async register(dto: RegisterDto): Promise<AuthResponseDto | null> {
		await this.userService.isUnique(dto.username, dto.email)

		const USER = await this.roleService.getByName('USER')

		const newUser = plainToInstance(
			UserDto,
			await this.prismaService.user.create({
				data: {
					...dto,
					password: await hash(dto.password),
					roles: {
						create: {
							roleId: USER.id
						}
					}
				},
				include: {
					roles: {
						include: {
							role: true
						}
					}
				}
			})
		)
		const response: AuthResponseDto = {
			user: newUser,
			token: await this.jwtService.generateTokens(newUser.id)
		}

		return response
	}

	async login(dto: LoginDto): Promise<AuthResponseDto | null> {
		const user = await this.validateUser(dto)
		const response: AuthResponseDto = {
			user: user,
			token: await this.jwtService.generateTokens(user?.id)
		}
		return response
	}

	async refreshToken(dto: RefreshTokenDto): Promise<TokenResponse | null> {
		const tokens = await this.jwtService.getNewTokens(dto)
		return tokens
	}

	async logout(dto: TokenDto): Promise<void> {
		await this.jwtService.addToBlacklist(dto.accessToken)
	}

	async validateUser(dto: LoginDto) {
		const user = await this.prismaService.user.findUnique({
			where: {
				username: dto.username?.toLocaleLowerCase()
			},
			include: {
				roles: {
					include: {
						role: true
					}
				}
			}
		})
		if (!user) throw new NotFoundException('User is not found!')

		const isValid = await verify(user?.password, dto.password)

		if (!isValid) {
			throw new UnauthorizedException('Invalid Credentials')
		}

		return plainToInstance(UserDto, user)
	}
}
