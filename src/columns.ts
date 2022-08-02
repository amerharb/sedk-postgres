import { Table } from './database'
import { escapeDoubleQuote } from './util'
import { Binder } from './binder'
import { BooleanLike, DateLike, NumberLike, TextLike } from './models/types'
import { Operand } from './models/Operand'
import { Condition } from './models/Condition'
import { Expression, ExpressionType } from './models/Expression'
import { BitwiseOperator, ComparisonOperator, NullOperator, Operator, TextOperator } from './operators'
import {
	ASC,
	DESC,
	DIRECTION_NOT_EXIST,
	NULLS_FIRST,
	NULLS_LAST,
	NULLS_POSITION_NOT_EXIST,
	OrderByItemInfo,
} from './orderBy'
import { SelectItemInfo } from './SelectItemInfo'
import { AggregateFunction, AggregateFunctionEnum } from './AggregateFunction'
import { IStatementGiver } from './models/IStatementGiver'
import { BuilderData } from './builder'
import { ItemInfo } from './ItemInfo'
import { UpdateSetItemInfo } from './UpdateSetItemInfo'
import { DEFAULT, Default } from './singletoneConstants'

type ColumnObj = {
  name: string
}

export abstract class Column implements IStatementGiver {
	private mTable?: Table

	protected constructor(protected readonly data: ColumnObj) {}

	public set table(table: Table) {
		if (this.mTable === undefined)
			this.mTable = table
		else
			throw new Error('Table can only be assigned one time')
	}

	public get table(): Table {
		if (this.mTable === undefined)
			throw new Error('Table was not assigned')

		return this.mTable
	}

	public get name(): string {
		return this.data.name
	}

	public getDoubleQuotedName(): string {
		return `"${escapeDoubleQuote(this.data.name)}"`
	}

	public as(alias: string): ItemInfo {
		return new SelectItemInfo(this, alias)
	}

	public get asc(): OrderByItemInfo {
		return new OrderByItemInfo(this, ASC, NULLS_POSITION_NOT_EXIST)
	}

	public get desc(): OrderByItemInfo {
		return new OrderByItemInfo(this, DESC, NULLS_POSITION_NOT_EXIST)
	}

	public get nullsFirst(): OrderByItemInfo {
		return new OrderByItemInfo(this, DIRECTION_NOT_EXIST, NULLS_FIRST)
	}

	public get nullsLast(): OrderByItemInfo {
		return new OrderByItemInfo(this, DIRECTION_NOT_EXIST, NULLS_LAST)
	}

	public get ascNullsFirst(): OrderByItemInfo {
		return new OrderByItemInfo(this, ASC, NULLS_FIRST)
	}

	public get descNullsFirst(): OrderByItemInfo {
		return new OrderByItemInfo(this, DESC, NULLS_FIRST)
	}

	public get ascNullsLast(): OrderByItemInfo {
		return new OrderByItemInfo(this, ASC, NULLS_LAST)
	}

	public get descNullsLast(): OrderByItemInfo {
		return new OrderByItemInfo(this, DESC, NULLS_LAST)
	}

	public get letDefault(): UpdateSetItemInfo {
		return new UpdateSetItemInfo(this, DEFAULT)
	}

	public getStmt(data: BuilderData): string {
		if (this.mTable === undefined)
			throw new Error('Table of this column is undefined')

		const schemaName = data.fromItemInfos.some(it => (it.table !== this.table && it.table.name === this.table.name))
			? `"${escapeDoubleQuote(this.table.schema.name)}".`
			: ''

		const tableName = (
			data.option.addTableName === 'always'
      || (data.option.addTableName === 'when two tables or more'
        && data.fromItemInfos.some(it => it.table !== this.table))
		) ? `"${escapeDoubleQuote(this.table.name)}".` : ''

		return `${schemaName}${tableName}"${escapeDoubleQuote(this.data.name)}"`
	}
}

export class BooleanColumn extends Column implements Condition {
	// START implement Condition
	public readonly leftExpression: Expression = new Expression(this)
	public readonly leftOperand: Operand = this.leftExpression.leftOperand
	public readonly type: ExpressionType.BOOLEAN|ExpressionType.NULL = ExpressionType.BOOLEAN

	public getColumns(): BooleanColumn[] {
		return [this]
	}

