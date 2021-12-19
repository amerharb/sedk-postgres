'use strict'
import * as sql from './sqlWriter'

describe('test from one table', () => {
  // database schema
  const column1 = new sql.Column('col1',)
  const column2 = new sql.Column('col2',)
  const column3 = new sql.Column('col3',)
  const table = new sql.Table('testTable', [column1, column2, column3])
  const asql = new sql.ASql([table])

  it('has correct select 1 column from one table', () => {
    const received = asql
      .select(column1)
      .from(table)
      .getSQL()
      .replace(/\n/g, ' ')
      .replace(/ +/g, ' ')

    expect(received).toContain('SELECT col1 FROM testTable')
  })

  it('has correct select 2 columns from one table', () => {
    const received = asql
      .select(column1, column2)
      .from(table)
      .getSQL()
      .replace(/\n/g, ' ')
      .replace(/ +/g, ' ')

    expect(received).toContain('SELECT col1, col2 FROM testTable')
  })

  it('has correct select 2 columns from one table with where has 1 condition', () => {
    const received = asql
      .select(column1, column2)
      .from(table)
      .where(column1.isEqual('x'))
      .getSQL()
      .replace(/\n/g, ' ')
      .replace(/ +/g, ' ')
    expect(received).toEqual('SELECT col1, col2 FROM testTable WHERE col1 = x')
  })

  it('has correct select 2 columns from one table with where has 2 conditions with AND inside parentheses', () => {
    const received = asql
      .select(column1, column2)
      .from(table)
      .where(column1.isEqual('x'), sql.Operator.AND, column2.isEqual('y'))
      .getSQL()
      .replace(/\n/g, ' ')
      .replace(/ +/g, ' ')
    expect(received).toEqual('SELECT col1, col2 FROM testTable WHERE ( col1 = x AND col2 = y )')
  })

  it('has correct select 2 columns from one table with where has 2 conditions with OR inside parentheses', () => {
    const received = asql
      .select(column1, column2)
      .from(table)
      .where(column1.isEqual('x'), sql.Operator.OR, column2.isEqual('y'))
      .getSQL()
      .replace(/\n/g, ' ')
      .replace(/ +/g, ' ')
    expect(received).toEqual('SELECT col1, col2 FROM testTable WHERE ( col1 = x OR col2 = y )')
  })

  it('has correct select 2 columns from one table with where has 1 conditions then AND after it without parentheses', () => {
    const received = asql
      .select(column1, column2)
      .from(table)
      .where(column1.isEqual('x'))
      .and(column2.isEqual('y'))
      .getSQL()
      .replace(/\n/g, ' ')
      .replace(/ +/g, ' ')
    expect(received).toEqual('SELECT col1, col2 FROM testTable WHERE col1 = x AND col2 = y')
  })
})
