import { Expose } from 'class-transformer'

export class RoleDto {
	@Expose()
	id: number

	@Expose()
	name: string

	@Expose()
	isActive: boolean
}
