import { Builder } from '../../../src'
import { database } from '../../database'
//Alias
const table1 = database.s.public.t.table1
const table1Col1 = database.s.public.t.table1.c.col1
const table1Col2 = database.s.public.t.table1.c.col2
const table2 = database.s.public.t.table2
const table2Col1 = database.s.public.t.table2.c.col1

describe('test leftJoin step', () => {
	const sql = new Builder(database)
	afterEach(() => { sql.cleanUp() })
	describe('basic left join', () => {
		it('Produces [SELECT * FROM "table1" LEFT JOIN "table2" ON "table1"."col1" = "table2"."col1";]', () => {
			const actual = sql
				.selectAsteriskFrom(table1)
				.leftJoin(table2)
				.on(table1Col1.eq(table2.c.col1))
				.getSQL()

			expect(actual).toEqual('SELECT * FROM "table1" LEFT JOIN "table2" ON "table1"."col1" = "table2"."col1";')
		})
		it('Produces [SELECT * FROM "table1" LEFT JOIN "table2" ON "table1"."col1" = "table2"."col1" AND "table1"."col2" = "table2"."col2";]', () => {
			const actual = sql
				.selectAsteriskFrom(table1)
				.leftJoin(table2)
				.on(table1Col1.eq(table2.c.col1))
				.and(table1.c.col2.eq(table2.c.col2))
				.getSQL()

			expect(actual).toEqual('SELECT * FROM "table1" LEFT JOIN "table2" ON "table1"."col1" = "table2"."col1" AND "table1"."col2" = "table2"."col2";')
		})
		it('Produces [SELECT * FROM "table1" LEFT JOIN "table2" ON "table1"."col1" = "table2"."col1" OR "table1"."col2" = "table2"."col2";]', () => {
			const actual = sql
				.selectAsteriskFrom(table1)
				.leftJoin(table2)
				.on(table1Col1.eq(table2.c.col1))
				.or(table1.c.col2.eq(table2.c.col2))
				.getSQL()

			expect(actual).toEqual('SELECT * FROM "table1" LEFT JOIN "table2" ON "table1"."col1" = "table2"."col1" OR "table1"."col2" = "table2"."col2";')
		})
	})

	describe('Different steps after left join', () => {
		it(`Produces [SELECT * FROM "table1" LEFT JOIN "table2" ON "table1"."col1" = "table2"."col1" WHERE "table1"."col1" = 'a';]`, () => {
			const actual = sql
				.selectAsteriskFrom(table1)
				.leftJoin(table2)
				.on(table1Col1.eq(table2Col1))
				.where(table1Col1.eq('a'))
				.getSQL()

			expect(actual).toEqual(`SELECT * FROM "table1" LEFT JOIN "table2" ON "table1"."col1" = "table2"."col1" WHERE "table1"."col1" = 'a';`)
		})

		it('Produces [SELECT * FROM "table1" LEFT JOIN "table2" GROUP BY "table1"."col2";]', () => {
			const actual = sql
				.selectAsteriskFrom(table1)
				.leftJoin(table2)
				.on(table1Col1.eq(table2Col1))
				.groupBy(table1Col2)
				.getSQL()

			expect(actual).toEqual('SELECT * FROM "table1" LEFT JOIN "table2" ON "table1"."col1" = "table2"."col1" GROUP BY "table1"."col2";')
		})

		it('Produces [SELECT * FROM "table1" LEFT JOIN "table2" ORDER BY "table1"."col2";]', () => {
			const actual = sql
				.selectAsteriskFrom(table1)
				.leftJoin(table2)
				.on(table1Col1.eq(table2Col1))
				.orderBy(table1Col2)
				.getSQL()

			expect(actual).toEqual('SELECT * FROM "table1" LEFT JOIN "table2" ON "table1"."col1" = "table2"."col1" ORDER BY "table1"."col2";')
		})

		it('Produces [SELECT * FROM "table1" LEFT JOIN "table2" ON "table1"."col1" = "table2"."col1" LIMIT 10;]', () => {
			const actual = sql
				.selectAsteriskFrom(table1)
				.leftJoin(table2)
				.on(table1Col1.eq(table2Col1))
				.limit(10)
				.getSQL()

			expect(actual).toEqual('SELECT * FROM "table1" LEFT JOIN "table2" ON "table1"."col1" = "table2"."col1" LIMIT 10;')
		})

		it('Produces [SELECT * FROM "table1" LEFT JOIN "table2" ON "table1"."col1" = "table2"."col1" OFFSET 20;]', () => {
			const actual = sql
				.selectAsteriskFrom(table1)
				.leftJoin(table2)
				.on(table1Col1.eq(table2Col1))
				.offset(20)
				.getSQL()

			expect(actual).toEqual('SELECT * FROM "table1" LEFT JOIN "table2" ON "table1"."col1" = "table2"."col1" OFFSET 20;')
		})

	})
})
