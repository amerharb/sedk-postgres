import { Builder } from '../../src'

// test non-exported Classes
import { ReturningItemInfo } from '../../src/ReturningItemInfo'
import { isTextBoolean, isTextNumber } from '../../src/models/types'
import { database } from '../database'

//Alias
const table1 = database.s.public.t.table1

describe('Import non-exported Classes', () => {
	const sql = new Builder(database, { throwErrorIfDeleteHasNoCondition: false })
	afterEach(() => { sql.cleanUp() })
	describe('Import: ReturningItemInfo', () => {
		it(`Produces [DELETE FROM "table1" RETURNING "col1" AS "someAlias";]`, () => {
			const rii = new ReturningItemInfo(table1.c.col1, 'someAlias')
			const actual = sql.deleteFrom(table1).returning(rii).getSQL()
			expect(actual).toEqual(`DELETE FROM "table1" RETURNING "col1" AS "someAlias";`)
		})
	})
	describe('Import: { isTextBoolean, isTextNumber }', () => {
		it(`isTextBoolean return false for not string`, () => {
			expect(isTextBoolean(123)).toEqual(false)
		})
		it(`isTextNumber return false for non-string`, () => {
			expect(isTextNumber('abc')).toEqual(false)
		})
		it(`isTextNumber return false for non-string`, () => {
			expect(isTextNumber(123)).toEqual(false)
		})
	})
})
