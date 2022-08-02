import * as sedk from '../../../src'
import { database } from '../../database'
import { ASTERISK, DEFAULT } from '../../../src'

//Alias
const table1 = database.s.public.t.table1
const col1 = table1.c.col1
const col2 = table1.c.col2
const col3 = table1.c.col3
const col4 = table1.c.col4
const col7 = table1.c.col7
const table2 = database.s.public.t.table2
const T2col1 = table2.c.col1
const T2col2 = table2.c.col2

const $ = sedk.$

describe('INSERT Path', () => {
	const sql = new sedk.Builder(database)
	afterEach(() => { sql.cleanUp() })
	const EPOCH_2022_07_20 = Date.UTC(2022, 6, 20)
	describe('Basic insert all', () => {
		it(`Produces [INSERT INTO "table1" VALUES('A', 1, TRUE, '2022-07-20T00:00:00.000Z');]`, () => {
			const actual = sql
				.insert()
				.into(table1)
				.values('A', 1, true, new Date(EPOCH_2022_07_20))
				.getSQL()
			expect(actual).toEqual(`INSERT INTO "table1" VALUES('A', 1, TRUE, '2022-07-20T00:00:00.000Z');`)
		})
		it(`Produces [INSERT INTO "table1" VALUES(NULL, 'B', 2, FALSE, '2022-07-20T00:00:00.000Z');]`, () => {
			const actual = sql
				.insertInto(table1)
				.values(null, 'B', 2, false, new Date(EPOCH_2022_07_20))
				.getSQL()
			expect(actual).toEqual(`INSERT INTO "table1" VALUES(NULL, 'B', 2, FALSE, '2022-07-20T00:00:00.000Z');`)
		})
	})
	describe('Insert specific column', () => {
		it(`Produces [INSERT INTO "table1"("col1") VALUES('A');]`, () => {
			const actual = sql.insertInto(table1, col1).values('A').getSQL()
			expect(actual).toEqual(`INSERT INTO "table1"("col1") VALUES('A');`)
		})
		it(`Produces [INSERT INTO "table1"("col1", "col4", "col7") VALUES('A', 1, TRUE);]`, () => {
			const actual = sql.insertInto(table1, col1, col4, col7).values('A', 1, true).getSQL()
			expect(actual).toEqual(`INSERT INTO "table1"("col1", "col4", "col7") VALUES('A', 1, TRUE);`)
		})
	})
	describe('Insert with returning step', () => {
		it(`Produces [INSERT INTO "table1" VALUES('A') RETURNING "col1";]`, () => {
			const actual = sql
				.insertInto(table1)
				.values('A')
				.returning(col1)
				.getSQL()
			expect(actual).toEqual(`INSERT INTO "table1" VALUES('A') RETURNING "col1";`)
		})
		it(`Produces [INSERT INTO "table1"("col1") VALUES('A') RETURNING "col1";]`, () => {
			const actual = sql
				.insertInto(table1, col1)
				.values('A')
				.returning(col1)
				.getSQL()
			expect(actual).toEqual(`INSERT INTO "table1"("col1") VALUES('A') RETURNING "col1";`)
		})
	})
	describe('Insert with binder $', () => {
		it(`Produces [INSERT INTO "table1" VALUES($1);]`, () => {
			const actual = sql.insertInto(table1).values($('A'))
			expect(actual.getSQL()).toEqual(`INSERT INTO "table1" VALUES($1);`)
			expect(actual.getBindValues()).toEqual(['A'])
		})
		it(`Produces [INSERT INTO "table1"("col1") VALUES($1);]`, () => {
			const actual = sql.insertInto(table1, col1).values($('A'))
			expect(actual.getSQL()).toEqual(`INSERT INTO "table1"("col1") VALUES($1);`)
			expect(actual.getBindValues()).toEqual(['A'])
		})
		it(`Produces [INSERT INTO "table1" VALUES($1, $2, $3);]`, () => {
			const actual = sql.insertInto(table1).values($('A'), $(1), $(true))
			expect(actual.getSQL()).toEqual(`INSERT INTO "table1" VALUES($1, $2, $3);`)
			expect(actual.getBindValues()).toEqual(['A', 1, true])
		})
		it(`Produces [INSERT INTO "table1" VALUES($1, 1, $2);]`, () => {
			const actual = sql.insertInto(table1).values($('A'), 1, $(true))
			expect(actual.getSQL()).toEqual(`INSERT INTO "table1" VALUES($1, 1, $2);`)
			expect(actual.getBindValues()).toEqual(['A', true])
		})
		it(`Produces [INSERT INTO "table2" VALUES($1);]`, () => {
			const actual = sql.insertInto(table2).values$('A')
			expect(actual.getSQL()).toEqual(`INSERT INTO "table2" VALUES($1);`)
			expect(actual.getBindValues()).toEqual(['A'])
		})
		it(`Produces [INSERT INTO "table2" VALUES($1, $2, $3);]`, () => {
			const actual = sql.insertInto(table2).values$('A', 1, true)
			expect(actual.getSQL()).toEqual(`INSERT INTO "table2" VALUES($1, $2, $3);`)
			expect(actual.getBindValues()).toEqual(['A', 1, true])
		})
	})
	describe('Insert with select step', () => {
		it(`Produces [INSERT INTO "table1"("col1") SELECT 'A';]`, () => {
			const actual = sql
				.insertInto(table1, col1)
				.select('A')
				.getSQL()

			expect(actual).toEqual(`INSERT INTO "table1"("col1") SELECT 'A';`)
		})
		it(`Produces [INSERT INTO "table1"("col1", "col2") SELECT "col1", "col2" FROM "table2";]`, () => {
			const actual = sql
				.insertInto(table1, col1, col2)
				.select(T2col1, T2col2)
				.from(table2)
				.getSQL()

			expect(actual).toEqual(`INSERT INTO "table1"("col1", "col2") SELECT "col1", "col2" FROM "table2";`)
		})
		it(`Produces [INSERT INTO "table1"("col1", "col2") SELECT "col1", "col2" FROM "table2" RETURNING *;]`, () => {
			const actual = sql
				.insertInto(table1, col1, col2)
				.select(T2col1, T2col2)
				.from(table2)
				.returning(ASTERISK)
				.getSQL()

			expect(actual).toEqual(`INSERT INTO "table1"("col1", "col2") SELECT "col1", "col2" FROM "table2" RETURNING *;`)
		})
		it(`Produces [INSERT INTO "table1"("col2") SELECT "table2"."col2" FROM "table2" LEFT JOIN "table1" ON "table1"."col1" = "table2"."col1" RETURNING *;]`, () => {
			const actual = sql
				.insertInto(table1, col2)
				.select(T2col2)
				.from(table2)
				.leftJoin(table1)
				.on(col1.eq(T2col1))
				.returning(ASTERISK)
				.getSQL()

			expect(actual).toEqual(`INSERT INTO "table1"("col2") SELECT "table2"."col2" FROM "table2" LEFT JOIN "table1" ON "table1"."col1" = "table2"."col1" RETURNING *;`)
		})
		it(`Produces [INSERT INTO "table1"("col2") SELECT "col2" FROM "table2" WHERE "col1" = 'A' RETURNING *;]`, () => {
			const actual = sql
				.insertInto(table1, col2)
				.select(T2col2)
				.from(table2)
				.where(T2col1.eq('A'))
				.returning(ASTERISK)
				.getSQL()

			expect(actual).toEqual(`INSERT INTO "table1"("col2") SELECT "col2" FROM "table2" WHERE "col1" = 'A' RETURNING *;`)
		})
	})
	describe('Insert with DEFAULT keyword', () => {
		it(`Produces [INSERT INTO "table1"("col1") VALUES(DEFAULT);]`, () => {
			const actual = sql
				.insertInto(table1, col1)
				.values(DEFAULT)
				.getSQL()
			expect(actual).toEqual(`INSERT INTO "table1"("col1") VALUES(DEFAULT);`)
		})
		it(`Produces [INSERT INTO "table1"("col1", "col2", "col3") VALUES(DEFAULT, 'A', DEFAULT);]`, () => {
			const actual = sql
				.insertInto(table1, col1, col2, col3)
				.values(DEFAULT, 'A', DEFAULT)
				.getSQL()
			expect(actual).toEqual(`INSERT INTO "table1"("col1", "col2", "col3") VALUES(DEFAULT, 'A', DEFAULT);`)
		})
		it(`Produces [INSERT INTO "table1"("col1", "col2", "col3") VALUES('A', DEFAULT, 'B');]`, () => {
			const actual = sql
				.insertInto(table1, col1, col2, col3)
				.values('A', DEFAULT, 'B')
				.getSQL()
			expect(actual).toEqual(`INSERT INTO "table1"("col1", "col2", "col3") VALUES('A', DEFAULT, 'B');`)
		})
	})
	describe('Insert with DEFAULT VALUES keyword', () => {
		it(`Produces [INSERT INTO "table1"("col1") DEFAULT VALUES;]`, () => {
			const actual = sql
				.insertInto(table1, col1)
				.defaultValues()
				.getSQL()
			expect(actual).toEqual(`INSERT INTO "table1"("col1") DEFAULT VALUES;`)
		})
		it(`Produces [INSERT INTO "table1"("col1", "col2", "col3") DEFAULT VALUES;]`, () => {
			const actual = sql
				.insertInto(table1, col1, col2, col3)
				.defaultValues()
				.getSQL()
			expect(actual).toEqual(`INSERT INTO "table1"("col1", "col2", "col3") DEFAULT VALUES;`)
		})
	})
})
