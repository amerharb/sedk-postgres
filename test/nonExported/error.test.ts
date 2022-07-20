import {
  InvalidConditionError,
  Builder,
} from '../../src'

// test non-exported Classes
import { Condition } from '../../src/models/Condition'
import { Expression } from '../../src/models/Expression'
import { OnStep } from '../../src/steps/OnStep'

import { database } from '../database'
import { BinderStore } from '../../src/binder'

//Alias
const table1 = database.s.public.t.table1

describe('Throw desired Errors', () => {
  const sql = new Builder(database)
  afterEach(() => { sql.cleanUp() })

  describe('Error: InvalidConditionError', () => {
    it(`Throws error when condition created with only "NUMBER"`, () => {
      function actual() {
        sql
          .selectAsteriskFrom(table1)
          .where(new Condition(new Expression(1)))
          .getSQL()
      }

      expect(actual).toThrow(InvalidConditionError)
      expect(actual).toThrow(`Condition can not created with only "NUMBER"`)
    })
  })

  describe('Error: "Step property in builder data is not initialized"', () => {
    it(`Throws error when Step is not initialized`, () => {
      function actual() {
        new OnStep({
          binderStore: new BinderStore(),
          database,
          distinct: '',
          fromItemInfos: [],
          groupByItems: [],
          havingParts: [],
          option: {
            useSemicolonAtTheEnd: true,
            addAscAfterOrderByItem: 'when mentioned',
            addNullsLastAfterOrderByItem: 'when mentioned',
            addAsBeforeColumnAlias: 'always',
            addPublicSchemaName: 'never',
            addTableName: 'when two tables or more',
            addAsBeforeTableAlias: 'always',
            throwErrorIfDeleteHasNoCondition: true,
          },
          orderByItemInfos: [],
          selectItemInfos: [],
          whereParts: [],
          intoTable: undefined,
          intoColumns: [],
          returning: [],
        }).crossJoin(table1)
      }

      expect(actual).toThrow(`Step property in builder data is not initialized`)
    })
  })
})
