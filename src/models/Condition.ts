import { Expression, ExpressionType } from './Expression'
import { ComparisonOperator, NullOperator, Operator, Qualifier } from '../operators'
import { BuilderData } from '../builder'
import { SelectItemInfo } from '../SelectItemInfo'
import { Column } from '../columns'
import { Operand } from './Operand'
import { IStatementGiver } from './IStatementGiver'
import { Binder } from '../binder'
import { InvalidConditionError } from '../errors'
import { BooleanLike, isTextBoolean } from './types'
import { ItemInfo } from '../ItemInfo'

export class Condition implements Expression, IStatementGiver {
	public readonly leftExpression: Expression
	public readonly operator?: Qualifier
	public readonly rightExpression?: Expression

	// Implement Expression
	public readonly leftOperand: Operand
	public readonly rightOperand?: Operand
	public readonly type: ExpressionType.NULL|ExpressionType.BOOLEAN

	constructor(leftExpression: Expression)
	constructor(leftExpression: Expression, operator: Qualifier, rightExpression: Expression)
	constructor(leftExpression: Expression, operator: Qualifier, rightExpression: Expression, notLeft: boolean, notRight: boolean)
	constructor(leftExpression: Expression, operator?: Qualifier, rightExpression?: Expression, notLeft?: boolean, notRight?: boolean) {
		this.leftOperand = new Operand(leftExpression, notLeft)
		this.operator = operator
		this.rightOperand = new Operand(rightExpression, notRight)
		this.type = Condition.getResultExpressionType(leftExpression, operator, rightExpression)
		this.leftExpression = leftExpression
		this.rightExpression = rightExpression
	}

	public getStmt(data: BuilderData): string {
		if (this.operator !== undefined && this.rightOperand !== undefined)
			if (this.leftOperand.value instanceof Condition) {
				return `(${this.leftOperand.getStmt(data)}) ${this.operator} ${this.rightOperand.getStmt(data)}`
			} else {
				return `${this.leftOperand.getStmt(data)} ${this.operator} ${this.rightOperand.getStmt(data)}`
			}
		else
			return this.leftOperand.getStmt(data)
	}

	// Implement Expression, We don't really need it
	public as(alias: string): ItemInfo {
		return new SelectItemInfo(this, alias)
	}

	public eq(value: BooleanLike): Condition {
		return new Condition(this, ComparisonOperator.Equal, new Expression(value))
	}

	public eq$(value: boolean): Condition {
		const binder = new Binder(value)
		return new Condition(this, ComparisonOperator.Equal, new Expression(binder))
	}

	public ne(value: BooleanLike): Condition {
		return new Condition(this, ComparisonOperator.NotEqual, new Expression(value))
	}

	public ne$(value: boolean): Condition {
		const binder = new Binder(value)
		return new Condition(this, ComparisonOperator.NotEqual, new Expression(binder))
	}

	public isEq(value: null|boolean): Condition {
		const qualifier = value === null ? NullOperator.Is : ComparisonOperator.Equal
		return new Condition(this, qualifier, new Expression(value))
	}

	public isEq$(value: null|boolean): Condition {
		const qualifier = value === null ? NullOperator.Is : ComparisonOperator.Equal
		const binder = new Binder(value)
		return new Condition(this, qualifier, new Expression(binder))
	}

	public isNe(value: null|boolean): Condition {
		const qualifier = value === null ? NullOperator.IsNot : ComparisonOperator.NotEqual
		return new Condition(this, qualifier, new Expression(value))
	}

	public isNe$(value: null|boolean): Condition {
		const qualifier = value === null ? NullOperator.IsNot : ComparisonOperator.NotEqual
		const binder = new Binder(value)
		return new Condition(this, qualifier, new Expression(binder))
	}

	// Implement Expression, but still good to keep it
	public getColumns(): Column[] {
		const columns: Column[] = []
		columns.push(...this.leftExpression.getColumns())
		if (this.rightExpression !== undefined)
			columns.push(...this.rightExpression.getColumns())

		return columns
	}

	private static getResultExpressionType(leftExpression: Expression, operator?: Qualifier, rightExpression?: Expression)
    : ExpressionType.NULL|ExpressionType.BOOLEAN {
		if (operator === undefined || rightExpression === undefined) {
			if (leftExpression.type === ExpressionType.NULL || leftExpression.type === ExpressionType.BOOLEAN) {
				return leftExpression.type
			}
			Condition.throwInvalidConditionError(leftExpression.type)
		}

		if (leftExpression.type === rightExpression.type) {
			return ExpressionType.BOOLEAN
		}

		if (Condition.isNullOperator(operator)) {
			if (rightExpression.type === ExpressionType.NULL) {
				return ExpressionType.BOOLEAN
			} else if (leftExpression.type === ExpressionType.NULL && rightExpression.type === ExpressionType.BOOLEAN) {
				return ExpressionType.BOOLEAN
			} else if (leftExpression.type === ExpressionType.BOOLEAN || rightExpression.type === ExpressionType.BOOLEAN) {
				Condition.throwInvalidConditionError(leftExpression.type, operator, rightExpression.type)
			} else if (leftExpression.type === ExpressionType.NULL) {
				Condition.throwInvalidConditionError(leftExpression.type, operator, rightExpression.type)
			}
			Condition.throwInvalidConditionError(leftExpression.type, operator, rightExpression.type)
		} else if (Condition.isComparisonOperator(operator)) {
			if (leftExpression.type === ExpressionType.NULL || rightExpression.type === ExpressionType.NULL) {
				return ExpressionType.NULL
			} else if (leftExpression.type === ExpressionType.BOOLEAN && rightExpression.type === ExpressionType.TEXT && isTextBoolean(rightExpression.leftOperand.value)) {
				return ExpressionType.BOOLEAN
			}
			Condition.throwInvalidConditionError(leftExpression.type, operator, rightExpression.type)
		}
		Condition.throwInvalidConditionError(leftExpression.type, operator, rightExpression.type)
	}

	private static isComparisonOperator(operator: Operator): boolean {
		return Object.values(ComparisonOperator).includes(operator as ComparisonOperator)
	}

	private static isNullOperator(operator: Operator): boolean {
		return Object.values(NullOperator).includes(operator as NullOperator)
	}

	private static throwInvalidConditionError(leftType: ExpressionType, operator?: Operator, rightType?: ExpressionType): never {
		if (operator === undefined || rightType === undefined) {
			throw new InvalidConditionError(`Condition can not created with only "${ExpressionType[leftType]}"`)
		}
		throw new InvalidConditionError(`Condition can not created with "${ExpressionType[leftType]}" "${operator}" "${ExpressionType[rightType]}"`)
	}
}

