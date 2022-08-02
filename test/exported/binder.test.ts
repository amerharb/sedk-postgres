import { Builder, $ } from '../../src'
import { database } from '../database'

//Alias
const table1 = database.s.public.t.table1

describe('Test binder with multi builders', () => {
	const sql = new Builder(database)
	const sql1 = new Builder(database)
	const sql2 = new Builder(database)
	afterEach(() => {
		sql.cleanUp()
		sql1.cleanUp()
		sql2.cleanUp()
	})

	it('Produces [SELECT $1 FROM "table1";] 2 binds at the same time', () => {
		const actual1 = sql1
			.select($(1))
			.from(table1)
		const actual2 = sql2
			.select($(2))
			.from(table1)

		expect(actual1.getSQL()).toEqual('SELECT $1 FROM "table1";')
		expect(actual1.getBindValues()).toEqual([1])
		expect(actual2.getSQL()).toEqual('SELECT $1 FROM "table1";')
		expect(actual2.getBindValues()).toEqual([2])
	})

	it(`Produces [SELECT $1 FROM "table1";]`, () => {
		const actual = sql
			.select($(5))
			.from(table1)

		const expected = {
			sql: `SELECT $1 FROM "table1";`,
			values: [5],
		}
		expect(actual.getSQL()).toEqual(expected.sql)
		expect(actual.getBindValues()).toEqual(expected.values)
	})

	it(`Produces [SELECT $1, $2, $3, $4 FROM "table1";]`, () => {
		const actual = sql
			.select($(null), $(true), $(1), $(`a`))
			.from(table1)

		const expected = {
			sql: `SELECT $1, $2, $3, $4 FROM "table1";`,
			values: [null, true, 1, `a`],
		}
		expect(actual.getSQL()).toEqual(expected.sql)
		expect(actual.getBindValues()).toEqual(expected.values)
	})
})
