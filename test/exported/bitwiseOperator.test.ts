import { Builder } from '../../src'
import { database } from '../database'

//Alias
const table = database.s.public.t.table1
const col4 = database.s.public.t.table1.c.col4

describe('Bitwise Operators', () => {
	const sql = new Builder(database)
	afterEach(() => { sql.cleanUp() })
	describe('bitwise AND', () => {
		it('Produces [SELECT * FROM "table1" WHERE ("col4" & 1) = 0;]', () => {
			const actual = sql
				.selectAsteriskFrom(table)
				.where(col4.bitwiseAnd(1).eq(0))
				.getSQL()

			expect(actual).toEqual('SELECT * FROM "table1" WHERE ("col4" & 1) = 0;')
		})
		it('Produces [SELECT * FROM "table1" WHERE ("col4" & $1) = 0;]', () => {
			const actual = sql
				.selectAsteriskFrom(table)
				.where(col4.bitwiseAnd$(1).eq(0))

			expect(actual.getSQL()).toEqual('SELECT * FROM "table1" WHERE ("col4" & $1) = 0;')
			expect(actual.getBindValues()).toEqual([1])
		})
		it('Produces [SELECT * FROM "table1" WHERE ("col4" & $1) = $2;]', () => {
			const actual = sql
				.selectAsteriskFrom(table)
				.where(col4.bitwiseAnd$(1).eq$(0))

			expect(actual.getSQL()).toEqual('SELECT * FROM "table1" WHERE ("col4" & $1) = $2;')
			expect(actual.getBindValues()).toEqual([1, 0])
		})
		it('Produces [SELECT * FROM "table1" WHERE ("col4" & 1) <> 0;]', () => {
			const actual = sql
				.selectAsteriskFrom(table)
				.where(col4.bitwiseAnd(1).ne(0))
				.getSQL()

			expect(actual).toEqual('SELECT * FROM "table1" WHERE ("col4" & 1) <> 0;')
		})
	})

	describe('bitwise OR', () => {
		it('Produces [SELECT * FROM "table1" WHERE ("col4" | 1) = 0;]', () => {
			const actual = sql
				.selectAsteriskFrom(table)
				.where(col4.bitwiseOr(1).eq(0))
				.getSQL()

			expect(actual).toEqual('SELECT * FROM "table1" WHERE ("col4" | 1) = 0;')
		})
		it('Produces [SELECT * FROM "table1" WHERE ("col4" | $1) = 0;]', () => {
			const actual = sql
				.selectAsteriskFrom(table)
				.where(col4.bitwiseOr$(1).eq(0))

			expect(actual.getSQL()).toEqual('SELECT * FROM "table1" WHERE ("col4" | $1) = 0;')
			expect(actual.getBindValues()).toEqual([1])
		})
	})

	describe('bitwise XOR', () => {
		it('Produces [SELECT * FROM "table1" WHERE ("col4" # 1) = 0;]', () => {
			const actual = sql
				.selectAsteriskFrom(table)
				.where(col4.bitwiseXor(1).eq(0))
				.getSQL()

			expect(actual).toEqual('SELECT * FROM "table1" WHERE ("col4" # 1) = 0;')
		})
		it('Produces [SELECT * FROM "table1" WHERE ("col4" # $1) = $2;]', () => {
			const actual = sql
				.selectAsteriskFrom(table)
				.where(col4.bitwiseXor$(1).eq$(0))

			expect(actual.getSQL()).toEqual('SELECT * FROM "table1" WHERE ("col4" # $1) = $2;')
			expect(actual.getBindValues()).toEqual([1, 0])
		})
		it('Produces [SELECT * FROM "table1" WHERE ("col4" # 1) <> 0;]', () => {
			const actual = sql
				.selectAsteriskFrom(table)
				.where(col4.bitwiseXor(1).ne(0))
				.getSQL()

			expect(actual).toEqual('SELECT * FROM "table1" WHERE ("col4" # 1) <> 0;')
		})
		it('Produces [SELECT * FROM "table1" WHERE ("col4" # $1) <> $2;]', () => {
			const actual = sql
				.selectAsteriskFrom(table)
				.where(col4.bitwiseXor$(1).ne$(0))

			expect(actual.getSQL()).toEqual('SELECT * FROM "table1" WHERE ("col4" # $1) <> $2;')
			expect(actual.getBindValues()).toEqual([1, 0])
		})
	})
})