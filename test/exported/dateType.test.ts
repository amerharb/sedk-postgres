import { Builder } from '../../src'
import { database } from '../database'

//Alias
const table1 = database.s.public.t.table1
const col9 = table1.c.col9
const col10 = table1.c.col10

describe(`test Date column`, () => {
	const sql = new Builder(database)
	afterEach(() => { sql.cleanUp() })
	const EPOCH_2022_06_20 = Date.UTC(2022, 5, 20)
	describe(`IsEqual operator`, () => {
		it(`Produces [SELECT * FROM "table1" WHERE "col9" = "col10";]`, () => {
			const actual = sql.selectAsteriskFrom(table1).where(col9.isEq(col10)).getSQL()
			expect(actual).toEqual(`SELECT * FROM "table1" WHERE "col9" = "col10";`)
		})
		it(`Produces [SELECT "col9" FROM "table1" WHERE "col9" = '2022-06-20T00:00:00.000Z';]`, () => {
			const actual = sql.select(col9).from(table1).where(col9.isEq(new Date(EPOCH_2022_06_20))).getSQL()
			expect(actual).toEqual(`SELECT "col9" FROM "table1" WHERE "col9" = '2022-06-20T00:00:00.000Z';`)
		})
		it(`Produces [SELECT "col9" FROM "table1" WHERE "col9" IS NULL;]`, () => {
			const actual = sql.select(col9).from(table1).where(col9.isEq(null)).getSQL()
			expect(actual).toEqual(`SELECT "col9" FROM "table1" WHERE "col9" IS NULL;`)
		})
		it(`Produces [SELECT "col9" FROM "table1" WHERE "col9" IS NULL;]`, () => {
			const actual = sql.select(col9).from(table1).where(col9.isEq(null)).getSQL()
			expect(actual).toEqual(`SELECT "col9" FROM "table1" WHERE "col9" IS NULL;`)
		})
		it(`Produces [SELECT "col9" FROM "table1" WHERE "col9" = $1;]`, () => {
			const actual = sql.select(col9).from(table1).where(col9.isEq$(new Date(EPOCH_2022_06_20)))
			const expected = {
				sql: `SELECT "col9" FROM "table1" WHERE "col9" = $1;`,
				values: [new Date(EPOCH_2022_06_20)],
			}
			expect(actual.getSQL()).toEqual(expected.sql)
			expect(actual.getBindValues()).toEqual(expected.values)
		})
	})

	describe(`Equal operator`, () => {
		it(`Produces [SELECT * FROM "table1" WHERE "col9" = "col10";]`, () => {
			const actual = sql.selectAsteriskFrom(table1).where(col9.eq(col10)).getSQL()

			expect(actual).toEqual(`SELECT * FROM "table1" WHERE "col9" = "col10";`)
		})
		it(`Produces [SELECT "col9" FROM "table1" WHERE "col9" = '2022-06-20T00:00:00.000Z';]`, () => {
			const actual = sql.select(col9).from(table1).where(col9.eq(new Date(EPOCH_2022_06_20))).getSQL()

			expect(actual).toEqual(`SELECT "col9" FROM "table1" WHERE "col9" = '2022-06-20T00:00:00.000Z';`)
		})
		it(`Produces [SELECT "col9" FROM "table1" WHERE "col9" = $1;]`, () => {
			const actual = sql.select(col9).from(table1).where(col9.eq$(new Date(EPOCH_2022_06_20)))

			const expected = {
				sql: `SELECT "col9" FROM "table1" WHERE "col9" = $1;`,
				values: [new Date(EPOCH_2022_06_20)],
			}
			expect(actual.getSQL()).toEqual(expected.sql)
			expect(actual.getBindValues()).toEqual(expected.values)
		})
	})

	describe(`IsNotEqual operator`, () => {
		it(`Produces [SELECT * FROM "table1" WHERE "col9" <> "col10";]`, () => {
			const actual = sql.selectAsteriskFrom(table1).where(col9.isNe(col10)).getSQL()
			expect(actual).toEqual(`SELECT * FROM "table1" WHERE "col9" <> "col10";`)
		})
		it(`Produces [SELECT "col9" FROM "table1" WHERE "col9" <> '2022-06-20T00:00:00.000Z';]`, () => {
			const actual = sql.select(col9).from(table1).where(col9.isNe(new Date(EPOCH_2022_06_20))).getSQL()
			expect(actual).toEqual(`SELECT "col9" FROM "table1" WHERE "col9" <> '2022-06-20T00:00:00.000Z';`)
		})
		it(`Produces [SELECT "col9" FROM "table1" WHERE "col9" <> $1;]`, () => {
			const actual = sql.select(col9).from(table1).where(col9.isNe$(new Date(EPOCH_2022_06_20)))
			const expected = {
				sql: `SELECT "col9" FROM "table1" WHERE "col9" <> $1;`,
				values: [new Date(EPOCH_2022_06_20)],
			}
			expect(actual.getSQL()).toEqual(expected.sql)
			expect(actual.getBindValues()).toEqual(expected.values)
		})
		it(`Produces [SELECT "col9" FROM "table1" WHERE "col9" IS NOT NULL;]`, () => {
			const actual = sql.select(col9).from(table1).where(col9.isNe(null)).getSQL()
			expect(actual).toEqual(`SELECT "col9" FROM "table1" WHERE "col9" IS NOT NULL;`)
		})
		it(`Produces [SELECT "col9" FROM "table1" WHERE "col9" IS NOT $1;]`, () => {
			const actual = sql.select(col9).from(table1).where(col9.isNe$(null))
			const expected = {
				sql: `SELECT "col9" FROM "table1" WHERE "col9" IS NOT $1;`,
				values: [null],
			}
			expect(actual.getSQL()).toEqual(expected.sql)
			expect(actual.getBindValues()).toEqual(expected.values)
		})
	})

	describe(`NotEqual operator`, () => {
		it(`Produces [SELECT * FROM "table1" WHERE "col9" <> "col10";]`, () => {
			const actual = sql.selectAsteriskFrom(table1).where(col9.ne(col10)).getSQL()
			expect(actual).toEqual(`SELECT * FROM "table1" WHERE "col9" <> "col10";`)
		})
		it(`Produces [SELECT "col9" FROM "table1" WHERE "col9" <> '2022-06-20T00:00:00.000Z';]`, () => {
			const actual = sql.select(col9).from(table1).where(col9.ne(new Date(EPOCH_2022_06_20))).getSQL()
			expect(actual).toEqual(`SELECT "col9" FROM "table1" WHERE "col9" <> '2022-06-20T00:00:00.000Z';`)
		})
		it(`Produces [SELECT "col9" FROM "table1" WHERE "col9" <> $1;]`, () => {
			const actual = sql.select(col9).from(table1).where(col9.ne$(new Date(EPOCH_2022_06_20)))

			const expected = {
				sql: `SELECT "col9" FROM "table1" WHERE "col9" <> $1;`,
				values: [new Date(EPOCH_2022_06_20)],
			}
			expect(actual.getSQL()).toEqual(expected.sql)
			expect(actual.getBindValues()).toEqual(expected.values)
		})
	})

	describe(`GreaterThan operator`, () => {
		it(`Produces [SELECT * FROM "table1" WHERE "col9" > "col10";]`, () => {
			const actual = sql.selectAsteriskFrom(table1).where(col9.gt(col10)).getSQL()
			expect(actual).toEqual(`SELECT * FROM "table1" WHERE "col9" > "col10";`)
		})
		it(`Produces [SELECT "col9" FROM "table1" WHERE "col9" > '2022-06-20T00:00:00.000Z';]`, () => {
			const actual = sql.select(col9).from(table1).where(col9.gt(new Date(EPOCH_2022_06_20))).getSQL()
			expect(actual).toEqual(`SELECT "col9" FROM "table1" WHERE "col9" > '2022-06-20T00:00:00.000Z';`)
		})
		it(`Produces [SELECT "col9" FROM "table1" WHERE "col9" > $1;]`, () => {
			const actual = sql.select(col9).from(table1).where(col9.gt$(new Date(EPOCH_2022_06_20)))
			const expected = {
				sql: `SELECT "col9" FROM "table1" WHERE "col9" > $1;`,
				values: [new Date(EPOCH_2022_06_20)],
			}
			expect(actual.getSQL()).toEqual(expected.sql)
			expect(actual.getBindValues()).toEqual(expected.values)
		})
	})

	describe(`GreaterOrEqual operator`, () => {
		it(`Produces [SELECT * FROM "table1" WHERE "col9" >= "col10";]`, () => {
			const actual = sql.selectAsteriskFrom(table1).where(col9.ge(col10)).getSQL()
			expect(actual).toEqual(`SELECT * FROM "table1" WHERE "col9" >= "col10";`)
		})
		it(`Produces [SELECT "col9" FROM "table1" WHERE "col9" >= '2022-06-20T00:00:00.000Z';]`, () => {
			const actual = sql.select(col9).from(table1).where(col9.ge(new Date(EPOCH_2022_06_20))).getSQL()
			expect(actual).toEqual(`SELECT "col9" FROM "table1" WHERE "col9" >= '2022-06-20T00:00:00.000Z';`)
		})
		it(`Produces [SELECT "col9" FROM "table1" WHERE "col9" >= $1;]`, () => {
			const actual = sql.select(col9).from(table1).where(col9.ge$(new Date(EPOCH_2022_06_20)))

			const expected = {
				sql: `SELECT "col9" FROM "table1" WHERE "col9" >= $1;`,
				values: [new Date(EPOCH_2022_06_20)],
			}
			expect(actual.getSQL()).toEqual(expected.sql)
			expect(actual.getBindValues()).toEqual(expected.values)
		})
	})

	describe(`LesserThan operator`, () => {
		it(`Produces [SELECT * FROM "table1" WHERE "col9" < "col10";]`, () => {
			const actual = sql.selectAsteriskFrom(table1).where(col9.lt(col10)).getSQL()
			expect(actual).toEqual(`SELECT * FROM "table1" WHERE "col9" < "col10";`)
		})
		it(`Produces [SELECT "col9" FROM "table1" WHERE "col9" < '2022-06-20T00:00:00.000Z';]`, () => {
			const actual = sql.select(col9).from(table1).where(col9.lt(new Date(EPOCH_2022_06_20))).getSQL()
			expect(actual).toEqual(`SELECT "col9" FROM "table1" WHERE "col9" < '2022-06-20T00:00:00.000Z';`)
		})
		it(`Produces [SELECT "col9" FROM "table1" WHERE "col9" < $1;]`, () => {
			const actual = sql.select(col9).from(table1).where(col9.lt$(new Date(EPOCH_2022_06_20)))
			const expected = {
				sql: `SELECT "col9" FROM "table1" WHERE "col9" < $1;`,
				values: [new Date(EPOCH_2022_06_20)],
			}
			expect(actual.getSQL()).toEqual(expected.sql)
			expect(actual.getBindValues()).toEqual(expected.values)
		})
	})

	describe(`Lesser Or Equal operator`, () => {
		it(`Produces [SELECT * FROM "table1" WHERE "col9" <= "col10";]`, () => {
			const actual = sql.selectAsteriskFrom(table1).where(col9.le(col10)).getSQL()
			expect(actual).toEqual(`SELECT * FROM "table1" WHERE "col9" <= "col10";`)
		})
		it(`Produces [SELECT "col9" FROM "table1" WHERE "col9" <= '2022-06-20T00:00:00.000Z';]`, () => {
			const actual = sql.select(col9).from(table1).where(col9.le(new Date(EPOCH_2022_06_20))).getSQL()
			expect(actual).toEqual(`SELECT "col9" FROM "table1" WHERE "col9" <= '2022-06-20T00:00:00.000Z';`)
		})
		it(`Produces [SELECT "col9" FROM "table1" WHERE "col9" <= $1;]`, () => {
			const actual = sql.select(col9).from(table1).where(col9.le$(new Date(EPOCH_2022_06_20)))
			const expected = {
				sql: `SELECT "col9" FROM "table1" WHERE "col9" <= $1;`,
				values: [new Date(EPOCH_2022_06_20)],
			}
			expect(actual.getSQL()).toEqual(expected.sql)
			expect(actual.getBindValues()).toEqual(expected.values)
		})
	})
})
