import { Column } from './columns'
import { Expression } from './models/Expression'
import { BuilderData } from './builder'
import { IStatementGiver } from './models/IStatementGiver'

export type OrderByItem = Column|Expression|string
export type OrderByArgsElement = OrderByItemInfo|OrderByItem|OrderByDirection|OrderByNullsPosition

export class OrderByItemInfo implements IStatementGiver{
	constructor(
    private readonly orderByItem: OrderByItem,
    private readonly direction: OrderByDirection = DIRECTION_NOT_EXIST,
    private readonly nullPosition: OrderByNullsPosition = NULLS_POSITION_NOT_EXIST,
	) {}

	public getStmt(data: BuilderData): string {
		const direction = this.getDirectionFromOption(data)
		const nullPosition = this.getNullLastFromOption(data)
		const orderByString = (this.orderByItem instanceof Column || this.orderByItem instanceof Expression)
			? this.orderByItem.getStmt(data)
			: this.orderByItem

		return `${orderByString}${direction}${nullPosition}`
	}

	private getDirectionFromOption(data: BuilderData): OrderByDirection {
		if (this.direction === DESC)
			return DESC

		if (data.option !== undefined) {
			switch (data.option.addAscAfterOrderByItem) {
			case 'always':
				return ASC
			case 'never':
				return DIRECTION_NOT_EXIST
			}
		}
		return this.direction
	}

	private getNullLastFromOption(data: BuilderData): OrderByNullsPosition {
		if (this.nullPosition === NULLS_FIRST)
			return NULLS_FIRST

		if (data.option !== undefined) {
			switch (data.option.addNullsLastAfterOrderByItem) {
			case 'always':
				return NULLS_LAST
			case 'never':
				return NULLS_POSITION_NOT_EXIST
			}
		}
		return this.nullPosition
	}
}

export abstract class OrderByDirection {}

export class DirectionNotExist extends OrderByDirection{
	private static instance: DirectionNotExist
	private readonly unique: symbol = Symbol()

	private constructor() {super()}

	public static getInstance(): DirectionNotExist {
		if (!DirectionNotExist.instance) {
			DirectionNotExist.instance = new DirectionNotExist()
		}
		return DirectionNotExist.instance
	}

	public toString(): string {
		return ''
	}
}

export const DIRECTION_NOT_EXIST = DirectionNotExist.getInstance()

export class Asc extends OrderByDirection{
	private static instance: Asc
	private readonly unique: symbol = Symbol()

	private constructor() {super()}

	public static getInstance(): Asc {
		if (!Asc.instance) {
			Asc.instance = new Asc()
		}
		return Asc.instance
	}

	public toString(): string {
		return ' ASC'
	}
}

export const ASC = Asc.getInstance()

export class Desc extends OrderByDirection{
	private static instance: Desc
	private readonly unique: symbol = Symbol()

	private constructor() {super()}

	public static getInstance(): Desc {
		if (!Desc.instance) {
			Desc.instance = new Desc()
		}
		return Desc.instance
	}

	public toString(): string {
		return ' DESC'
	}
}

export const DESC = Desc.getInstance()

export abstract class OrderByNullsPosition {}

export class NullsPositionNotExist extends OrderByNullsPosition{
	private static instance: NullsPositionNotExist
	private readonly unique: symbol = Symbol()

	private constructor() {super()}

	public static getInstance(): NullsPositionNotExist {
		if (!NullsPositionNotExist.instance) {
			NullsPositionNotExist.instance = new NullsPositionNotExist()
		}
		return NullsPositionNotExist.instance
	}

	public toString(): string {
		return ''
	}
}

export const NULLS_POSITION_NOT_EXIST = NullsPositionNotExist.getInstance()

export class NullsFirst extends OrderByNullsPosition{
	private static instance: NullsFirst
	private readonly unique: symbol = Symbol()

	private constructor() {super()}

	public static getInstance(): NullsFirst {
		if (!NullsFirst.instance) {
			NullsFirst.instance = new NullsFirst()
		}
		return NullsFirst.instance
	}

	public toString(): string {
		return ' NULLS FIRST'
	}
}

export const NULLS_FIRST = NullsFirst.getInstance()

export class NullsLast extends OrderByNullsPosition{
	private static instance: NullsLast
	private readonly unique: symbol = Symbol()

	private constructor() {super()}

	public static getInstance(): NullsLast {
		if (!NullsLast.instance) {
			NullsLast.instance = new NullsLast()
		}
		return NullsLast.instance
	}

	public toString(): string {
		return ' NULLS LAST'
	}
}

export const NULLS_LAST = NullsLast.getInstance()
