import { Builder } from '../../../src'
import { database } from '../../database'
//Alias
const publicTable1 = database.s.public.t.table1
const col1 = database.s.public.t.table1.c.col1
const table2 = database.s.public.t.table2
const publicTable2col1 = database.s.public.t.table2.c.col1
const schema1Table1 = database.s.schema1.t.table1
const table1col1 = database.s.schema1.t.table1.c.col1

describe('Test From Step', () => {
	describe('Multi Tables comma separated', () => {
		const sql = new Builder(database)
		afterEach(() => { sql.cleanUp() })
		describe('Two Tables', () => {
			it('Produces [SELECT "table1"."col1", "table2"."col1" FROM "table1", "table2";]', () => {
				const actual = sql
					.select(col1, publicTable2col1)
					.from(publicTable1, table2)
					.getSQL()

				expect(actual).toEqual('SELECT "table1"."col1", "table2"."col1" FROM "table1", "table2";')
			})
		})
		describe('Three Tables', () => {
			it('Produces [SELECT "public"."table1"."col1", "table2"."col1", "schema1"."table1"."col1" FROM "table1", "table2", "schema1"."table1";]', () => {
				const actual = sql
					.select(col1, publicTable2col1, table1col1)
					.from(publicTable1, table2, schema1Table1)
					.getSQL()

				expect(actual).toEqual('SELECT "public"."table1"."col1", "table2"."col1", "schema1"."table1"."col1"'
          + ' FROM "table1", "table2", "schema1"."table1";')
			})
		})
	})

	describe('Multi Tables CROSS JOIN separated', () => {
		const sql = new Builder(database)
		afterEach(() => { sql.cleanUp() })
		describe('Two Tables', () => {
			it('Produces [SELECT "table1"."col1", "table2"."col1" FROM "table1" CROSS JOIN "table2";]', () => {
				const actual = sql
					.select(col1, publicTable2col1)
					.from(publicTable1)
					.crossJoin(table2)
					.getSQL()

				expect(actual).toEqual('SELECT "table1"."col1", "table2"."col1" FROM "table1" CROSS JOIN "table2";')
			})
		})

		describe('Three Tables', () => {
			it('Produces [SELECT "public"."table1"."col1", "table2"."col1", "schema1"."table1"."col1" FROM "table1" CROSS JOIN "table2" CROSS JOIN "schema1"."table1";]', () => {
				const actual = sql
					.select(col1, publicTable2col1, table1col1)
					.from(publicTable1)
					.crossJoin(table2)
					.crossJoin(schema1Table1)
					.getSQL()

				expect(actual).toEqual('SELECT "public"."table1"."col1", "table2"."col1", "schema1"."table1"."col1"'
          + ' FROM "table1" CROSS JOIN "table2" CROSS JOIN "schema1"."table1";')
			})
		})
	})
})
