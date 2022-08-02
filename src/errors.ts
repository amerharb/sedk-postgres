
export class ColumnNotFoundError extends Error{}

export class TableNotFoundError extends Error{}

export class InvalidExpressionError extends Error{}

export class MoreThanOneDistinctOrAllError extends Error{}

export class MoreThanOneWhereStepError extends Error{}

export class InvalidConditionError extends Error{}

export class DeleteWithoutConditionError extends Error{}

export class InvalidLimitValueError extends Error{}

export class InvalidOffsetValueError extends Error{}

export class InsertColumnsAndValuesNotEqualError extends Error{
	constructor(columnsCount: number, valuesCount: number) {
		super()
		this.message = `Number of values does not match number of columns. Columns: ${columnsCount}, Values: ${valuesCount}`
	}
}

export class InsertColumnsAndExpressionsNotEqualError extends Error{
	constructor(columnsCount: number, expressionsCount: number) {
		super()
		this.message = `Number of expressions in Select does not match number of columns. Columns: ${columnsCount}, Expressions: ${expressionsCount}`
	}
}
