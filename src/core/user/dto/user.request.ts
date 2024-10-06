import { ApiProperty, OmitType } from '@nestjs/swagger'
import {
	IsBoolean,
	IsNotEmpty,
	IsOptional,
	IsString,
	IsUUID,
	MinLength
} from 'class-validator'
import { UUID } from 'crypto'

export class CreateUserDto {
	@ApiProperty({
		example: 'Steve',
		required: true
	})
	@IsString()
	@IsNotEmpty()
	firstName: string

	@ApiProperty({
		example: 'Jobs',
		required: true
	})
	@IsString()
	@IsNotEmpty()
	lastName: string

	@ApiProperty({
		example: 'steve@hotmail.com',
		required: true
	})
	@IsString()
	@IsNotEmpty()
	email: string

	@ApiProperty({
		example: 'steve',
		required: true
	})
	@IsString()
	@IsNotEmpty()
	@MinLength(5)
	username: string

	@ApiProperty({
		required: true,
		example: 'pass'
	})
	@IsString()
	@IsNotEmpty()
	password: string

	@ApiProperty({
		example: 'true'
	})
	@IsOptional()
	@IsBoolean()
	isActive: boolean
}

export class UpdateUserDto extends OmitType(CreateUserDto, ['password']) {
	@ApiProperty({
		example: '550e8400-e29b-41d4-a716-446655440000',
		required: true
	})
	@IsUUID()
	@IsNotEmpty()
	id: UUID
}
