import {
	BooleanLike,
	NumberLike,
	TextLike,
	OperandType,
} from './models/types'
import { Expression } from './models/Expression'
import { Condition } from './models/Condition'
import {
	ArithmeticOperator,
	ComparisonOperator,
	Operator,
} from './operators'
import {
	OrderByDirection,
	OrderByNullsPosition,
	OrderByItem,
	OrderByItemInfo,
} from './orderBy'
import { AggregateFunction, AggregateFunctionEnum } from './AggregateFunction'
import { NumberColumn } from './columns'
import { Binder } from './binder'
import { PrimitiveType } from './models/types'

export function e(left: OperandType): Expression
export function e(left: BooleanLike, operator: ComparisonOperator, right: BooleanLike): Condition
export function e(left: NumberLike|Binder, operator: ArithmeticOperator, right: NumberLike|Binder): Expression
export function e(left: TextLike, operator: ComparisonOperator, right: TextLike): Condition
export function e(left: OperandType, operator: Operator, right: OperandType): Expression
export function e(left: OperandType|Binder, operator?: Operator, right?: OperandType|Binder): Expression {
	const l = left instanceof Binder ? new Expression(left) : left
	if (operator !== undefined && right !== undefined) {
		const r = right instanceof Binder ? new Expression(right) : right
		if (
			Object.values(ComparisonOperator).includes(operator as ComparisonOperator)
      && l instanceof Expression
      && r instanceof Expression
		) {
			return new Condition(l, operator as ComparisonOperator, r)
		}
		return new Expression(l, operator, r)
	} else {
		return new Expression(l)
	}
}

export function o(alias: OrderByItem, direction?: OrderByDirection, nullsPosition?: OrderByNullsPosition): OrderByItemInfo {
	return new OrderByItemInfo(alias, direction, nullsPosition)
}

export function $(value: PrimitiveType): Binder {
	return new Binder(value)
}

export const f = {
	sum: function (column: Expression|NumberLike): AggregateFunction {
		return aggregateFunction(AggregateFunctionEnum.SUM, column)
	},

	avg: function (column: Expression|NumberLike): AggregateFunction {
		return aggregateFunction(AggregateFunctionEnum.AVG, column)
	},

	count: function (column: Expression|NumberLike): AggregateFunction {
		return aggregateFunction(AggregateFunctionEnum.COUNT, column)
	},

	max: function (column: Expression|NumberLike): AggregateFunction {
		return aggregateFunction(AggregateFunctionEnum.MAX, column)
	},

	min: function (column: Expression|NumberLike): AggregateFunction {
		return aggregateFunction(AggregateFunctionEnum.MIN, column)
	},
}

function aggregateFunction(functionName: AggregateFunctionEnum, column: Expression|NumberLike): AggregateFunction {
	if (column instanceof NumberColumn || typeof column === 'number')
		return new AggregateFunction(functionName, new Expression(column))
	else
		return new AggregateFunction(functionName, column)
}
