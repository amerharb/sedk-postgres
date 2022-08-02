import {
	InvalidExpressionError,
	ColumnNotFoundError,
	TableNotFoundError,
	MoreThanOneDistinctOrAllError,
	MoreThanOneWhereStepError,
	InvalidConditionError,
	InvalidLimitValueError,
	InvalidOffsetValueError,
	InsertColumnsAndValuesNotEqualError,
	Builder,
	e,
	Table,
	TextColumn,
	ArithmeticOperator,
	ComparisonOperator,
	DISTINCT,
	ALL,
	ASC,
	DESC,
	NULLS_FIRST,
	NULLS_LAST,
	f,
	ASTERISK,
} from '../../src'
import { database } from '../database'
import { InsertColumnsAndExpressionsNotEqualError } from '../../src/errors'

//Alias
const ADD = ArithmeticOperator.ADD
const GT = ComparisonOperator.GreaterThan
const table1 = database.s.public.t.table1
const col1 = table1.c.col1
const col2 = table1.c.col2
const col3 = table1.c.col3
const col4 = table1.c.col4
const table2 = database.s.public.t.table2

describe('Throw desired Errors', () => {
	const sql = new Builder(database)
	afterEach(() => { sql.cleanUp() })

	describe('Error: MoreThanOneWhereStepError', () => {
		it('Throws error when 2 WHERE steps added', () => {
			function actual() {
				const fromStep = sql.select(col1).from(table1)

				// first Where Step
				fromStep.where(col1.eq('x1'))
				// second Where Step, should throw
				fromStep.where(col1.eq('x2'))
			}

			expect(actual).toThrowError('WHERE step already specified')
			expect(actual).toThrowError(MoreThanOneWhereStepError)
		})
		it('Throws error when 2 WHERE steps added after ON step', () => {
			function actual() {
				const fromStep = sql
					.select(col1)
					.from(table1)
					.leftJoin(table2)
					.on(col1.eq(table2.c.col1))

				// first Where Step
				fromStep.where(col3.eq('x1'))
				// second Where Step, should throw
				fromStep.where(col3.eq('x2'))
			}

			expect(actual).toThrowError('WHERE step already specified')
			expect(actual).toThrowError(MoreThanOneWhereStepError)
		})
		it('Throws error when 2 WHERE steps added after delete', () => {
			function actual() {
				const fromStep = sql.deleteFrom(table1)

				// first Where Step
				fromStep.where(col1.eq('x1'))
				// second Where Step, should throw
				fromStep.where(col1.eq('x2'))
			}

			expect(actual).toThrowError('WHERE step already specified')
			expect(actual).toThrowError(MoreThanOneWhereStepError)
		})
	})

	describe('Error: InvalidExpressionError', () => {
		it('Throws error when add invalid operator', () => {
			function actual() {
				sql.select(e(1, GT, 'f'))
			}

			expect(actual).toThrowError('You can not have "NUMBER" and "TEXT" with operator ">"')
			expect(actual).toThrowError(InvalidExpressionError)
		})
		it('Throws error if number added to text', () => {
			function actual() {
				sql.select(e(1, ADD, 'a')).getSQL()
			}

			expect(actual).toThrowError('You can not have "NUMBER" and "TEXT" with operator "+"')
			expect(actual).toThrowError(InvalidExpressionError)
		})
	})

	describe('Error: MoreThanOneDistinctOrAllError', () => {
		it('Throws error when more than one DISTINCT passed', () => {
			function actual() {
				// @ts-ignore
				sql.select(DISTINCT, DISTINCT, col1).from(table1)
			}

			expect(actual).toThrow(/^You can not have more than one DISTINCT or ALL$/)
			expect(actual).toThrow(MoreThanOneDistinctOrAllError)
		})
		it('Throws error when more than one ALL passed', () => {
			function actual() {
				// @ts-ignore
				sql.select(ALL, ALL, col1).from(table1)
			}

			expect(actual).toThrow(/^You can not have more than one DISTINCT or ALL$/)
			expect(actual).toThrow(MoreThanOneDistinctOrAllError)
		})
		it('Throws error when DISTINCT and ALL passed', () => {
			// @ts-ignore
			function actual1() { sql.select(ALL, col1, DISTINCT).from(table1) }

			// @ts-ignore
			function actual2() { sql.select(ALL, DISTINCT, col1).from(table1) }

			// @ts-ignore
			function actual3() { sql.select(DISTINCT, ALL, col1).from(table1) }

			// @ts-ignore
			function actual4() { sql.select(DISTINCT, col1, ALL).from(table1) }

			[actual1, actual2, actual3, actual4].forEach(actual => {
				expect(actual).toThrow(/^You can not have more than one DISTINCT or ALL$/)
				expect(actual).toThrow(MoreThanOneDistinctOrAllError)
			})
		})
	})

	describe('Error: InvalidConditionError', () => {
		it(`Throws error when condition created with "NUMBER" "=" "TEXT"`, () => {
			function actual() {
				sql
					.selectAsteriskFrom(table1)
					.where(col4.bitwiseXor(1).eq('A'))
					.getSQL()
			}

			expect(actual).toThrow(InvalidConditionError)
			expect(actual).toThrow(`Condition can not created with "NUMBER" "=" "TEXT"`)
		})
		it(`Throws error when condition created with "NUMBER" "=" "DATE"`, () => {
			function actual() {
				sql
					.selectAsteriskFrom(table1)
					.where(col4.bitwiseXor(1).eq(new Date()))
					.getSQL()
			}

			expect(actual).toThrow(InvalidConditionError)
			expect(actual).toThrow(`Condition can not created with "NUMBER" "=" "DATE"`)
		})
		it(`Throws no error when condition created with "NUMBER" "=" "NUMBER"`, () => {
			function actual() {
				sql
					.selectAsteriskFrom(table1)
					.where(col4.bitwiseXor(1).eq(1))
					.getSQL()
			}

			expect(actual).not.toThrow()
		})
	})

	it('Throws error when column not exist', () => {
		const wrongColumn = new TextColumn({ name: 'wrongColumn' })

		function actual() {
			sql.select(col1, wrongColumn, col3)
		}

		expect(actual).toThrowError('Column: "wrongColumn" not found')
		expect(actual).toThrowError(ColumnNotFoundError)
	})

	it('Throws error when table1 not exist', () => {
		const wrongTable = new Table({ name: 'wrongTable', columns: { anyColumn: new TextColumn({ name: 'anyColumn' }) } })

		function actual() {
			sql.select(col1).from(wrongTable)
		}

		expect(actual).toThrowError('Table: "wrongTable" not found')
		expect(actual).toThrowError(TableNotFoundError)
	})

	it('Throws error when no param to select passed after DISTINCT', () => {
		function actual() {
			sql.select(DISTINCT).from(table1)
		}

		expect(actual).toThrow(/^Select step must have at least one parameter after DISTINCT$/)
	})

	it('Throws error when ORDER BY has no param', () => {
		function actual() {
			sql
				.selectAsteriskFrom(table1)
				.orderBy()
		}

		expect(actual).toThrow(/^Order by should have at lease one item$/)
	})

	it('Throws error when DESC comes before alias or column', () => {
		function actual() {
			sql
				.selectAsteriskFrom(table1)
				.orderBy(DESC, 'col1')
		}

		expect(actual).toThrow(/^ DESC expects to have column or alias before it$/)
	})

	it('Throws error when NULLS FIRST comes before alias or column', () => {
		function actual() {
			sql
				.selectAsteriskFrom(table1)
				.orderBy(NULLS_FIRST, col1)
		}

		expect(actual).toThrow(/^ NULLS FIRST expects to have column or alias before it$/)
	})

	it('Throws error when DESC come before column or alias name', () => {
		function actual() {
			sql
				.selectAsteriskFrom(table1)
				.orderBy(col1, NULLS_FIRST, DESC)
		}

		expect(actual).toThrow(/^ DESC expects to have column or alias before it$/)
	})

	it('Throws error when NULLS_LAST comes directly after NULLS_FIRST', () => {
		function actual() {
			sql.selectAsteriskFrom(table1).orderBy(col1, NULLS_FIRST, NULLS_LAST)
		}

		expect(actual).toThrow(/^ NULLS LAST expects to have column or alias before it$/)
	})

	it('Throws error when DESC comes directly after ASC', () => {
		function actual() {
			sql.selectAsteriskFrom(table1).orderBy(col1, ASC, DESC)
		}

		expect(actual).toThrow(/^ DESC shouldn't come after "ASC" or "DESC" without column or alias in between$/)
	})

	it('Throws error when LIMIT step has invalid value', () => {
		function actual1() {sql.selectAsteriskFrom(table1).limit(-1)}
		function actual2() {sql.selectAsteriskFrom(table1).limit$(-1)}
		function actual3() {sql.selectAsteriskFrom(table1).limit(NaN)}
		function actual4() {sql.selectAsteriskFrom(table1).limit$(NaN)}
		function actual5() {sql.selectAsteriskFrom(table1).limit(Number.POSITIVE_INFINITY)}
		function actual6() {sql.selectAsteriskFrom(table1).limit$(Number.POSITIVE_INFINITY)}
		function actual7() {sql.selectAsteriskFrom(table1).limit(Number.NEGATIVE_INFINITY)}
		function actual8() {sql.selectAsteriskFrom(table1).limit$(Number.NEGATIVE_INFINITY)}

		const actualList = [actual1, actual2, actual3, actual4, actual5, actual6, actual7, actual8]
		expect.assertions(actualList.length * 2)
		actualList.forEach(actual => {
			expect(actual).toThrow(InvalidLimitValueError)
			expect(actual).toThrow(/^Invalid limit value: .*, value must be positive numbers.*/)
		})
	})

	it('Throws error when OFFSET step has invalid value', () => {
		function actual1() {sql.selectAsteriskFrom(table1).offset(-1)}
		function actual2() {sql.selectAsteriskFrom(table1).offset$(-1)}
		function actual3() {sql.selectAsteriskFrom(table1).offset(NaN)}
		function actual4() {sql.selectAsteriskFrom(table1).offset$(NaN)}
		function actual5() {sql.selectAsteriskFrom(table1).offset(Number.POSITIVE_INFINITY)}
		function actual6() {sql.selectAsteriskFrom(table1).offset$(Number.POSITIVE_INFINITY)}
		function actual7() {sql.selectAsteriskFrom(table1).offset(Number.NEGATIVE_INFINITY)}
		function actual8() {sql.selectAsteriskFrom(table1).offset$(Number.NEGATIVE_INFINITY)}

		const actualList = [actual1, actual2, actual3, actual4, actual5, actual6, actual7, actual8]
		expect.assertions(actualList.length * 2)
		actualList.forEach(actual => {
			expect(actual).toThrow(InvalidOffsetValueError)
			expect(actual).toThrow(/^Invalid offset value: .*, value must be positive numbers$/)
		})
	})

	it('Throws error "Expression Type must be number in aggregate function"', () => {
		function actual() {
			sql
				.select(col1)
				.from(table1)
				.groupBy(col1)
				.having(f.sum(e('text')).eq(4))
				.getSQL()
		}

		expect(actual).toThrow(/^Expression Type must be number in aggregate function$/)
	})

	describe('Delete Path Errors', () => {
		const deleteSql = new Builder(database, { throwErrorIfDeleteHasNoCondition: false })
		afterEach(() => { deleteSql.cleanUp() })
		it(`Throws error "Aggregate function SUM cannot be used in RETURNING clause"`, () => {
			function actual() {
				deleteSql.deleteFrom(table1).returning(f.sum(table1.c.col4).as('whatEver')).getSQL()
			}

			expect(actual).toThrow(/^Aggregate function SUM cannot be used in RETURNING clause$/)
		})
	})
	describe('Error: InsertColumnsAndValuesNotEqualError', () => {
		it(`columns more than values`, () => {
			function actual() {
				sql.insertInto(table1, col1, col2).values('A')
			}

			expect(actual).toThrow(InsertColumnsAndValuesNotEqualError)
		})
		it(`values more than columns`, () => {
			function actual() {
				sql.insertInto(table1, col1, col2).values('A', 'B', 'C')
			}

			expect(actual).toThrow(InsertColumnsAndValuesNotEqualError)
		})
	})
	describe('Error: InsertColumnsAndExpressionsNotEqualError', () => {
		it(`columns more than expressions`, () => {
			function actual() {
				sql.insertInto(table1, col1, col2).select('A')
			}

			expect(actual).toThrow(InsertColumnsAndExpressionsNotEqualError)
		})
		it(`expressions more than columns`, () => {
			function actual() {
				sql.insertInto(table1, col1, col2).select('A', 'B', 'C')
			}

			expect(actual).toThrow(InsertColumnsAndExpressionsNotEqualError)
		})
	})
	it(`Throws error "Value step has Unsupported value: x, type: y"`, () => {
		const value = { unsupportedObject: 'something' }
		function actual() {
			// @ts-ignore
			sql.insertInto(table1).values(value).getSQL()
		}

		expect(actual).toThrow(`Value step has Unsupported value: ${value}, type: ${typeof value}`)
	})
	it(`Throws error "Insert statement must have values or select items"`, () => {
		function actual() {
			sql.insertInto(table1).getSQL()
		}
		expect(actual).toThrow(`Insert statement must have values or select items`)
	})
	it(`Throws error "Returning step can not be used in SELECT statement, It can be only use if the path start with INSERT, DELETE, or UPDATE"`, () => {
		function actual() {
			sql.selectAsteriskFrom(table1).returning(ASTERISK).getSQL()
		}
		expect(actual).toThrow(`Returning step can not be used in SELECT statement, It can be only use if the path start with INSERT, DELETE, or UPDATE`)
	})
})
