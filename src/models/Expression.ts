import {
	ArithmeticOperator,
	BitwiseOperator,
	ComparisonOperator,
	NullOperator,
	Operator,
	TextOperator,
} from '../operators'
import { Binder } from '../binder'
import { BuilderData } from '../builder'
import { SelectItemInfo } from '../SelectItemInfo'
import { Column } from '../columns'
import { InvalidExpressionError } from '../errors'
import { Operand } from './Operand'
import {
	isTextBoolean,
	isTextNumber,
	NonNullPrimitiveType,
	OperandType,
	PrimitiveType,
	ValueLike,
} from './types'
import { IStatementGiver } from './IStatementGiver'
import { Condition } from './Condition'
import { ItemInfo } from '../ItemInfo'

export enum ExpressionType {
  NOT_EXIST,
  NULL,
  BOOLEAN,
  NUMBER,
  TEXT,
  DATE,
}

export class Expression implements IStatementGiver {
	public readonly leftOperand: Operand
	public readonly operator?: Operator
	public readonly rightOperand?: Operand
	public readonly type: ExpressionType

	constructor(binder: Binder)
	constructor(leftOperandType: OperandType)
	constructor(leftOperandType: OperandType, notLeft: boolean)
	constructor(leftOperandType: OperandType, operator: Operator, rightOperandType: OperandType)
	constructor(leftOperandType: OperandType, operator: Operator, rightOperandType: OperandType, notLeft: boolean, notRight: boolean)
	constructor(leftOperandType: OperandType|Binder, operatorOrNotLeft?: boolean|Operator, rightOperandType?: OperandType, notLeft?: boolean, notRight?: boolean) {
		if (typeof operatorOrNotLeft === 'boolean') {
			this.leftOperand = new Operand(leftOperandType, operatorOrNotLeft)
			this.operator = undefined
		} else {
			this.leftOperand = new Operand(leftOperandType, notLeft)
			this.operator = operatorOrNotLeft
		}

		this.rightOperand = new Operand(rightOperandType, notRight)

		if (this.rightOperand.type === ExpressionType.NOT_EXIST) {
			this.type = this.leftOperand.type
		} else if (typeof operatorOrNotLeft !== 'boolean' && operatorOrNotLeft !== undefined) {
			this.type = Expression.getResultExpressionType(this.leftOperand, operatorOrNotLeft, this.rightOperand)
		} else {
			throw new Error('Error while calculate Expression Type, failed to create object Expression')
		}
	}

	public getStmt(data: BuilderData): string {
		if (this.operator !== undefined && this.rightOperand !== undefined) {
			return `(${this.leftOperand.getStmt(data)} ${this.operator.toString()} ${this.rightOperand.getStmt(data)})`
		}
		return this.leftOperand.getStmt(data)
	}

	public as(alias: string): ItemInfo {
		return new SelectItemInfo(this, alias)
	}

	public eq(value: ValueLike): Condition {
		return new Condition(this, ComparisonOperator.Equal, new Expression(value))
	}

	public eq$(value: NonNullPrimitiveType): Condition {
		const binder = new Binder(value)
		return new Condition(this, ComparisonOperator.Equal, new Expression(binder))
	}

	public ne(value: ValueLike): Condition {
		return new Condition(this, ComparisonOperator.NotEqual, new Expression(value))
	}

	public ne$(value: NonNullPrimitiveType): Condition {
		const binder = new Binder(value)
		return new Condition(this, ComparisonOperator.NotEqual, new Expression(binder))
	}

	public isEq(value: PrimitiveType): Condition {
		const qualifier = value === null ? NullOperator.Is : ComparisonOperator.Equal
		return new Condition(this, qualifier, new Expression(value))
	}

	public isEq$(value: PrimitiveType): Condition {
		const qualifier = value === null ? NullOperator.Is : ComparisonOperator.Equal
		const binder = new Binder(value)
		return new Condition(this, qualifier, new Expression(binder))
	}

	public isNe(value: PrimitiveType): Condition {
		const qualifier = value === null ? NullOperator.IsNot : ComparisonOperator.NotEqual
		return new Condition(this, qualifier, new Expression(value))
	}

	public isNe$(value: PrimitiveType): Condition {
		const qualifier = value === null ? NullOperator.IsNot : ComparisonOperator.NotEqual
		const binder = new Binder(value)
		return new Condition(this, qualifier, new Expression(binder))
	}

	public getColumns(): Column[] {
		const columns: Column[] = []

		const left = this.leftOperand.value
		if (left instanceof Column)
			columns.push(left)
		else if (left instanceof Expression)
			columns.push(...left.getColumns())

		const right = this.rightOperand?.value
		if (right instanceof Column)
			columns.push(right)
		else if (right instanceof Expression)
			columns.push(...right.getColumns())

		return columns
	}