	public eq(value: BooleanLike): Condition {
		return new Condition(new Expression(this), ComparisonOperator.Equal, new Expression(value))
	}

	public eq$(value: boolean): Condition {
		const binder = new Binder(value)
		return new Condition(new Expression(this), ComparisonOperator.Equal, new Expression(binder))
	}

	public ne(value: BooleanLike): Condition {
		return new Condition(new Expression(this), ComparisonOperator.NotEqual, new Expression(value))
	}

	public ne$(value: boolean): Condition {
		const binder = new Binder(value)
		return new Condition(new Expression(this), ComparisonOperator.NotEqual, new Expression(binder))
	}

	// END implement Condition

	constructor(data: ColumnObj) {
		super(data)
	}

	public isEq(value: null|BooleanLike): Condition {
		const qualifier = value === null ? NullOperator.Is : ComparisonOperator.Equal
		return new Condition(new Expression(this), qualifier, new Expression(value))
	}

	public isEq$(value: null|boolean): Condition {
		const qualifier = value === null ? NullOperator.Is : ComparisonOperator.Equal
		const binder = new Binder(value)
		return new Condition(new Expression(this), qualifier, new Expression(binder))
	}

	public isNe(value: null|BooleanLike): Condition {
		const qualifier = value === null ? NullOperator.IsNot : ComparisonOperator.NotEqual
		return new Condition(new Expression(this), qualifier, new Expression(value))
	}

	public isNe$(value: null|boolean): Condition {
		const qualifier = value === null ? NullOperator.IsNot : ComparisonOperator.NotEqual
		const binder = new Binder(value)
		return new Condition(new Expression(this), qualifier, new Expression(binder))
	}

	public get not(): Condition {
		return new Condition(new Expression(this, true))
	}

	public let(value: boolean|null|Default): UpdateSetItemInfo {
		return new UpdateSetItemInfo(this, value)
	}

	public let$(value: boolean|null): UpdateSetItemInfo {
		return new UpdateSetItemInfo(this, new Binder(value))
	}
}

export class NumberColumn extends Column {
	constructor(data: ColumnObj) {
		super(data)
	}

	public isEq(value: null|NumberLike): Condition {
		const qualifier = value === null ? NullOperator.Is : ComparisonOperator.Equal
		return new Condition(new Expression(this), qualifier, new Expression(value))
	}

	public eq(value1: NumberLike): Condition
	public eq(value1: NumberLike, op: Operator, value2: NumberLike): Condition
	public eq(value1: NumberLike, op?: Operator, value2?: NumberLike): Condition {
		const rightExpression = (op !== undefined && value2 !== undefined)
			? new Expression(value1, op, value2)
			: new Expression(value1)

		return new Condition(new Expression(this), ComparisonOperator.Equal, rightExpression)
	}

	public isEq$(value: null|number): Condition {
		const qualifier = value === null ? NullOperator.Is : ComparisonOperator.Equal
		const binder = new Binder(value)
		return new Condition(new Expression(this), qualifier, new Expression(binder))
	}

	public eq$(value: number): Condition {
		const binder = new Binder(value)
		return new Condition(new Expression(this), ComparisonOperator.Equal, new Expression(binder))
	}

	public isNe(value: null|NumberLike): Condition {
		const qualifier = value === null ? NullOperator.IsNot : ComparisonOperator.NotEqual
		return new Condition(new Expression(this), qualifier, new Expression(value))
	}

	public ne(value1: NumberLike): Condition
	public ne(value1: NumberLike, op: Operator, value2: NumberLike): Condition
	public ne(value1: NumberLike, op?: Operator, value2?: NumberLike): Condition {
		const rightExpression = (op !== undefined && value2 !== undefined)
			? new Expression(value1, op, value2)
			: new Expression(value1)

		return new Condition(new Expression(this), ComparisonOperator.NotEqual, rightExpression)
	}

	public isNe$(value: null|number): Condition {
		const qualifier = value === null ? NullOperator.IsNot : ComparisonOperator.NotEqual
		const binder = new Binder(value)
		return new Condition(new Expression(this), qualifier, new Expression(binder))
	}

	public gt(value: NumberLike): Condition {
		return new Condition(new Expression(this), ComparisonOperator.GreaterThan, new Expression(value))
	}

