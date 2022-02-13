import {
  Builder,
  BooleanColumn,
  ColumnNotFoundError,
  Database,
  e,
  NumberColumn,
  Table,
  TableNotFoundError,
  TextColumn,
  InvalidExpressionError,
  ArithmeticOperator,
  ComparisonOperator,
  DISTINCT,
} from '../src'
import { OrderByDirection, OrderByNullsPosition } from '../src/orderBy'

//Alias
const ADD = ArithmeticOperator.ADD
const GT = ComparisonOperator.GreaterThan

describe('Throw desired Errors', () => {
  // database schema
  const column1 = new TextColumn('col1')
  const column2 = new TextColumn('col2')
  const column3 = new TextColumn('col3')
  const column4 = new NumberColumn('col4')
  const column5 = new NumberColumn('col5')
  const column6 = new NumberColumn('col6')
  const column7 = new BooleanColumn('col7')
  const column8 = new BooleanColumn('col8')
  const table = new Table(
    'testTable',
    [column1, column2, column3, column4, column5, column6, column7, column8],
  )
  const db = new Database([table], 1)
  const sql = new Builder(db)

  it('Throws error when add invalid operator', () => {
    function actual() {
      sql.select(e(1, GT, 'f'))
    }

    expect(actual).toThrowError('You can not have "NUMBER" and "TEXT" with operator ">"')
    expect(actual).toThrowError(InvalidExpressionError)
  })

  it('Throws error when column not exist', () => {
    const wrongColumn = new TextColumn('wrongColumn')

    function actual() {
      sql.select(column1, wrongColumn, column3)
    }

    expect(actual).toThrowError('Column: "wrongColumn" not found')
    expect(actual).toThrowError(ColumnNotFoundError)
  })

  it('Throws error when table not exist', () => {
    const wrongTable = new Table('wrongTable', [new TextColumn('anyColumn')])

    function actual() {
      sql.select(column1).from(wrongTable)
    }

    expect(actual).toThrowError('Table: "wrongTable" not found')
    expect(actual).toThrowError(TableNotFoundError)
  })

  it('Throws error if number added to text', () => {
    function actual() {
      sql.select(e(1, ADD, 'a')).getSQL()
    }

    expect(actual).toThrowError('You can not have "NUMBER" and "TEXT" with operator "+"')
    expect(actual).toThrowError(InvalidExpressionError)
  })

  it('Throws error when no param to select passed after DISTINCT', () => {
    function actual() {
      sql.select(DISTINCT).from(table)
    }

    expect(actual).toThrow(/^Select step must have at least one parameter after DISTINCT$/)
  })

  it('Throws error when DESC comes before alias or column', () => {
    function actual() {
      sql
        .selectAsteriskFrom(table)
        .orderBy(OrderByDirection.DESC, 'column1')

    }

    expect(actual).toThrow(/^ DESC shouldn't come before column or alias name$/)
  })

  it('Throws error when NULLS FIRST comes before alias or column', () => {
    function actual() {
      sql
        .selectAsteriskFrom(table)
        .orderBy(OrderByNullsPosition.NULLS_FIRST, column1)

    }

    expect(actual).toThrow(/^ NULLS FIRST shouldn't come before column or alias name$/)
  })
})
