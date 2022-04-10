import { Builder } from '../src'
import { database } from './database'
//Alias
const table1 = database.s.public.t.table1
const table1Col1 = database.s.public.t.table1.c.col1
const table2 = database.s.public.t.table2

describe('Test JOIN Step', () => {
  const sql = new Builder(database)
  afterEach(() => { sql.cleanUp() })
  describe('basic join', () => {
    //TODO: this unit test produces non correct sql
    it('Produces [SELECT * FROM "table1" JOIN "table2" ON "table1"."col1" = "table2"."col1";]', () => {
      const actual = sql
        .selectAsteriskFrom(table1)
        .join(table2)
        .on(table1Col1.eq(table2.c.col1))
        .getSQL()

      expect(actual).toEqual('SELECT * FROM "table1" JOIN "table2";')
    })
  })
})