	public gt$(value: number): Condition {
		const binder = new Binder(value)
		return new Condition(new Expression(this), ComparisonOperator.GreaterThan, new Expression(binder))
	}

	public ge(value: NumberLike): Condition {
		return new Condition(new Expression(this), ComparisonOperator.GreaterOrEqual, new Expression(value))
	}

	public ge$(value: number): Condition {
		const binder = new Binder(value)
		return new Condition(new Expression(this), ComparisonOperator.GreaterOrEqual, new Expression(binder))
	}

	public lt(value: NumberLike): Condition {
		return new Condition(new Expression(this), ComparisonOperator.LesserThan, new Expression(value))
	}

	public lt$(value: number): Condition {
		const binder = new Binder(value)
		return new Condition(new Expression(this), ComparisonOperator.LesserThan, new Expression(binder))
	}

	public le(value: NumberLike): Condition {
		return new Condition(new Expression(this), ComparisonOperator.LesserOrEqual, new Expression(value))
	}

	public le$(value: number): Condition {
		const binder = new Binder(value)
		return new Condition(new Expression(this), ComparisonOperator.LesserOrEqual, new Expression(binder))
	}

	public bitwiseAnd(value: number): Expression {
		return new Expression(this, BitwiseOperator.BitwiseAnd, value)
	}

	public bitwiseAnd$(value: number): Expression {
		const binder = new Binder(value)
		return new Expression(this, BitwiseOperator.BitwiseAnd, new Expression(binder))
	}

	public bitwiseOr(value: number): Expression {
		return new Expression(this, BitwiseOperator.BitwiseOr, value)
	}

	public bitwiseOr$(value: number): Expression {
		const binder = new Binder(value)
		return new Expression(this, BitwiseOperator.BitwiseOr, new Expression(binder))
	}

	public bitwiseXor(value: number): Expression {
		return new Expression(this, BitwiseOperator.BitwiseXor, value)
	}

	public bitwiseXor$(value: number): Expression {
		const binder = new Binder(value)
		return new Expression(this, BitwiseOperator.BitwiseXor, new Expression(binder))
	}

	public get sum(): AggregateFunction {
		return new AggregateFunction(AggregateFunctionEnum.SUM, new Expression(this))
	}

	public get avg(): AggregateFunction {
		return new AggregateFunction(AggregateFunctionEnum.AVG, new Expression(this))
	}

	public get count(): AggregateFunction {
		return new AggregateFunction(AggregateFunctionEnum.COUNT, new Expression(this))
	}

	public get max(): AggregateFunction {
		return new AggregateFunction(AggregateFunctionEnum.MAX, new Expression(this))
	}

	public get min(): AggregateFunction {
		return new AggregateFunction(AggregateFunctionEnum.MIN, new Expression(this))
	}

	public let(value: number|null|Default): UpdateSetItemInfo {
		return new UpdateSetItemInfo(this, value)
	}

	public let$(value: number|null): UpdateSetItemInfo {
		return new UpdateSetItemInfo(this, new Binder(value))
	}
}

export class TextColumn extends Column {
	constructor(data: ColumnObj) {
		super(data)
	}

	public isEq(value: null|string|TextColumn): Condition {
		const qualifier = value === null ? NullOperator.Is : ComparisonOperator.Equal
		return new Condition(new Expression(this), qualifier, new Expression(value))
	}

	public eq(value: string|TextColumn|Expression): Condition {
		if (value instanceof Expression) {
			return new Condition(new Expression(this), ComparisonOperator.Equal, value)
		}
		return new Condition(new Expression(this), ComparisonOperator.Equal, new Expression(value))
	}

	public isEq$(value: null|string): Condition {
		const qualifier = value === null ? NullOperator.Is : ComparisonOperator.Equal
		const binder = new Binder(value)
		return new Condition(new Expression(this), qualifier, new Expression(binder))
	}

	public eq$(value: string): Condition {
		const binder = new Binder(value)
		return new Condition(new Expression(this), ComparisonOperator.Equal, new Expression(binder))
	}

	public isNe(value: null|string|TextColumn): Condition {
		const qualifier = value === null ? NullOperator.IsNot : ComparisonOperator.NotEqual
		return new Condition(new Expression(this), qualifier, new Expression(value))
	}

