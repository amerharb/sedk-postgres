import { Builder } from '../../src'
import { database } from '../database'

//Alias
const table1 = database.s.public.t.table1
const col4 = table1.c.col4
const col5 = table1.c.col5

describe('Condition', () => {
	const sql = new Builder(database)
	afterEach(() => { sql.cleanUp() })
	describe('Condition from Condition eq/isEq', () => {
		it('Produces [SELECT * FROM "table1" WHERE (("col4" & 1) = 0) = TRUE;]', () => {
			const actual = sql
				.selectAsteriskFrom(table1)
				.where(col4.bitwiseAnd(1).eq(0).eq(true))
				.getSQL()
			expect(actual).toEqual('SELECT * FROM "table1" WHERE (("col4" & 1) = 0) = TRUE;')
		})
		it('Produces [SELECT * FROM "table1" WHERE (("col5" & 1) = 0) = TRUE;]', () => {
			const actual = sql
				.selectAsteriskFrom(table1)
				.where(col5.bitwiseAnd(1).eq(0).isEq(true))
				.getSQL()
			expect(actual).toEqual('SELECT * FROM "table1" WHERE (("col5" & 1) = 0) = TRUE;')
		})
		it('Produces [SELECT * FROM "table1" WHERE (("col4" & 1) = 0) IS NULL;]', () => {
			const actual = sql
				.selectAsteriskFrom(table1)
				.where(col4.bitwiseAnd(1).eq(0).isEq(null))
				.getSQL()
			expect(actual).toEqual('SELECT * FROM "table1" WHERE (("col4" & 1) = 0) IS NULL;')
		})
	})
	describe('Condition from Condition ne/isNe', () => {
		it('Produces [SELECT * FROM "table1" WHERE (("col4" & 1) = 0) <> TRUE;]', () => {
			const actual = sql
				.selectAsteriskFrom(table1)
				.where(col4.bitwiseAnd(1).eq(0).ne(true))
				.getSQL()
			expect(actual).toEqual('SELECT * FROM "table1" WHERE (("col4" & 1) = 0) <> TRUE;')
		})
		it('Produces [SELECT * FROM "table1" WHERE (("col5" & 1) = 0) <> TRUE;]', () => {
			const actual = sql
				.selectAsteriskFrom(table1)
				.where(col5.bitwiseAnd(1).eq(0).isNe(true))
				.getSQL()
			expect(actual).toEqual('SELECT * FROM "table1" WHERE (("col5" & 1) = 0) <> TRUE;')
		})
		it('Produces [SELECT * FROM "table1" WHERE (("col4" & 1) = 0) IS NOT NULL;]', () => {
			const actual = sql
				.selectAsteriskFrom(table1)
				.where(col4.bitwiseAnd(1).eq(0).isNe(null))
				.getSQL()
			expect(actual).toEqual('SELECT * FROM "table1" WHERE (("col4" & 1) = 0) IS NOT NULL;')
		})
	})
	describe('Condition from Condition eq$/isEq$', () => {
		it('Produces [SELECT * FROM "table1" WHERE (("col4" & 1) = 0) = $1;]', () => {
			const actual = sql
				.selectAsteriskFrom(table1)
				.where(col4.bitwiseAnd(1).eq(0).eq$(true))

			expect(actual.getSQL()).toEqual('SELECT * FROM "table1" WHERE (("col4" & 1) = 0) = $1;')
			expect(actual.getBindValues()).toEqual([true])
		})
		it('Produces [SELECT * FROM "table1" WHERE (("col5" & 1) = 0) = $1;]', () => {
			const actual = sql
				.selectAsteriskFrom(table1)
				.where(col5.bitwiseAnd(1).eq(0).isEq$(true))

			expect(actual.getSQL()).toEqual('SELECT * FROM "table1" WHERE (("col5" & 1) = 0) = $1;')
			expect(actual.getBindValues()).toEqual([true])
		})
		it('Produces [SELECT * FROM "table1" WHERE (("col4" & 1) = 0) IS $1;]', () => {
			const actual = sql
				.selectAsteriskFrom(table1)
				.where(col4.bitwiseAnd(1).eq(0).isEq$(null))

			expect(actual.getSQL()).toEqual('SELECT * FROM "table1" WHERE (("col4" & 1) = 0) IS $1;')
			expect(actual.getBindValues()).toEqual([null])
		})
	})
	describe('Condition from Condition ne$/isNe$', () => {
		it('Produces [SELECT * FROM "table1" WHERE (("col4" & 1) = 0) <> $1;]', () => {
			const actual = sql
				.selectAsteriskFrom(table1)
				.where(col4.bitwiseAnd(1).eq(0).ne$(true))

			expect(actual.getSQL()).toEqual('SELECT * FROM "table1" WHERE (("col4" & 1) = 0) <> $1;')
			expect(actual.getBindValues()).toEqual([true])
		})
		it('Produces [SELECT * FROM "table1" WHERE (("col5" & 1) = 0) <> $1;]', () => {
			const actual = sql
				.selectAsteriskFrom(table1)
				.where(col5.bitwiseAnd(1).eq(0).isNe$(true))

			expect(actual.getSQL()).toEqual('SELECT * FROM "table1" WHERE (("col5" & 1) = 0) <> $1;')
			expect(actual.getBindValues()).toEqual([true])
		})
		it('Produces [SELECT * FROM "table1" WHERE (("col4" & 1) = 0) IS NOT $1;]', () => {
			const actual = sql
				.selectAsteriskFrom(table1)
				.where(col4.bitwiseAnd(1).eq(0).isNe$(null))

			expect(actual.getSQL()).toEqual('SELECT * FROM "table1" WHERE (("col4" & 1) = 0) IS NOT $1;')
			expect(actual.getBindValues()).toEqual([null])
		})
	})
})