	private static getResultExpressionType(left: Operand, operator: Operator, right: Operand): ExpressionType {
		if (this.isArithmeticOperator(operator)) {
			if ((left.type === ExpressionType.NULL && right.type === ExpressionType.NUMBER)
        || (left.type === ExpressionType.NUMBER && right.type === ExpressionType.NULL))
				return ExpressionType.NULL

			if (left.type === ExpressionType.NUMBER && right.type === ExpressionType.NUMBER)
				return ExpressionType.NUMBER

			if (((left.type === ExpressionType.TEXT && isTextNumber(left.value)) && right.type === ExpressionType.NUMBER)
        || (left.type === ExpressionType.NUMBER && (right.type === ExpressionType.TEXT && isTextNumber(right.value))))
				return ExpressionType.NUMBER

			this.throwInvalidTypeError(left.type, operator, right.type)
		}

		if (this.isBitwiseOperator(operator)) {
			if (left.type === ExpressionType.NUMBER && right.type === ExpressionType.NUMBER)
				return ExpressionType.NUMBER

			if (left.type === ExpressionType.NUMBER && (right.type === ExpressionType.TEXT && isTextNumber(right.value))
        || right.type === ExpressionType.NUMBER && (left.type === ExpressionType.TEXT && isTextNumber(left.value)))
				return ExpressionType.NUMBER

			this.throwInvalidTypeError(left.type, operator, right.type)
		}

		if (this.isComparisonOperator(operator)) {
			if (left.type === ExpressionType.NULL || right.type === ExpressionType.NULL)
				return ExpressionType.NULL

			if (left.type === right.type)
				return ExpressionType.BOOLEAN

			if (left.type === ExpressionType.BOOLEAN && (right.type === ExpressionType.TEXT && isTextBoolean(right.value))
        || right.type === ExpressionType.BOOLEAN && (left.type === ExpressionType.TEXT && isTextBoolean(left.value)))
				return ExpressionType.BOOLEAN

			if (left.type === ExpressionType.NUMBER && (right.type === ExpressionType.TEXT && isTextNumber(right.value))
        || right.type === ExpressionType.NUMBER && (left.type === ExpressionType.TEXT && isTextNumber(left.value)))
				return ExpressionType.BOOLEAN

			this.throwInvalidTypeError(left.type, operator, right.type)
		}

		if (this.isNullOperator(operator)) {
			if (right.type === ExpressionType.NULL)
				return ExpressionType.BOOLEAN

			if (right.type === ExpressionType.BOOLEAN) {
				if (left.type === ExpressionType.NULL || ExpressionType.BOOLEAN)
					return ExpressionType.BOOLEAN
				if (left.type === ExpressionType.TEXT && isTextNumber(left.value))
					return ExpressionType.BOOLEAN
			}

			this.throwInvalidTypeError(left.type, operator, right.type)
		}

		if (this.isTextOperator(operator)) {
			if (left.type === ExpressionType.NULL || right.type === ExpressionType.NULL)
				return ExpressionType.NULL

			if (left.type === ExpressionType.TEXT
        && (right.type === ExpressionType.TEXT || right.type === ExpressionType.NUMBER))
				return ExpressionType.TEXT

			if (left.type === ExpressionType.NUMBER && right.type === ExpressionType.TEXT)
				return ExpressionType.TEXT

			this.throwInvalidTypeError(left.type, operator, right.type)
		}

		throw new Error(`Function "getResultExpressionType" does not support operator: "${operator}"`)
	}

	private static isArithmeticOperator(operator: Operator): boolean {
		return Object.values(ArithmeticOperator).includes(operator as ArithmeticOperator)
	}

	private static isBitwiseOperator(operator: Operator): boolean {
		return Object.values(BitwiseOperator).includes(operator as BitwiseOperator)
	}

	private static isTextOperator(operator: Operator): boolean {
		return Object.values(TextOperator).includes(operator as TextOperator)
	}

	private static isComparisonOperator(operator: Operator): boolean {
		return Object.values(ComparisonOperator).includes(operator as ComparisonOperator)
	}

	private static isNullOperator(operator: Operator): boolean {
		return Object.values(NullOperator).includes(operator as NullOperator)
	}

	private static throwInvalidTypeError(leftType: ExpressionType, operator: Operator, rightType: ExpressionType): never {
		throw new InvalidExpressionError(`You can not have "${ExpressionType[leftType]}" and "${ExpressionType[rightType]}" with operator "${operator}"`)
	}
}
