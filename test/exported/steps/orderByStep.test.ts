import {
	ArithmeticOperator,
	Builder,
	e,
	o,
	ASC,
	DESC,
	NULLS_FIRST,
	NULLS_LAST,
} from '../../../src'
import { database } from '../../database'
//Alias
const table = database.s.public.t.table1
const col1 = database.s.public.t.table1.c.col1
const col2 = database.s.public.t.table1.c.col2
const col3 = database.s.public.t.table1.c.col3
const col4 = database.s.public.t.table1.c.col4
const col5 = database.s.public.t.table1.c.col5

describe('test orderBy Step', () => {
	const sql = new Builder(database)
	afterEach(() => { sql.cleanUp() })

	it('Produces [SELECT * FROM "table1" ORDER BY "col1", "col2";]', () => {
		const actual = sql
			.selectAsteriskFrom(table)
			.orderBy(col1, col2)
			.getSQL()

		expect(actual).toEqual('SELECT * FROM "table1" ORDER BY "col1", "col2";')
	})

	it('Produces [SELECT * FROM "table1" WHERE col4 = 1 ORDER BY "col1", "col2";]', () => {
		const actual = sql
			.selectAsteriskFrom(table)
			.where(col4.eq(1))
			.orderBy(col1, col2)
			.getSQL()

		expect(actual).toEqual('SELECT * FROM "table1" WHERE "col4" = 1 ORDER BY "col1", "col2";')
	})

	it('Produces [SELECT * FROM "table1" ORDER BY ("col4" + "col5");]', () => {
		const actual = sql
			.selectAsteriskFrom(table)
			.orderBy(e(col4, ArithmeticOperator.ADD, col5))
			.getSQL()

		expect(actual).toEqual('SELECT * FROM "table1" ORDER BY ("col4" + "col5");')
	})

	it('Produces [SELECT * FROM "table1" ORDER BY col1 DESC NULLS FIRST;]', () => {
		const actual = sql
			.selectAsteriskFrom(table)
			.orderBy(o(col1, DESC, NULLS_FIRST))
			.getSQL()

		expect(actual).toEqual('SELECT * FROM "table1" ORDER BY "col1" DESC NULLS FIRST;')
	})

	it('Produces [SELECT * FROM "table1" ORDER BY col1 ASC;]', () => {
		const actual = sql
			.selectAsteriskFrom(table)
			.orderBy(o(col1, DESC, NULLS_FIRST))
			.getSQL()

		expect(actual).toEqual('SELECT * FROM "table1" ORDER BY "col1" DESC NULLS FIRST;')
	})

	it('Produces [SELECT * FROM "table1" ORDER BY ("col4" + "col5") DESC;]', () => {
		const actual = sql
			.selectAsteriskFrom(table)
			.orderBy(o(e(col4, ArithmeticOperator.ADD, col5), DESC))
			.getSQL()

		expect(actual).toEqual('SELECT * FROM "table1" ORDER BY ("col4" + "col5") DESC;')
	})

	it('Produces [SELECT ("col4" + "col5") AS "Col:4+5" FROM "table1" ORDER BY "Col:4+5";]', () => {
		const actual = sql
			.select(e(col4, ArithmeticOperator.ADD, col5).as('Col:4+5'))
			.from(table)
			.orderBy('Col:4+5')
			.getSQL()

		expect(actual).toEqual('SELECT ("col4" + "col5") AS "Col:4+5" FROM "table1" ORDER BY "Col:4+5";')
	})

	it('Throws error when ORDER BY alias not exist', () => {
		function actual() {
			sql
				.select(col1.as('A'))
				.from(table)
				.orderBy('B')
				.getSQL()
		}

		expect(actual).toThrowError('Alias B is not exist, if this is a column, then it should be entered as Column class')
	})

	it('Produces [SELECT * FROM "table1" ORDER BY "col1" ASC, "col2" DESC;]', () => {
		const actual = sql
			.selectAsteriskFrom(table)
			.orderBy(col1.asc, col2.desc)
			.getSQL()

		expect(actual).toEqual('SELECT * FROM "table1" ORDER BY "col1" ASC, "col2" DESC;')
	})

	it('Produces [SELECT * FROM "table1" ORDER BY "col1" ASC, "col2" DESC, "col3" NULLS FIRST, "col4" NULLS LAST;]', () => {
		const actual = sql
			.selectAsteriskFrom(table)
			.orderBy(col1.asc, col2.desc, col3.nullsFirst, col4.nullsLast)
			.getSQL()

		expect(actual).toEqual('SELECT * FROM "table1" ORDER BY "col1" ASC, "col2" DESC, "col3" NULLS FIRST, "col4" NULLS LAST;')
	})

	it('Produces [SELECT * FROM "table1" ORDER BY "col1" ASC NULLS FIRST, "col2" DESC NULLS FIRST, "col3" ASC NULLS LAST, "col4" DESC NULLS LAST;]', () => {
		const actual = sql
			.selectAsteriskFrom(table)
			.orderBy(col1.ascNullsFirst, col2.descNullsFirst, col3.ascNullsLast, col4.descNullsLast)
			.getSQL()

		expect(actual).toEqual('SELECT * FROM "table1" ORDER BY "col1" ASC NULLS FIRST, "col2" DESC NULLS FIRST, "col3" ASC NULLS LAST, "col4" DESC NULLS LAST;')
	})

	it('Produces [SELECT "col1" AS "C1" FROM "table1" ORDER BY "C1" DESC NULLS FIRST, "col2" ASC NULLS LAST;]', () => {
		const actual = sql
			.select(col1.as('C1'))
			.from(table)
			.orderBy('C1', DESC, NULLS_FIRST, col2, ASC, NULLS_LAST)
			.getSQL()

		expect(actual).toEqual('SELECT "col1" AS "C1" FROM "table1" ORDER BY "C1" DESC NULLS FIRST, "col2" ASC NULLS LAST;')
	})

	it('Produces [SELECT "col1" AS "C1" FROM "table1" ORDER BY "C1" DESC, "col2" NULLS LAST;]', () => {
		const actual = sql
			.select(col1.as('C1'))
			.from(table)
			.orderBy('C1', DESC, col2, NULLS_LAST)
			.getSQL()

		expect(actual).toEqual('SELECT "col1" AS "C1" FROM "table1" ORDER BY "C1" DESC, "col2" NULLS LAST;')
	})

	it('Produces [SELECT "col1" AS " DESC" FROM "table1" ORDER BY " DESC";]', () => {
		const actual = sql
			.select(col1.as(' DESC'))
			.from(table)
			.orderBy(' DESC')
			.getSQL()

		expect(actual).toEqual('SELECT "col1" AS " DESC" FROM "table1" ORDER BY " DESC";')
	})

	it('Produces [SELECT "col1" AS " NULLS FIRST" FROM "table1" ORDER BY " NULLS FIRST";]', () => {
		const actual = sql
			.select(col1.as(' NULLS FIRST'))
			.from(table)
			.orderBy(' NULLS FIRST')
			.getSQL()

		expect(actual).toEqual('SELECT "col1" AS " NULLS FIRST" FROM "table1" ORDER BY " NULLS FIRST";')
	})
})
