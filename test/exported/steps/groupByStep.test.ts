import { Builder, f, e, ArithmeticOperator } from '../../../src'
import { database } from '../../database'

//Alias
const ADD = ArithmeticOperator.ADD
const table = database.s.public.t.table1
const col1 = database.s.public.t.table1.c.col1
const col2 = database.s.public.t.table1.c.col2
const col3 = database.s.public.t.table1.c.col3
const col4 = database.s.public.t.table1.c.col4
const col5 = database.s.public.t.table1.c.col5
const col6 = database.s.public.t.table1.c.col6

describe('test groupBy Step', () => {
	const sql = new Builder(database)
	afterEach(() => { sql.cleanUp() })

	it('Produces [SELECT "col1" FROM "table1" GROUP BY "col1";]', () => {
		const actual = sql
			.select(col1)
			.from(table)
			.groupBy(col1)
			.getSQL()

		expect(actual).toEqual('SELECT "col1" FROM "table1" GROUP BY "col1";')
	})

	it('Produces [SELECT "col1", "col2" FROM "table1" GROUP BY "col1", "col2";]', () => {
		const actual = sql
			.select(col1, col2)
			.from(table)
			.groupBy(col1, col2)
			.getSQL()

		expect(actual).toEqual('SELECT "col1", "col2" FROM "table1" GROUP BY "col1", "col2";')
	})

	it(`Produces [SELECT "col1" FROM "table1" WHERE "col2" = 'a' GROUP BY "col1";]`, () => {
		const actual = sql
			.select(col1)
			.from(table)
			.where(col2.eq('a'))
			.groupBy(col1)
			.getSQL()

		expect(actual).toEqual(`SELECT "col1" FROM "table1" WHERE "col2" = 'a' GROUP BY "col1";`)
	})

	it(`Produces [SELECT "col1" FROM "table1" WHERE "col2" = \'a\' AND "col3" = 'b' GROUP BY "col1";]`, () => {
		const actual = sql
			.select(col1)
			.from(table)
			.where(col2.eq('a'))
			.and(col3.eq('b'))
			.groupBy(col1)
			.getSQL()

		expect(actual).toEqual(`SELECT "col1" FROM "table1" WHERE "col2" = \'a\' AND "col3" = 'b' GROUP BY "col1";`)
	})

	it(`Produces [SELECT "col1" FROM "table1" WHERE "col2" = \'a\' OR "col3" = 'b' GROUP BY "col1";]`, () => {
		const actual = sql
			.select(col1)
			.from(table)
			.where(col2.eq('a'))
			.or(col3.eq('b'))
			.groupBy(col1)
			.getSQL()

		expect(actual).toEqual(`SELECT "col1" FROM "table1" WHERE "col2" = \'a\' OR "col3" = 'b' GROUP BY "col1";`)
	})

	it('Produces [SELECT SUM("col4"), SUM(1) FROM "table1" GROUP BY "col2";]', () => {
		const actual = sql
			.select(f.sum(col4), f.sum(1))
			.from(table)
			.groupBy(col2)
			.getSQL()

		expect(actual).toEqual('SELECT SUM("col4"), SUM(1) FROM "table1" GROUP BY "col2";')
	})

	it('Produces [SELECT SUM("col4"), AVG("col5") FROM "table1" GROUP BY "col2";]', () => {
		const actual = sql
			.select(f.sum(col4), f.avg(col5))
			.from(table)
			.groupBy(col2)
			.getSQL()

		expect(actual).toEqual('SELECT SUM("col4"), AVG("col5") FROM "table1" GROUP BY "col2";')
	})

	it('Produces [SELECT COUNT("col4"), MAX("col5"), MIN("col6") FROM "table1" GROUP BY "col2";]', () => {
		const actual = sql
			.select(f.count(col4), f.max(col5), f.min(col6))
			.from(table)
			.groupBy(col2)
			.getSQL()

		expect(actual).toEqual('SELECT COUNT("col4"), MAX("col5"), MIN("col6") FROM "table1" GROUP BY "col2";')
	})

	it('Produces [SELECT SUM("col4"), AVG("col4"), COUNT("col4"), MAX("col4"), MIN("col4") FROM "table1" GROUP BY "col2";]', () => {
		const actual = sql
			.select(col4.sum, col4.avg, col4.count, col4.max, col4.min)
			.from(table)
			.groupBy(col2)
			.getSQL()

		expect(actual).toEqual('SELECT SUM("col4"), AVG("col4"), COUNT("col4"), MAX("col4"), MIN("col4") FROM "table1" GROUP BY "col2";')
	})

	it('Produces [SELECT SUM("col4") AS "SUM_OF_COL4", SUM(1) AS "SUM_OF_1", SUM(col5) AS "SUM_OF_COL5" FROM "table1" GROUP BY "col1";]', () => {
		const actual = sql
			.select(
				f.sum(col4).as('SUM_OF_COL4'),
				f.sum(1).as('SUM_OF_1'),
				col5.sum.as('SUM_OF_COL5'),
			)
			.from(table)
			.groupBy(col2)
			.getSQL()

		expect(actual).toEqual('SELECT SUM("col4") AS "SUM_OF_COL4", SUM(1) AS "SUM_OF_1", SUM("col5") AS "SUM_OF_COL5" FROM "table1" GROUP BY "col2";')
	})

	it('Produces [SELECT SUM("col4" + "col5") FROM "table1" GROUP BY "col1";]', () => {
		const actual = sql
			.select(f.sum(e(col4, ADD, col5)))
			.from(table)
			.groupBy(col1)
			.getSQL()

		expect(actual).toEqual('SELECT SUM("col4" + "col5") FROM "table1" GROUP BY "col1";')
	})

	it('Produces [SELECT SUM("col4" + 1) FROM "table1" GROUP BY "col1";]', () => {
		const actual = sql
			.select(f.sum(e(col4, ADD, 1)))
			.from(table)
			.groupBy(col1)
			.getSQL()

		expect(actual).toEqual('SELECT SUM("col4" + 1) FROM "table1" GROUP BY "col1";')
	})
})
