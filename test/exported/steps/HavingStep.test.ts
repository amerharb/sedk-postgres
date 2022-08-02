import { Builder, LogicalOperator, f } from '../../../src'
import { database } from '../../database'

//Alias
const AND = LogicalOperator.AND
const OR = LogicalOperator.OR
const table = database.s.public.t.table1
const col1 = table.c.col1
const col2 = table.c.col2
const col3 = table.c.col3
const col4 = table.c.col4
const col5 = table.c.col5
const col6 = table.c.col6

describe('test having step', () => {
	const sql = new Builder(database)
	afterEach(() => { sql.cleanUp() })

	describe('test getSQL() without binders', () => {
		it(`Produces [SELECT "col1" FROM "table1" GROUP BY "col1" HAVING "col1" = 'a';]`, () => {
			const actual = sql
				.select(col1)
				.from(table)
				.groupBy(col1)
				.having(col1.eq('a'))
				.getSQL()

			expect(actual).toEqual(`SELECT "col1" FROM "table1" GROUP BY "col1" HAVING "col1" = 'a';`)
		})

		it(`Produces [SELECT "col1" FROM "table1" GROUP BY "col1" HAVING ( "col1" = \'a\' AND "col2" = 'b' );]`, () => {
			const actual = sql
				.select(col1)
				.from(table)
				.groupBy(col1)
				.having(col1.eq('a'), AND, col2.eq('b'))
				.getSQL()

			expect(actual).toEqual(`SELECT "col1" FROM "table1" GROUP BY "col1" HAVING ( "col1" = \'a\' AND "col2" = 'b' );`)
		})

		it(`Produces [SELECT "col1" FROM "table1" GROUP BY "col1" HAVING ( "col1" = \'a\' AND "col2" = \'b\' OR "col3" = 'c' );]`, () => {
			const actual = sql
				.select(col1)
				.from(table)
				.groupBy(col1)
				.having(col1.eq('a'), AND, col2.eq('b'), OR, col3.eq('c'))
				.getSQL()

			expect(actual).toEqual(`SELECT "col1" FROM "table1" GROUP BY "col1" HAVING ( "col1" = \'a\' AND "col2" = \'b\' OR "col3" = 'c' );`)
		})

		it(`Produces [SELECT "col1" FROM "table1" GROUP BY "col1" HAVING "col1" = \'a\' AND "col2" = 'b';]`, () => {
			const actual = sql
				.select(col1)
				.from(table)
				.groupBy(col1)
				.having(col1.eq('a'))
				.and(col2.eq('b'))
				.getSQL()

			expect(actual).toEqual(`SELECT "col1" FROM "table1" GROUP BY "col1" HAVING "col1" = \'a\' AND "col2" = 'b';`)
		})

		it(`Produces [SELECT "col1" FROM "table1" GROUP BY "col1" HAVING "col1" = \'a\' AND ( "col2" = \'b\' OR "col3" = 'c' );]`, () => {
			const actual = sql
				.select(col1)
				.from(table)
				.groupBy(col1)
				.having(col1.eq('a'))
				.and(col2.eq('b'), OR, col3.eq('c'))
				.getSQL()

			expect(actual).toEqual(`SELECT "col1" FROM "table1" GROUP BY "col1" HAVING "col1" = \'a\' AND ( "col2" = \'b\' OR "col3" = 'c' );`)
		})

		it(`Produces [SELECT "col1" FROM "table1" GROUP BY "col1" HAVING "col1" = \'a\' AND ( "col2" = \'b\' OR "col3" = 'c' AND "col4" = 4 );]`, () => {
			const actual = sql
				.select(col1)
				.from(table)
				.groupBy(col1)
				.having(col1.eq('a'))
				.and(col2.eq('b'), OR, col3.eq('c'), AND, col4.eq(4))
				.getSQL()

			expect(actual).toEqual(`SELECT "col1" FROM "table1" GROUP BY "col1" HAVING "col1" = \'a\' AND ( "col2" = \'b\' OR "col3" = 'c' AND "col4" = 4 );`)
		})

		it(`Produces [SELECT "col1" FROM "table1" GROUP BY "col1" HAVING "col1" = \'a\' OR ( "col2" = \'b\' OR "col3" = 'c' AND "col4" = 4 );]`, () => {
			const actual = sql
				.select(col1)
				.from(table)
				.groupBy(col1)
				.having(col1.eq('a'))
				.or(col2.eq('b'), OR, col3.eq('c'), AND, col4.eq(4))
				.getSQL()

			expect(actual).toEqual(`SELECT "col1" FROM "table1" GROUP BY "col1" HAVING "col1" = \'a\' OR ( "col2" = \'b\' OR "col3" = 'c' AND "col4" = 4 );`)
		})

		it(`Produces [SELECT "col1" FROM "table1" GROUP BY "col1" HAVING "col1" = \'a\' AND "col2" = \'b\' OR "col3" = 'c';]`, () => {
			const actual = sql
				.select(col1)
				.from(table)
				.groupBy(col1)
				.having(col1.eq('a'))
				.and(col2.eq('b'))
				.or(col3.eq('c'))
				.getSQL()

			expect(actual).toEqual(`SELECT "col1" FROM "table1" GROUP BY "col1" HAVING "col1" = \'a\' AND "col2" = \'b\' OR "col3" = 'c';`)
		})

		it('Produces [SELECT "col1" FROM "table1" GROUP BY "col1" HAVING SUM("col4") = 4;]', () => {
			const actual = sql
				.select(col1)
				.from(table)
				.groupBy(col1)
				.having(f.sum(col4).eq(4))
				.getSQL()

			expect(actual).toEqual('SELECT "col1" FROM "table1" GROUP BY "col1" HAVING SUM("col4") = 4;')
		})

		it('Produces [SELECT "col1" FROM "table1" GROUP BY "col1" HAVING COUNT("col5") <> 5;]', () => {
			const actual = sql
				.select(col1)
				.from(table)
				.groupBy(col1)
				.having(col5.count.ne(5))
				.getSQL()

			expect(actual).toEqual('SELECT "col1" FROM "table1" GROUP BY "col1" HAVING COUNT("col5") <> 5;')
		})

		it('Produces [SELECT "col1" FROM "table1" GROUP BY "col1" HAVING COUNT("col4") > 4 AND AVG("col5") >= 5 AND MAX("col6") < 6 OR MIN("col6") <= 7;]', () => {
			const actual = sql
				.select(col1)
				.from(table)
				.groupBy(col1)
				.having(col4.count.gt(4))
				.and(col5.avg.ge(5))
				.and(col6.max.lt(6))
				.or(col6.min.le(7))
				.getSQL()

			expect(actual).toEqual('SELECT "col1" FROM "table1" GROUP BY "col1" HAVING COUNT("col4") > 4 AND AVG("col5") >= 5 AND MAX("col6") < 6 OR MIN("col6") <= 7;')
		})

	})

	describe('test with binders values', () => {
		it('Produces [SELECT "col1" FROM "table1" GROUP BY "col1" HAVING SUM("col4") = $1;]', () => {
			const actual = sql
				.select(col1)
				.from(table)
				.groupBy(col1)
				.having(col4.sum.eq$(4))

			const expectedSql = 'SELECT "col1" FROM "table1" GROUP BY "col1" HAVING SUM("col4") = $1;'
			const expectedValues = [4]

			expect(actual.getSQL()).toEqual(expectedSql)
			expect(actual.getBindValues()).toEqual(expectedValues)
		})

		it('Produces [SELECT "col1" FROM "table1" GROUP BY "col1" HAVING AVG("col4") > $1;]', () => {
			const actual = sql
				.select(col1)
				.from(table)
				.groupBy(col1)
				.having(col4.avg.gt$(4))

			const expectedSql = 'SELECT "col1" FROM "table1" GROUP BY "col1" HAVING AVG("col4") > $1;'
			const expectedValues = [4]

			expect(actual.getSQL()).toEqual(expectedSql)
			expect(actual.getBindValues()).toEqual(expectedValues)
		})
		it('Produces [SELECT "col1" FROM "table1" GROUP BY "col1" HAVING COUNT("col4") > $1 AND SUM("col5") <> $2 AND AVG("col5") >= $3 AND MAX("col6") < $4 OR MIN("col6") <= $5;]', () => {
			const actual = sql
				.select(col1)
				.from(table)
				.groupBy(col1)
				.having(col4.count.gt$(4))
				.and(col5.sum.ne$(0))
				.and(col5.avg.ge$(5))
				.and(col6.max.lt$(6))
				.or(col6.min.le$(7))

			const expectedSql = 'SELECT "col1" FROM "table1" GROUP BY "col1" HAVING COUNT("col4") > $1 AND SUM("col5") <> $2 AND AVG("col5") >= $3 AND MAX("col6") < $4 OR MIN("col6") <= $5;'
			const expectedValues = [4, 0, 5, 6, 7]

			expect(actual.getSQL()).toEqual(expectedSql)
			expect(actual.getBindValues()).toEqual(expectedValues)
		})
	})

	describe('different steps after', () => {
		it(`Produces [SELECT "col1" FROM "table1" GROUP BY "col1" HAVING "col1" = 'a' ORDER BY "col1";]`, () => {
			const actual = sql
				.select(col1)
				.from(table)
				.groupBy(col1)
				.having(col1.eq('a'))
				.orderBy(col1)
				.getSQL()

			expect(actual).toEqual(`SELECT "col1" FROM "table1" GROUP BY "col1" HAVING "col1" = 'a' ORDER BY "col1";`)
		})
	})
})
