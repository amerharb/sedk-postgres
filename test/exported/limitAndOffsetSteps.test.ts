import {
	Builder,
	ALL,
} from '../../src'
import { database } from '../database'

//Alias
const table = database.s.public.t.table1

describe('Test LIMIT and OFFSET Steps', () => {
	const sql = new Builder(database)
	afterEach(() => { sql.cleanUp() })

	it('Produces [SELECT * FROM "table1" LIMIT 50 OFFSET 10;]', () => {
		const actual = sql
			.selectAsteriskFrom(table)
			.limit(50)
			.offset(10)
			.getSQL()

		expect(actual).toEqual('SELECT * FROM "table1" LIMIT 50 OFFSET 10;')
	})

	it('Produces [SELECT * FROM "table1" LIMIT $1 OFFSET $2;]', () => {
		const actual = sql
			.selectAsteriskFrom(table)
			.limit$(50)
			.offset$(10)

		const expected = {
			sql: 'SELECT * FROM "table1" LIMIT $1 OFFSET $2;',
			values: [50, 10],
		}

		expect(actual.getSQL()).toEqual(expected.sql)
		expect(actual.getBindValues()).toEqual(expected.values)
	})

	describe('LIMIT and OFFSET after Where Step', () => {
		it(`Produces [SELECT * FROM "table1" WHERE "col1" = 'a' LIMIT 50;]`, () => {
			const actual = sql
				.selectAsteriskFrom(table)
				.where(table.c.col1.eq('a'))
				.limit(50)
				.getSQL()

			expect(actual).toEqual(`SELECT * FROM "table1" WHERE "col1" = 'a' LIMIT 50;`)
		})

		it(`Produces [SELECT * FROM "table1" WHERE "col1" = 'a' OFFSET 10;]`, () => {
			const actual = sql
				.selectAsteriskFrom(table)
				.where(table.c.col1.eq('a'))
				.offset(10)
				.getSQL()

			expect(actual).toEqual(`SELECT * FROM "table1" WHERE "col1" = 'a' OFFSET 10;`)
		})

		it( `Produces [SELECT * FROM "table1" WHERE "col1" = 'a' LIMIT $1;]`, () => {
			const actual = sql
				.selectAsteriskFrom(table)
				.where(table.c.col1.eq('a'))
				.limit$(50)

			const expected = {
				sql: `SELECT * FROM "table1" WHERE "col1" = 'a' LIMIT $1;`,
				values: [50],
			}

			expect(actual.getSQL()).toEqual(expected.sql)
			expect(actual.getBindValues()).toEqual(expected.values)
		})

		it(`Produces [SELECT * FROM "table1" WHERE "col1" = 'a' OFFSET $1;]`, () => {
			const actual = sql
				.selectAsteriskFrom(table)
				.where(table.c.col1.eq('a'))
				.offset$(10)

			const expected = {
				sql: `SELECT * FROM "table1" WHERE "col1" = 'a' OFFSET $1;`,
				values: [10],
			}

			expect(actual.getSQL()).toEqual(expected.sql)
			expect(actual.getBindValues()).toEqual(expected.values)
		})
	})

	describe('LIMIT and OFFSET after Having Step', () => {
		it(`Produces [SELECT "col1", SUM("col4") FROM "table1" GROUP BY "col1" HAVING SUM("col1") = 'a' LIMIT 50;]`, () => {
			const actual = sql
				.select(table.c.col1, table.c.col4.sum)
				.from(table)
				.groupBy(table.c.col1)
				.having(table.c.col1.eq('a'))
				.limit(50)
				.getSQL()

			expect(actual).toEqual(`SELECT "col1", SUM("col4") FROM "table1" GROUP BY "col1" HAVING "col1" = 'a' LIMIT 50;`)
		})

		it(`Produces [SELECT "col1", SUM("col4") FROM "table1" GROUP BY "col1" HAVING "col1" = 'a' OFFSET 10;]`, () => {
			const actual = sql
				.select(table.c.col1, table.c.col4.sum)
				.from(table)
				.groupBy(table.c.col1)
				.having(table.c.col1.eq('a'))
				.offset(10)
				.getSQL()

			expect(actual).toEqual(`SELECT "col1", SUM("col4") FROM "table1" GROUP BY "col1" HAVING "col1" = 'a' OFFSET 10;`)
		})

		it(`Produces [SELECT "col1", SUM("col4") FROM "table1" GROUP BY "col1" HAVING "col1" = 'a' LIMIT $1;]`, () => {
			const actual = sql
				.select(table.c.col1, table.c.col4.sum)
				.from(table)
				.groupBy(table.c.col1)
				.having(table.c.col1.eq('a'))
				.limit$(50)

			const expected = {
				sql: `SELECT "col1", SUM("col4") FROM "table1" GROUP BY "col1" HAVING "col1" = 'a' LIMIT $1;`,
				values: [50],
			}

			expect(actual.getSQL()).toEqual(expected.sql)
			expect(actual.getBindValues()).toEqual(expected.values)
		})

		it(`Produces [SELECT "col1", SUM("col4") FROM "table1" GROUP BY "col1" HAVING "col1" = 'a' OFFSET $1;]`, () => {
			const actual = sql
				.select(table.c.col1, table.c.col4.sum)
				.from(table)
				.groupBy(table.c.col1)
				.having(table.c.col1.eq('a'))
				.offset$(10)

			const expected = {
				sql: `SELECT "col1", SUM("col4") FROM "table1" GROUP BY "col1" HAVING "col1" = 'a' OFFSET $1;`,
				values: [10],
			}

			expect(actual.getSQL()).toEqual(expected.sql)
			expect(actual.getBindValues()).toEqual(expected.values)
		})
	})

	describe('LIMIT and OFFSET with float value', () => {
		it(`Produces [SELECT * FROM "table1" LIMIT 1.9999 OFFSET 0.1;]`, () => {
			const actual = sql.selectAsteriskFrom(table).limit(1.9999).offset(0.1).getSQL()

			expect(actual).toEqual(`SELECT * FROM "table1" LIMIT 1.9999 OFFSET 0.1;`)
		})
		it(`Produces [SELECT * FROM "table1" LIMIT 0.12345678901234568;]`, () => {
			/** value will be rounded */
			const actual = sql.selectAsteriskFrom(table).limit(0.1234567890123456789012345).getSQL()

			expect(actual).toEqual(`SELECT * FROM "table1" LIMIT 0.12345678901234568;`)
		})
		it(`Produces [SELECT * FROM "table1" LIMIT 0.3333333333333333;]`, () => {
			/** value will be rounded */
			const actual = sql.selectAsteriskFrom(table).limit(1/3).getSQL()

			expect(actual).toEqual(`SELECT * FROM "table1" LIMIT 0.3333333333333333;`)
		})
	})

	it('Produces [SELECT * FROM "table1" LIMIT 50;]', () => {
		const actual = sql
			.selectAsteriskFrom(table)
			.limit(50)
			.getSQL()

		expect(actual).toEqual('SELECT * FROM "table1" LIMIT 50;')
	})

	it('Produces [SELECT * FROM "table1" LIMIT $1;]', () => {
		const actual = sql
			.selectAsteriskFrom(table)
			.limit$(50)

		const expected = {
			sql: 'SELECT * FROM "table1" LIMIT $1;',
			values: [50],
		}

		expect(actual.getSQL()).toEqual(expected.sql)
		expect(actual.getBindValues()).toEqual(expected.values)
	})

	it('Produces [SELECT * FROM "table1" LIMIT NULL;]', () => {
		const actual = sql
			.selectAsteriskFrom(table)
			.limit(null)
			.getSQL()

		expect(actual).toEqual('SELECT * FROM "table1" LIMIT NULL;')
	})

	it('Produces [SELECT * FROM "table1" LIMIT ALL;]', () => {
		const actual = sql
			.selectAsteriskFrom(table)
			.limit(ALL)
			.getSQL()

		expect(actual).toEqual('SELECT * FROM "table1" LIMIT ALL;')
	})

	it('Produces [SELECT * FROM "table1" LIMIT $1;] ($1 = null)', () => {
		const actual = sql
			.selectAsteriskFrom(table)
			.limit$(null)

		const expected = {
			sql: 'SELECT * FROM "table1" LIMIT $1;',
			values: [null],
		}

		expect(actual.getSQL()).toEqual(expected.sql)
		expect(actual.getBindValues()).toEqual(expected.values)
	})

	it('Produces [SELECT * FROM "table1" OFFSET 10;]', () => {
		const actual = sql
			.selectAsteriskFrom(table)
			.offset(10)
			.getSQL()

		expect(actual).toEqual('SELECT * FROM "table1" OFFSET 10;')
	})

	it('Produces [SELECT * FROM "table1" OFFSET $1;]', () => {
		const actual = sql
			.selectAsteriskFrom(table)
			.offset$(10)

		const expected = {
			sql: 'SELECT * FROM "table1" OFFSET $1;',
			values: [10],
		}

		expect(actual.getSQL()).toEqual(expected.sql)
		expect(actual.getBindValues()).toEqual(expected.values)
	})
})
