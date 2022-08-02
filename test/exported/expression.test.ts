import { $, Builder, e, ArithmeticOperator, TextOperator, ComparisonOperator } from '../../src'
import { database } from '../database'

//Alias
const ADD = ArithmeticOperator.ADD
const SUB = ArithmeticOperator.SUB
const CONCAT = TextOperator.CONCAT
const GT = ComparisonOperator.GreaterThan
const EQ = ComparisonOperator.Equal

const table = database.s.public.t.table1
const col7 = database.s.public.t.table1.c.col7

describe('Expression', () => {
	const sql = new Builder(database)
	afterEach(() => { sql.cleanUp() })
	describe('Basic use', () => {
		it(`Produces [SELECT TRUE;]`, () => {
			const actual = sql.select(e(true)).getSQL()
			expect(actual).toEqual(`SELECT TRUE;`)
		})

		it(`Produces [SELECT FALSE;]`, () => {
			const actual = sql.select(e(false)).getSQL()
			expect(actual).toEqual(`SELECT FALSE;`)
		})

		it(`Produces [SELECT 1 FROM "table1";]`, () => {
			const actual = sql
				.select(e(1))
				.from(table)
				.getSQL()

			expect(actual).toEqual(`SELECT 1 FROM "table1";`)
		})

		it(`Produces [SELECT -1;]`, () => {
			const actual = sql.select(e(-1)).getSQL()
			expect(actual).toEqual(`SELECT -1;`)
		})

		it(`Produces [SELECT 'a' FROM "table1";]`, () => {
			const actual = sql.select(e(`a`)).from(table).getSQL()

			expect(actual).toEqual(`SELECT 'a' FROM "table1";`)
		})

		it(`Produces [SELECT '1979-11-14T00:00:00.000Z' FROM "table1";]`, () => {
			const actual = sql.select(e(new Date(Date.UTC(1979, 10, 14)))).from(table).getSQL()
			expect(actual).toEqual(`SELECT '1979-11-14T00:00:00.000Z' FROM "table1";`)
		})
	})

	describe('With Binder', () => {
		it(`Produces [SELECT (1 + $1) FROM "table1";]`, () => {
			const actual = sql
				.select(e(1, ADD, $(5)))
				.from(table)

			const expected = {
				sql: `SELECT (1 + $1) FROM "table1";`,
				values: [5],
			}
			expect(actual.getSQL()).toEqual(expected.sql)
			expect(actual.getBindValues()).toEqual(expected.values)
		})
	})

	describe('With Operators', () => {
		it(`Produces [SELECT ('a' || 'b') FROM "table1";]`, () => {
			const actual = sql
				.select(e(`a`, CONCAT, `b`))
				.from(table)
				.getSQL()

			expect(actual).toEqual(`SELECT ('a' || 'b') FROM "table1";`)
		})

		it(`Produces [SELECT (1 + (2 - 3)) FROM "table1";]`, () => {
			const actual = sql
				.select(e(1, ADD, e(2, SUB, 3)))
				.from(table)
				.getSQL()

			expect(actual).toEqual(`SELECT (1 + (2 - 3)) FROM "table1";`)
		})

		it(`Produces [SELECT (1 + (2 - 3)) AS "Calc" FROM "table1";]`, () => {
			const actual = sql
				.select(e(1, ADD, e(2, SUB, 3)).as(`Calc`))
				.from(table)
				.getSQL()

			expect(actual).toEqual(`SELECT (1 + (2 - 3)) AS "Calc" FROM "table1";`)
		})

		it(`Produces [SELECT * FROM "table1" WHERE ("col7" > 'tru');]`, () => {
			const actual = sql
				.selectAsteriskFrom(table)
				.where(e(col7, GT, `tru`))
				.getSQL()

			expect(actual).toEqual(`SELECT * FROM "table1" WHERE ("col7" > 'tru');`)
		})

		describe('With TextBoolean', () => {
			const boolSmall = ['t', 'tr', 'tru', 'true', 'f', 'fa', 'fal', 'fals', 'false']
			const boolCapital = boolSmall.map(it => it.replace('t', 'T').replace('f', 'F'))
			const boolCaps = boolSmall.map(it => it.toUpperCase())
			const textBooleanArray = [...boolSmall, ...boolCapital, ...boolCaps]
			it(`Produces [SELECT * FROM "table1" WHERE ("col7" = '<TextBoolean>');]`, () => {
				textBooleanArray.forEach(it => {
					const actual = sql
						.selectAsteriskFrom(table)
						.where(e(col7, EQ, it))
						.getSQL()

					expect(actual).toEqual(`SELECT * FROM "table1" WHERE ("col7" = '${it}');`)
					sql.cleanUp()
				})
			})
			it(`Produces [SELECT * FROM "table1" WHERE "col7" = '<TextBoolean>';]`, () => {
				textBooleanArray.forEach(it => {
					const actual = sql
						.selectAsteriskFrom(table)
						.where(col7.eq(it))
						.getSQL()

					expect(actual).toEqual(`SELECT * FROM "table1" WHERE "col7" = '${it}';`)
					sql.cleanUp()
				})
			})
		})
	})

	describe('With Aliases', () => {
		it(`Produces [SELECT 1 AS "One" FROM "table1";]`, () => {
			const actual = sql
				.select(e(1).as(`One`))
				.from(table)
				.getSQL()

			expect(actual).toEqual(`SELECT 1 AS "One" FROM "table1";`)
		})
	})
})