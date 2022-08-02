import { Builder } from '../../../src'
import { database } from '../../database'
//Alias
const table1 = database.s.public.t.table1
const col1 = table1.c.col1
const col2 = table1.c.col2
const table2 = database.s.public.t.table2
const table3 = database.s.public.t.table3

describe('Test CROSS JOIN Step', () => {
	const sql = new Builder(database)
	afterEach(() => { sql.cleanUp() })
	describe('Diffreant steps after cross join', () => {
		it(`Produces [SELECT "table1"."col1" FROM "table1" CROSS JOIN "table2" WHERE "table1"."col1" = 'a';]`, () => {
			const actual = sql
				.select(col1)
				.from(table1)
				.crossJoin(table2)
				.where(col1.eq('a'))
				.getSQL()

			expect(actual).toEqual(`SELECT "table1"."col1" FROM "table1" CROSS JOIN "table2" WHERE "table1"."col1" = 'a';`)
		})

		it('Produces [SELECT "table1"."col1" FROM "table1" CROSS JOIN "table2" GROUP BY "table1"."col2";]', () => {
			const actual = sql
				.select(col1)
				.from(table1)
				.crossJoin(table2)
				.groupBy(col2)
				.getSQL()

			expect(actual).toEqual('SELECT "table1"."col1" FROM "table1" CROSS JOIN "table2" GROUP BY "table1"."col2";')
		})

		it('Produces [SELECT "table1"."col1" FROM "table1" CROSS JOIN "table2" ORDER BY "table1"."col2";]', () => {
			const actual = sql
				.select(col1)
				.from(table1)
				.crossJoin(table2)
				.orderBy(col2)
				.getSQL()

			expect(actual).toEqual('SELECT "table1"."col1" FROM "table1" CROSS JOIN "table2" ORDER BY "table1"."col2";')
		})

		it('Produces [SELECT "table1"."col1" FROM "table1" CROSS JOIN "table2" LIMIT 10;]', () => {
			const actual = sql
				.select(col1)
				.from(table1)
				.crossJoin(table2)
				.limit(10)
				.getSQL()

			expect(actual).toEqual('SELECT "table1"."col1" FROM "table1" CROSS JOIN "table2" LIMIT 10;')
		})

		it('Produces [SELECT "table1"."col1" FROM "table1" CROSS JOIN "table2" OFFSET 20;]', () => {
			const actual = sql
				.select(col1)
				.from(table1)
				.crossJoin(table2)
				.offset(20)
				.getSQL()

			expect(actual).toEqual('SELECT "table1"."col1" FROM "table1" CROSS JOIN "table2" OFFSET 20;')
		})

		it('Produces [SELECT "table1"."col1" FROM "table1" CROSS JOIN "table2"  CROSS JOIN "table3";]', () => {
			const actual = sql
				.select(col1)
				.from(table1)
				.crossJoin(table2)
				.crossJoin(table3)
				.getSQL()

			expect(actual).toEqual('SELECT "table1"."col1" FROM "table1" CROSS JOIN "table2" CROSS JOIN "table3";')
		})
	})
})
