import {
	Builder,
	ALL,
	DISTINCT,
} from '../../src'
import { database } from '../database'
//Alias
const table = database.s.public.t.table1
const col1 = database.s.public.t.table1.c.col1
const col2 = database.s.public.t.table1.c.col2


describe('test orderBy Step', () => {
	const sql = new Builder(database)
	afterEach(() => { sql.cleanUp() })

	/* In Postgres it is allowed to have FROM directly
   after SELECT with or without ALL
   */
	it('Produces [SELECT ALL FROM "table1";]', () => {
		const actual = sql
			.selectAll()
			.from(table)
			.getSQL()

		expect(actual).toEqual('SELECT ALL FROM "table1";')
	})

	it('Produces [SELECT DISTINCT "col1", "col2" FROM "table1";]', () => {
		const actual = sql
			.selectDistinct(col1, col2)
			.from(table)
			.getSQL()

		expect(actual).toEqual('SELECT DISTINCT "col1", "col2" FROM "table1";')
	})

	it('Produces [SELECT ALL "col1", "col2" FROM "table1";]', () => {
		const actual = sql
			.selectAll(col1, col2)
			.from(table)
			.getSQL()

		expect(actual).toEqual('SELECT ALL "col1", "col2" FROM "table1";')
	})

	it('Produces [SELECT DISTINCT "col1", "col2" FROM "table1";] using select first param', () => {
		const actual = sql
			.select(DISTINCT, col1, col2)
			.from(table)
			.getSQL()

		expect(actual).toEqual('SELECT DISTINCT "col1", "col2" FROM "table1";')
	})

	it('Produces [SELECT ALL "col1", "col2" FROM "table1";] using select first param', () => {
		const actual = sql
			.select(ALL, col1, col2)
			.from(table)
			.getSQL()

		expect(actual).toEqual('SELECT ALL "col1", "col2" FROM "table1";')
	})

	it('Produces [SELECT ALL FROM "table1";] only ALL is valid (as param)', () => {
		const actual = sql
			.select(ALL)
			.from(table)
			.getSQL()

		expect(actual).toEqual('SELECT ALL FROM "table1";')
	})

	it('Produces [SELECT ALL FROM "table1";] only ALL is valid (using selectAll())', () => {
		const actual = sql
			.selectAll()
			.from(table)
			.getSQL()

		expect(actual).toEqual('SELECT ALL FROM "table1";')
	})
})
