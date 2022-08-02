import { Builder, e, DeleteWithoutConditionError } from '../../src'
import { database } from '../database'

//Alias
const publicTable1 = database.s.public.t.table1
const col1 = database.s.public.t.table1.c.col1
const col2 = database.s.public.t.table1.c.col2
const table2 = database.s.public.t.table2
const table2col1 = database.s.public.t.table2.c.col1
const table1 = database.s.schema1.t.table1

describe('test Options', () => {
	describe('test useSemicolonAtTheEnd Option', () => {
		const sqlWithoutSemicolon = new Builder(database, { useSemicolonAtTheEnd: false })
		const sqlWithSemicolon = new Builder(database, { useSemicolonAtTheEnd: true })
		const sqlDefault = new Builder(database)
		it('Produces [SELECT 1 FROM "table1"] without semicolon', () => {
			const actual = sqlWithoutSemicolon
				.select(1)
				.from(publicTable1)
				.getSQL()

			expect(actual).toEqual('SELECT 1 FROM "table1"')
		})

		it('Produces [SELECT 1 FROM "table1"] without semicolon;', () => {
			const actual = sqlWithSemicolon
				.select(1)
				.from(publicTable1)
				.getSQL()

			expect(actual).toEqual('SELECT 1 FROM "table1";')
		})

		it('Produces [SELECT 1 FROM "table1"] without semicolon; (default)', () => {
			const actual = sqlDefault
				.select(1)
				.from(publicTable1)
				.getSQL()

			expect(actual).toEqual('SELECT 1 FROM "table1";')
		})
	})

	describe('test addAscAfterOrderByItem Option', () => {
		const sqlAlways = new Builder(database, { addAscAfterOrderByItem: 'always' })
		const sqlNever = new Builder(database, { addAscAfterOrderByItem: 'never' })
		const sqlWhenMentioned = new Builder(database, { addAscAfterOrderByItem: 'when mentioned' })
		const sqlDefault = new Builder(database)
		afterEach(() => {
			sqlAlways.cleanUp()
			sqlNever.cleanUp()
			sqlWhenMentioned.cleanUp()
			sqlDefault.cleanUp()
		})

		it('Produces [SELECT "col1" FROM "table1" ORDER BY "col1" ASC;] option(always)', () => {
			const actual = sqlAlways
				.select(col1)
				.from(publicTable1)
				.orderBy(col1)
				.getSQL()

			expect(actual).toEqual('SELECT "col1" FROM "table1" ORDER BY "col1" ASC;')
		})

		it('Produces [SELECT "col1" FROM "table1" ORDER BY "col1";] option(never)', () => {
			const actual = sqlNever
				.select(col1)
				.from(publicTable1)
				.orderBy(col1)
				.getSQL()

			expect(actual).toEqual('SELECT "col1" FROM "table1" ORDER BY "col1";')
		})

		it('Produces [SELECT "col1" FROM "table1" ORDER BY "col1", "col2" DESC;] option(never)', () => {
			const actual = sqlNever
				.select(col1)
				.from(publicTable1)
				.orderBy(col1, col2.desc)
				.getSQL()

			expect(actual).toEqual('SELECT "col1" FROM "table1" ORDER BY "col1", "col2" DESC;')
		})

		it('Produces [SELECT "col1" FROM "table1" ORDER BY "col1";] option(never) even asc mentioned', () => {
			const actual = sqlNever
				.select(col1)
				.from(publicTable1)
				.orderBy(col1.asc)
				.getSQL()

			expect(actual).toEqual('SELECT "col1" FROM "table1" ORDER BY "col1";')
		})

		it('Produces [SELECT "col1" FROM "table1" ORDER BY "col1" ASC;] option(when mentioned)', () => {
			const actual = sqlWhenMentioned
				.select(col1)
				.from(publicTable1)
				.orderBy(col1.asc)
				.getSQL()

			expect(actual).toEqual('SELECT "col1" FROM "table1" ORDER BY "col1" ASC;')
		})

		it('Produces [SELECT "col1" FROM "table1" ORDER BY "col1";] option(when mentioned)', () => {
			const actual = sqlWhenMentioned
				.select(col1)
				.from(publicTable1)
				.orderBy(col1)
				.getSQL()

			expect(actual).toEqual('SELECT "col1" FROM "table1" ORDER BY "col1";')
		})

		it('Produces [SELECT "col1" FROM "table1" ORDER BY "col1";] option(Default)', () => {
			const actual = sqlDefault
				.select(col1)
				.from(publicTable1)
				.orderBy(col1)
				.getSQL()

			expect(actual).toEqual('SELECT "col1" FROM "table1" ORDER BY "col1";')
		})

		it('Produces [SELECT "col1" FROM "table1" ORDER BY "col1" ASC;] option(Default)', () => {
			const actual = sqlDefault
				.select(col1)
				.from(publicTable1)
				.orderBy(col1.asc)
				.getSQL()

			expect(actual).toEqual('SELECT "col1" FROM "table1" ORDER BY "col1" ASC;')
		})
	})

	describe('test addNullsLastAfterOrderByItem Option', () => {
		const sqlAlways = new Builder(database, { addNullsLastAfterOrderByItem: 'always' })
		const sqlNever = new Builder(database, { addNullsLastAfterOrderByItem: 'never' })
		const sqlWhenMentioned = new Builder(database, { addNullsLastAfterOrderByItem: 'when mentioned' })
		const sqlDefault = new Builder(database)
		afterEach(() => {
			sqlAlways.cleanUp()
			sqlNever.cleanUp()
			sqlWhenMentioned.cleanUp()
			sqlDefault.cleanUp()
		})

		it('Produces [SELECT "col1" FROM "table1" ORDER BY "col1" NULLS LAST;] option(always)', () => {
			const actual = sqlAlways
				.select(col1)
				.from(publicTable1)
				.orderBy(col1)
				.getSQL()

			expect(actual).toEqual('SELECT "col1" FROM "table1" ORDER BY "col1" NULLS LAST;')
		})

		it('Produces [SELECT "col1" FROM "table1" ORDER BY "col1";] option(never)', () => {
			const actual = sqlNever
				.select(col1)
				.from(publicTable1)
				.orderBy(col1)
				.getSQL()

			expect(actual).toEqual('SELECT "col1" FROM "table1" ORDER BY "col1";')
		})

		it('Produces [SELECT "col1" FROM "table1" ORDER BY "col1" NULLS FIRST ;] option(never)', () => {
			const actual = sqlNever
				.select(col1)
				.from(publicTable1)
				.orderBy(col1.nullsFirst)
				.getSQL()

			expect(actual).toEqual('SELECT "col1" FROM "table1" ORDER BY "col1" NULLS FIRST;')
		})

		it('Produces [SELECT "col1" FROM "table1" ORDER BY "col1";] option(never) even nulls last mentioned', () => {
			const actual = sqlNever
				.select(col1)
				.from(publicTable1)
				.orderBy(col1.nullsLast)
				.getSQL()

			expect(actual).toEqual('SELECT "col1" FROM "table1" ORDER BY "col1";')
		})

		it('Produces [SELECT "col1" FROM "table1" ORDER BY "col1" ASC;] option(when mentioned)', () => {
			const actual = sqlWhenMentioned
				.select(col1)
				.from(publicTable1)
				.orderBy(col1.asc)
				.getSQL()

			expect(actual).toEqual('SELECT "col1" FROM "table1" ORDER BY "col1" ASC;')
		})

		it('Produces [SELECT "col1" FROM "table1" ORDER BY "col1";] option(when mentioned)', () => {
			const actual = sqlWhenMentioned
				.select(col1)
				.from(publicTable1)
				.orderBy(col1)
				.getSQL()

			expect(actual).toEqual('SELECT "col1" FROM "table1" ORDER BY "col1";')
		})

		it('Produces [SELECT "col1" FROM "table1" ORDER BY "col1";] option(Default)', () => {
			const actual = sqlDefault
				.select(col1)
				.from(publicTable1)
				.orderBy(col1)
				.getSQL()

			expect(actual).toEqual('SELECT "col1" FROM "table1" ORDER BY "col1";')
		})

		it('Produces [SELECT "col1" FROM "table1" ORDER BY "col1" NULLS LAST;] option(Default)', () => {
			const actual = sqlDefault
				.select(col1)
				.from(publicTable1)
				.orderBy(col1.nullsLast)
				.getSQL()

			expect(actual).toEqual('SELECT "col1" FROM "table1" ORDER BY "col1" NULLS LAST;')
		})
	})

	describe('test addAsBeforeColumnAlias Option', () => {
		const sqlAlways = new Builder(database, { addAsBeforeColumnAlias: 'always' })
		const sqlNever = new Builder(database, { addAsBeforeColumnAlias: 'never' })
		const sqlDefault = new Builder(database)

		afterEach(() => {
			sqlAlways.cleanUp()
			sqlNever.cleanUp()
			sqlDefault.cleanUp()
		})

		it('Produces [SELECT "col1" AS "C1" FROM "table1";] option(always)', () => {
			const actual = sqlAlways
				.select(col1.as('C1'))
				.from(publicTable1)
				.getSQL()

			expect(actual).toEqual('SELECT "col1" AS "C1" FROM "table1";')
		})

		it('Produces [SELECT "col1" FROM "table1";] option(never)', () => {
			const actual = sqlNever
				.select(col1.as('C1'))
				.from(publicTable1)
				.getSQL()

			expect(actual).toEqual('SELECT "col1" "C1" FROM "table1";')
		})

		it('Produces [SELECT "col1" AS "C1" FROM "table1";] option(default)', () => {
			const actual = sqlDefault
				.select(col1.as('C1'))
				.from(publicTable1)
				.getSQL()

			expect(actual).toEqual('SELECT "col1" AS "C1" FROM "table1";')
		})
	})

	describe('test addPublicSchemaName Option', () => {
		describe('Option: always', () => {
			const sql = new Builder(database, { addPublicSchemaName: 'always' })
			afterEach(() => { sql.cleanUp() })

			it('Produces [SELECT "col1" FROM "public"."table1";]', () => {
				const actual = sql
					.select(col1)
					.from(publicTable1)
					.getSQL()

				expect(actual).toEqual('SELECT "col1" FROM "public"."table1";')
			})
		})

		describe('Option: when other schema mentioned', () => {
			const sql = new Builder(database, { addPublicSchemaName: 'when other schema mentioned' })
			afterEach(() => { sql.cleanUp() })

			it('Produces [SELECT "public"."table1"."col2", "schema1"."table1"."col1" FROM "public"."table1", "schema1"."table1";', () => {
				const actual = sql
					.select(publicTable1.c.col2, table1.c.col1)
					.from(publicTable1, table1)
					.getSQL()

				expect(actual).toEqual('SELECT "public"."table1"."col2", "schema1"."table1"."col1" FROM "public"."table1", "schema1"."table1";')
			})
		})

		describe('Option: never', () => {
			const sql = new Builder(database, { addPublicSchemaName: 'never' })
			afterEach(() => { sql.cleanUp() })

			it('Produces [SELECT "public"."table2"."col1", "schema1"."table2"."col1" FROM "table2", "schema1"."table2";]', () => {
				const actual = sql
					.select(
						database.s.public.t.table2.c.col1,
						database.s.schema1.t.table2.c.col1,
					)
					.from(
						database.s.public.t.table2,
						database.s.schema1.t.table2,
					)
					.getSQL()

				expect(actual).toEqual('SELECT "public"."table2"."col1", "schema1"."table2"."col1" FROM "table2", "schema1"."table2";')
			})

			it('Produces [SELECT "col1" FROM "schema1"."table1";]', () => {
				const actual = sql
					.select(table1.c.col1)
					.from(table1)
					.getSQL()

				expect(actual).toEqual('SELECT "col1" FROM "schema1"."table1";')
			})
		})
		describe('Option: default', () => {
			const sql = new Builder(database)
			afterEach(() => { sql.cleanUp() })

			it('Produces [SELECT "public"."table2"."col1", "schema1"."table2"."col1" FROM "table2", "schema1"."table2";]', () => {
				const actual = sql
					.select(
						database.s.public.t.table2.c.col1,
						database.s.schema1.t.table2.c.col1,
					)
					.from(
						database.s.public.t.table2,
						database.s.schema1.t.table2,
					)
					.getSQL()

				expect(actual).toEqual('SELECT "public"."table2"."col1", "schema1"."table2"."col1" FROM "table2", "schema1"."table2";')
			})

			it('Produces [SELECT "col1" FROM "schema1"."table1";]', () => {
				const actual = sql
					.select(table1.c.col1)
					.from(table1)
					.getSQL()

				expect(actual).toEqual('SELECT "col1" FROM "schema1"."table1";')
			})
		})
	})

	describe('test addTableName Option', () => {
		const sqlAlways = new Builder(database, { addTableName: 'always' })
		const sqlWhen = new Builder(database, { addTableName: 'when two tables or more' })
		const sqlDefault = new Builder(database)

		afterEach(() => {
			sqlAlways.cleanUp()
			sqlWhen.cleanUp()
			sqlDefault.cleanUp()
		})

		it('Produces [SELECT "table1"."col1" FROM "table1";] option(always)', () => {
			const actual = sqlAlways
				.select(col1)
				.from(publicTable1)
				.getSQL()

			expect(actual).toEqual('SELECT "table1"."col1" FROM "table1";')
		})

		it('Produces [SELECT "col1" FROM "table1";] option(when)', () => {
			const actual = sqlWhen
				.select(col1)
				.from(publicTable1)
				.getSQL()

			expect(actual).toEqual('SELECT "col1" FROM "table1";')
		})

		it('Produces [SELECT "table1"."col1", "table2"."col1" FROM "table1", "table2";] option(when)', () => {
			const actual = sqlWhen
				.select(col1, table2col1)
				.from(publicTable1, table2)
				.getSQL()

			expect(actual).toEqual('SELECT "table1"."col1", "table2"."col1" FROM "table1", "table2";')
		})

		it('Produces [SELECT "col1" FROM "table1";] option(default)', () => {
			const actual = sqlDefault
				.select(col1)
				.from(publicTable1)
				.getSQL()

			expect(actual).toEqual('SELECT "col1" FROM "table1";')
		})

		it('Produces [SELECT "table1"."col1", "table2"."col1" FROM "table1", "table2";] option(default)', () => {
			const actual = sqlDefault
				.select(col1, table2col1)
				.from(publicTable1, table2)
				.getSQL()

			expect(actual).toEqual('SELECT "table1"."col1", "table2"."col1" FROM "table1", "table2";')
		})
	})

	describe('test addAsBeforeTableAlias Option', () => {
		describe('Option: always', () => {
			const sqlAlways = new Builder(database, { addAsBeforeTableAlias: 'always' })
			afterEach(() => { sqlAlways.cleanUp() })
			it('Produces [SELECT "table1"."col1" FROM "table1" AS "TEST Table";]', () => {
				const actual = sqlAlways
					.select(col1)
					.from(publicTable1.as('TEST Table'))
					.getSQL()

				expect(actual).toEqual('SELECT "col1" FROM "table1" AS "TEST Table";')
			})
		})

		describe('Option: never', () => {
			const sqlNever = new Builder(database, { addAsBeforeTableAlias: 'never' })
			afterEach(() => { sqlNever.cleanUp() })
			it('Produces [SELECT "table1"."col1" FROM "table1" "TEST Table";]', () => {
				const actual = sqlNever
					.select(col1)
					.from(publicTable1.as('TEST Table'))
					.getSQL()

				expect(actual).toEqual('SELECT "col1" FROM "table1" "TEST Table";')
			})
		})

		describe('Option: default', () => {
			const sqlDefault = new Builder(database)
			afterEach(() => { sqlDefault.cleanUp() })
			it('Produces [SELECT "table1"."col1" FROM "table1" AS "TEST Table";]', () => {
				const actual = sqlDefault
					.select(col1)
					.from(publicTable1.as('TEST Table'))
					.getSQL()

				expect(actual).toEqual('SELECT "col1" FROM "table1" AS "TEST Table";')
			})
		})
	})

	describe('test throwErrorIfDeleteHasNoCondition Option', () => {
		describe('Option: false', () => {
			const sqlFalse = new Builder(database, { throwErrorIfDeleteHasNoCondition: false })
			afterEach(() => { sqlFalse.cleanUp() })
			it('Produces [DELETE FROM "table1";]', () => {
				const actual = sqlFalse.deleteFrom(publicTable1).getSQL()

				expect(actual).toEqual('DELETE FROM "table1";')
			})
			it('Produces [DELETE FROM "table1" WHERE 1 = 1;]', () => {
				const actual = sqlFalse
					.deleteFrom(publicTable1).where(e(1).eq(1))
					.getSQL()

				expect(actual).toEqual('DELETE FROM "table1" WHERE 1 = 1;')
			})
		})

		describe('Option: true', () => {
			const sqlTrue = new Builder(database, { throwErrorIfDeleteHasNoCondition: true })
			afterEach(() => { sqlTrue.cleanUp() })
			it('Produces [DELETE FROM "table1";] Will throw error', () => {
				function actual() {
					sqlTrue.deleteFrom(publicTable1).getSQL()
				}

				expect(actual).toThrowError(`Delete statement must have where conditions or set throwErrorIfDeleteHasNoCondition option to false`)
				expect(actual).toThrowError(DeleteWithoutConditionError)
			})
			it('Produces [DELETE FROM "table1" WHERE 1 = 1;] Will not throw error', () => {
				function actual() {
					sqlTrue.deleteFrom(publicTable1).where(e(1).eq(1)).getSQL()
					/** cleanUp() is needed as we run the function more than once */
					sqlTrue.cleanUp()
				}

				expect(actual).not.toThrowError(DeleteWithoutConditionError)
				expect(actual).not.toThrowError() // not to throw any other error
			})
		})

		describe('Option: default', () => {
			const sqlDefault = new Builder(database)
			afterEach(() => { sqlDefault.cleanUp() })
			it('Produces [DELETE FROM "table1";] Will throw error', () => {
				function actual() {
					sqlDefault.deleteFrom(publicTable1).getSQL()
				}

				expect(actual).toThrowError(`Delete statement must have where conditions or set throwErrorIfDeleteHasNoCondition option to false`)
				expect(actual).toThrowError(DeleteWithoutConditionError)
			})
			it('Produces [DELETE FROM "table1" WHERE 1 = 1;] Will not throw error', () => {
				function actual() {
					sqlDefault.deleteFrom(publicTable1).where(e(1).eq(1)).getSQL()
					/** cleanUp() is needed as we run the function more than once */
					sqlDefault.cleanUp()
				}

				expect(actual).not.toThrowError(DeleteWithoutConditionError)
				expect(actual).not.toThrowError() // not to throw any other error
			})
		})
	})
})