	public ne(value: string|TextColumn|Expression): Condition {
		if (value instanceof Expression) {
			return new Condition(new Expression(this), ComparisonOperator.NotEqual, value)
		}
		return new Condition(new Expression(this), ComparisonOperator.NotEqual, new Expression(value))
	}

	public isNe$(value: null|string): Condition {
		const qualifier = value === null ? NullOperator.IsNot : ComparisonOperator.NotEqual
		const binder = new Binder(value)
		return new Condition(new Expression(this), qualifier, new Expression(binder))
	}

	public ne$(value: string): Condition {
		const binder = new Binder(value)
		return new Condition(new Expression(this), ComparisonOperator.NotEqual, new Expression(binder))
	}

	public concat(value: TextLike): Expression {
		return new Expression(this, TextOperator.CONCAT, value)
	}

	public let(value: string|null|Default): UpdateSetItemInfo {
		return new UpdateSetItemInfo(this, value)
	}

	public let$(value: string|null): UpdateSetItemInfo {
		return new UpdateSetItemInfo(this, new Binder(value))
	}
}

export class DateColumn extends Column {
	constructor(data: ColumnObj) {
		super(data)
	}

	public isEq(value: null|DateLike): Condition {
		const qualifier = value === null ? NullOperator.Is : ComparisonOperator.Equal
		return new Condition(new Expression(this), qualifier, new Expression(value))
	}

	public eq(value: DateLike): Condition {
		return new Condition(new Expression(this), ComparisonOperator.Equal, new Expression(value))
	}

	public isEq$(value: null|Date): Condition {
		const qualifier = value === null ? NullOperator.Is : ComparisonOperator.Equal
		const binder = new Binder(value)
		return new Condition(new Expression(this), qualifier, new Expression(binder))
	}

	public eq$(value: Date): Condition {
		const binder = new Binder(value)
		return new Condition(new Expression(this), ComparisonOperator.Equal, new Expression(binder))
	}

	public isNe(value: null|DateLike): Condition {
		const qualifier = value === null ? NullOperator.IsNot : ComparisonOperator.NotEqual
		return new Condition(new Expression(this), qualifier, new Expression(value))
	}

	public ne(value: DateLike): Condition {
		return new Condition(new Expression(this), ComparisonOperator.NotEqual, new Expression(value))
	}

	public isNe$(value: null|Date): Condition {
		const qualifier = value === null ? NullOperator.IsNot : ComparisonOperator.NotEqual
		const binder = new Binder(value)
		return new Condition(new Expression(this), qualifier, new Expression(binder))
	}

	public ne$(value: Date): Condition {
		const binder = new Binder(value)
		return new Condition(new Expression(this), ComparisonOperator.NotEqual, new Expression(binder))
	}

	public gt(value: DateLike): Condition {
		return new Condition(new Expression(this), ComparisonOperator.GreaterThan, new Expression(value))
	}

	public gt$(value: Date): Condition {
		const binder = new Binder(value)
		return new Condition(new Expression(this), ComparisonOperator.GreaterThan, new Expression(binder))
	}

	public ge(value: DateLike): Condition {
		return new Condition(new Expression(this), ComparisonOperator.GreaterOrEqual, new Expression(value))
	}

	public ge$(value: Date): Condition {
		const binder = new Binder(value)
		return new Condition(new Expression(this), ComparisonOperator.GreaterOrEqual, new Expression(binder))
	}

	public lt(value: DateLike): Condition {
		return new Condition(new Expression(this), ComparisonOperator.LesserThan, new Expression(value))
	}

	public lt$(value: Date): Condition {
		const binder = new Binder(value)
		return new Condition(new Expression(this), ComparisonOperator.LesserThan, new Expression(binder))
	}

	public le(value: DateLike): Condition {
		return new Condition(new Expression(this), ComparisonOperator.LesserOrEqual, new Expression(value))
	}

	public le$(value: Date): Condition {
		const binder = new Binder(value)
		return new Condition(new Expression(this), ComparisonOperator.LesserOrEqual, new Expression(binder))
	}

	public let(value: Date|null|Default): UpdateSetItemInfo {
		return new UpdateSetItemInfo(this, value)
	}

	public let$(value: Date|null): UpdateSetItemInfo {
		return new UpdateSetItemInfo(this, new Binder(value))
	}
}
