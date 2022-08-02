import * as sedk from '../../../src'
import { ASTERISK, DEFAULT } from '../../../src'
import { database } from '../../database'

//Alias
const e = sedk.e
const table1 = database.s.public.t.table1
const col1 = table1.c.col1
const col2 = table1.c.col2
const col3 = table1.c.col3
const col4 = table1.c.col4
const col5 = table1.c.col5
const col7 = table1.c.col7
const col8 = table1.c.col8
const col9 = table1.c.col9
const col10 = table1.c.col10

describe('UPDATE Path', () => {
	const sql = new sedk.Builder(database)
	afterEach(() => { sql.cleanUp() })
	const EPOCH_2022_07_23 = Date.UTC(2022, 6, 23)
	describe('Basic update all', () => {
		it(`Produces [UPDATE "table1" SET "col1" = 'A';]`, () => {
			const actual = sql
				.update(table1)
				.set(col1.let('A'))
				.getSQL()
			expect(actual).toEqual(`UPDATE "table1" SET "col1" = 'A';`)
		})
		it(`Produces [UPDATE "table1" SET "col1" = 'A', "col4" = 1, "col7" = TRUE, "col9" = '2022-07-23T00:00:00.000Z';]`, () => {
			const actual = sql
				.update(table1)
				.set(col1.let('A'), col4.let(1), col7.let(true), col9.let(new Date(EPOCH_2022_07_23)))
				.getSQL()
			expect(actual).toEqual(`UPDATE "table1" SET "col1" = 'A', "col4" = 1, "col7" = TRUE, "col9" = '2022-07-23T00:00:00.000Z';`)
		})
		it(`Produces [UPDATE "table1" SET "col1" = NULL, "col4" = NULL, "col7" = NULL, "col9" = NULL;]`, () => {
			const actual = sql
				.update(table1)
				.set(
					col1.let(null),
					col4.let(null),
					col7.let(null),
					col9.let(null),
				)
				.getSQL()
			expect(actual).toEqual(`UPDATE "table1" SET "col1" = NULL, "col4" = NULL, "col7" = NULL, "col9" = NULL;`)
		})
	})
	describe('Update with Where', () => {
		it(`Produces [UPDATE "table1" SET "col1" = 'A' WHERE 1 = 1;]`, () => {
			const actual = sql
				.update(table1)
				.set(col1.let('A'))
				.where(e(1).eq(1))
				.getSQL()
			expect(actual).toEqual(`UPDATE "table1" SET "col1" = 'A' WHERE 1 = 1;`)
		})
		it(`Produces [UPDATE "table1" SET "col1" = 'A' WHERE 1 = 1 AND "col2" = 'B' OR "col3" = 'C';]`, () => {
			const actual = sql
				.update(table1)
				.set(col1.let('A'))
				.where(e(1).eq(1))
				.and(col2.eq('B'))
				.or(col3.eq('C'))
				.getSQL()
			expect(actual).toEqual(`UPDATE "table1" SET "col1" = 'A' WHERE 1 = 1 AND "col2" = 'B' OR "col3" = 'C';`)
		})
	})
	describe('Update with Returning', () => {
		it(`Produces [UPDATE "table1" SET "col1" = 'A' WHERE 1 = 1 RETURNING *;]`, () => {
			const actual = sql
				.update(table1)
				.set(col1.let('A'))
				.where(e(1).eq(1))
				.returning(ASTERISK)
				.getSQL()
			expect(actual).toEqual(`UPDATE "table1" SET "col1" = 'A' WHERE 1 = 1 RETURNING *;`)
		})
		it(`Produces [UPDATE "table1" SET "col1" = 'A' RETURNING *;]`, () => {
			const actual = sql
				.update(table1)
				.set(col1.let('A'))
				.returning(ASTERISK)
				.getSQL()
			expect(actual).toEqual(`UPDATE "table1" SET "col1" = 'A' RETURNING *;`)
		})
	})
	describe('Update with Binders', () => {
		it(`Produces [UPDATE "table1" SET "col1" = $1;]`, () => {
			const actual = sql
				.update(table1)
				.set(col1.let$('A'))

			expect(actual.getSQL()).toEqual(`UPDATE "table1" SET "col1" = $1;`)
			expect(actual.getBindValues()).toEqual(['A'])
		})
		it(`Produces [UPDATE "table1" SET "col1" = $1, "col4" = $2, "col7" = $3, "col9" = $4;]`, () => {
			const actual = sql
				.update(table1)
				.set(
					col1.let$('A'),
					col4.let$(1),
					col7.let$(true),
					col9.let$(new Date(EPOCH_2022_07_23))
				)

			expect(actual.getSQL()).toEqual(`UPDATE "table1" SET "col1" = $1, "col4" = $2, "col7" = $3, "col9" = $4;`)
			expect(actual.getBindValues()).toEqual(['A', 1, true, new Date(EPOCH_2022_07_23)])
		})
	})
	describe('Update with Binders', () => {
		it(`Produces [UPDATE "table1" SET "col1" = DEFAULT;]`, () => {
			const actual = sql
				.update(table1)
				.set(col1.let(DEFAULT))

			expect(actual.getSQL()).toEqual(`UPDATE "table1" SET "col1" = DEFAULT;`)
		})
		it(`Produces [UPDATE "table1" SET "col1" = DEFAULT, "col4" = DEFAULT, "col7" = DEFAULT, "col9" = DEFAULT;]`, () => {
			const actual = sql
				.update(table1)
				.set(
					col1.let(DEFAULT),
					col4.let(DEFAULT),
					col7.let(DEFAULT),
					col9.let(DEFAULT),
				)
				.getSQL()
			expect(actual).toEqual(`UPDATE "table1" SET "col1" = DEFAULT, "col4" = DEFAULT, "col7" = DEFAULT, "col9" = DEFAULT;`)
		})
		it(`Produces [UPDATE "table1" SET "col2" = DEFAULT, "col5" = DEFAULT, "col8" = DEFAULT, "col10" = DEFAULT;]`, () => {
			const actual = sql
				.update(table1)
				.set(
					col2.letDefault,
					col5.letDefault,
					col8.letDefault,
					col10.letDefault,
				)
				.getSQL()
			expect(actual).toEqual(`UPDATE "table1" SET "col2" = DEFAULT, "col5" = DEFAULT, "col8" = DEFAULT, "col10" = DEFAULT;`)
		})
	})
})
