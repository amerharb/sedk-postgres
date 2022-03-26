import { Condition, Expression, PostgresBinder } from './models'
import { BooleanColumn, Column } from './columns'
import { Table } from './database'
import { ColumnNotFoundError, TableNotFoundError } from './errors'
import { BuilderData } from './builder'
import { All, Asterisk } from './singletoneConstants'
import {
  OrderByItem,
  OrderByItemInfo,
  OrderByDirection,
  OrderByNullsPosition,
  OrderByArgsElement,
} from './orderBy'
import { SelectItemInfo } from './select'
import { escapeDoubleQuote } from './util'
import { AggregateFunction } from './aggregateFunction'
import { Binder } from './binder'

export type ColumnLike = Column|Expression
export type PrimitiveType = null|boolean|number|string

export type SelectItem = ColumnLike|AggregateFunction|Binder|Asterisk

class BaseStep {
  constructor(protected data: BuilderData) {}

  public getSQL(): string {
    return this.getStatement()
  }

  public getBinds(): PostgresBinder {
    return {
      sql: this.getStatement(),
      values: this.data.binderStore.getValues(),
    }
  }

  private getStatement(): string {
    let result = `SELECT${this.data.distinct}`

    if (this.data.selectItemInfos.length > 0) {
      const selectPartsString = this.data.selectItemInfos.map(it => {
        return it.getStmt({ binderStore: this.data.binderStore })
      })
      result += ` ${selectPartsString.join(', ')}`
    }

    if (this.data.table) {
      result += ` FROM ${this.data.table.getStmt()}`
    }

    if (this.data.whereParts.length > 0) {
      this.throwIfWherePartsInvalid()
      const wherePartsString = this.data.whereParts.map(it => {
        if (it instanceof Condition || it instanceof Expression) {
          return it.getStmt(this.data)
        } else if (it instanceof BooleanColumn) {
          return it.getStmt()
        }
        return it.toString()
      })
      result += ` WHERE ${wherePartsString.join(' ')}`
    }

    if (this.data.groupByItems.length > 0) {
      result += ` GROUP BY ${this.data.groupByItems.map(it => it.getStmt()).join(', ')}`
    }

    if (this.data.orderByItemInfos.length > 0) {
      const orderByPartsString = this.data.orderByItemInfos.map(it => {
        return it.getStmt({ binderStore: this.data.binderStore })
      })
      result += ` ORDER BY ${orderByPartsString.join(', ')}`
    }

    if (this.data.limit !== undefined) {
      if (this.data.limit === null) {
        result += ' LIMIT NULL'
      } else {
        result += ` LIMIT ${this.data.limit}`
      }
    }

    if (this.data.offset !== undefined) {
      result += ` OFFSET ${this.data.offset}`
    }

    if (this.data.option.useSemicolonAtTheEnd)
      result += ';'

    return result
  }

  public cleanUp() {
    this.data.selectItemInfos.length = 0
    this.data.distinct = ''
    this.data.table = undefined
    this.data.whereParts.length = 0
    this.data.groupByItems.length = 0
    this.data.orderByItemInfos.length = 0
    this.data.limit = undefined
    this.data.offset = undefined
    this.data.binderStore.cleanUp()
  }

  protected addWhereParts(cond1: Condition, op1?: LogicalOperator, cond2?: Condition, op2?: LogicalOperator, cond3?: Condition) {
    if (op1 === undefined && cond2 === undefined) {
      this.data.whereParts.push(cond1)
    } else if (op1 !== undefined && cond2 !== undefined) {
      this.data.whereParts.push(Parenthesis.Open)
      this.data.whereParts.push(cond1)
      this.data.whereParts.push(op1)
      this.data.whereParts.push(cond2)
      if (op2 !== undefined && cond3 !== undefined) {
        this.data.whereParts.push(op2)
        this.data.whereParts.push(cond3)
      }
      this.data.whereParts.push(Parenthesis.Close)
    }
  }

  /**
   * This function throws error if WhereParts Array where invalid
   * it check the number of open and close parentheses in the conditions
   */
  private throwIfWherePartsInvalid() {
    let pCounter = 0
    for (let i = 0; i < this.data.whereParts.length; i++) {
      if (this.data.whereParts[i] === Parenthesis.Open) {
        pCounter++
        if (i < this.data.whereParts.length - 1)
          if (this.data.whereParts[i + 1] === Parenthesis.Close) {
            throw new Error('invalid conditions build, empty parenthesis is not allowed')
          }
      }

      if (this.data.whereParts[i] === Parenthesis.Close)
        pCounter--

      if (pCounter < 0) {// Close comes before Open
        throw new Error('invalid conditions build, closing parentheses must occur after Opening one')
      }
    }

    if (pCounter > 0) // Opening more than closing
      throw new Error('invalid conditions build, opening parentheses is more than closing ones')

    if (pCounter < 0) // Closing more than opening
      throw new Error('invalid conditions build, closing parentheses is more than opening ones')
  }
}

export class Step extends BaseStep implements RootStep, SelectStep, FromStep, GroupByStep,
  OrderByStep, LimitStep, OffsetStep {
  constructor(protected data: BuilderData) {
    super(data)
    data.step = this
  }

  public select(...items: (SelectItemInfo|SelectItem|PrimitiveType)[]): SelectStep {
    const selectItemInfos: SelectItemInfo[] = items.map(it => {
      if (it instanceof SelectItemInfo) {
        it.builderOption = this.data.option
        return it
      } else if (it instanceof Expression || it instanceof Column || it instanceof AggregateFunction || it instanceof Asterisk) {
        return new SelectItemInfo(it, undefined, this.data.option)
      } else if (it instanceof Binder) {
        if (it.no === undefined) {
          this.data.binderStore.add(it)
        }
        return new SelectItemInfo(it, undefined, this.data.option)
      } else {
        return new SelectItemInfo(new Expression(it), undefined, this.data.option)
      }
    })
    this.throwIfColumnsNotInDb(selectItemInfos)
    this.data.selectItemInfos.push(...selectItemInfos)
    return this
  }

  public selectDistinct(...items: (SelectItem|PrimitiveType)[]): SelectStep {
    this.data.distinct = ' DISTINCT'
    return this.select(...items)
  }

  public selectAll(...items: (SelectItem|PrimitiveType)[]): SelectStep {
    this.data.distinct = ' ALL'
    return this.select(...items)
  }

  public from(table: Table): FromStep {
    this.throwIfTableNotInDb(table)
    this.data.table = table
    return this
  }

  public where(cond1: Condition, op1?: LogicalOperator, cond2?: Condition, op2?: LogicalOperator, cond3?: Condition): WhereStep {
    this.addWhereParts(cond1, op1, cond2, op2, cond3)
    return new WhereStep(this.data)
  }

  public groupBy(...groupByItems: Column[]): GroupByStep {
    this.data.groupByItems.push(...groupByItems)
    return this
  }

  public orderBy(...orderByArgsElement: OrderByArgsElement[]): OrderByStep {
    if (orderByArgsElement.length === 0) {
      throw new Error('Order by should have at lease one item')
    }
    type StoreType = { orderByItem?: OrderByItem, direction?: OrderByDirection, nullsPos?: OrderByNullsPosition }
    const store: StoreType = { orderByItem: undefined, direction: undefined, nullsPos: undefined }
    const pushWhenOrderByDefined = () => {
      if (store.orderByItem !== undefined) {
        this.data.orderByItemInfos.push(new OrderByItemInfo(
          store.orderByItem,
          store.direction,
          store.nullsPos,
          this.data.option,
        ))
        store.orderByItem = undefined
        store.direction = undefined
        store.nullsPos = undefined
      }
    }

    orderByArgsElement.forEach(it => {
      if (it instanceof OrderByDirection) {
        if (store.orderByItem === undefined)
          throw new Error(`${it} expects to have column or alias before it`)
        if (store.direction !== undefined)
          throw new Error(`${it} shouldn't come after "ASC" or "DESC" without column or alias in between`)
        store.direction = it
      } else if (it instanceof OrderByNullsPosition) {
        if (store.orderByItem === undefined)
          throw new Error(`${it} expects to have column or alias before it`)
        if (store.nullsPos !== undefined)
          throw new Error(`${it} shouldn't come directly after "NULLS FIRST" or "NULLS LAST" without column or alias in between`)
        store.nullsPos = it
        pushWhenOrderByDefined()
      } else if (it instanceof OrderByItemInfo) {
        pushWhenOrderByDefined()
        it.builderOption = this.data.option
        this.data.orderByItemInfos.push(it)
      } else if (it instanceof Column) {
        pushWhenOrderByDefined()
        store.orderByItem = it
      } else if (it instanceof Expression) {
        pushWhenOrderByDefined()
        store.orderByItem = it
      } else { //it is a string
        pushWhenOrderByDefined()
        //look for the alias
        if (this.data.selectItemInfos.find(info => info.alias === it)) {
          store.orderByItem = `"${escapeDoubleQuote(it)}"`
        } else {
          throw new Error(`Alias ${it} is not exist, if this is a column, then it should be entered as Column class`)
        }
      }
    })
    pushWhenOrderByDefined()
    return this
  }

  public limit(n: null|number|All): LimitStep {
    if (typeof n === 'number' && n < 0) {
      throw new Error(`Invalid limit value ${n}, negative numbers are not allowed`)
    }
    this.data.limit = n
    return this
  }

  public limit$(n: null|number): LimitStep {
    if (typeof n === 'number' && n < 0) {
      throw new Error(`Invalid limit value ${n}, negative numbers are not allowed`)
    }
    const binder = new Binder(n)
    this.data.binderStore.add(binder)
    this.data.limit = binder
    return this
  }

  public offset(n: number): OffsetStep {
    if (n < 0) {
      throw new Error(`Invalid offset value ${n}, negative numbers are not allowed`)
    }
    this.data.offset = n
    return this
  }

  public offset$(n: number): OffsetStep {
    if (n < 0) {
      throw new Error(`Invalid offset value ${n}, negative numbers are not allowed`)
    }
    const binder = new Binder(n)
    this.data.binderStore.add(binder)
    this.data.offset = binder
    return this
  }

  private throwIfTableNotInDb(table: Table) {
    if (!this.data.database.isTableExist(table))
      throw new TableNotFoundError(`Table: "${table.name}" not found`)
  }

  private throwIfColumnsNotInDb(columns: (SelectItemInfo|ColumnLike|Asterisk)[]) {
    for (const item of columns) {
      if (item instanceof Asterisk) {
        continue
      } else if (item instanceof Expression) {
        this.throwIfColumnsNotInDb(item.getColumns())
        continue
      } else if (item instanceof SelectItemInfo) {
        this.throwIfColumnsNotInDb(item.getColumns())
        continue
      }
      // item is Column from here
      if (!this.data.database.isColumnExist(item)) {
        throw new ColumnNotFoundError(`Column: "${item.name}" not found in database`)
      }
    }
  }
}

class WhereStep extends BaseStep {
  constructor(protected data: BuilderData) { super(data) }

  public and(condition: Condition): WhereAndStep
  public and(left: Condition, operator: LogicalOperator, right: Condition): WhereAndStep
  public and(left: Condition, operator1: LogicalOperator, middle: Condition, operator2: LogicalOperator, right: Condition): WhereAndStep
  public and(cond1: Condition, op1?: LogicalOperator, cond2?: Condition, op2?: LogicalOperator, cond3?: Condition): WhereAndStep {
    this.data.whereParts.push(AND)
    this.addWhereParts(cond1, op1, cond2, op2, cond3)
    return this
  }

  public or(condition: Condition): WhereOrStep
  public or(left: Condition, operator: LogicalOperator, right: Condition): WhereOrStep
  public or(left: Condition, operator1: LogicalOperator, middle: Condition, operator2: LogicalOperator, right: Condition): WhereOrStep
  public or(cond1: Condition, op1?: LogicalOperator, cond2?: Condition, op2?: LogicalOperator, cond3?: Condition): WhereOrStep {
    this.data.whereParts.push(OR)
    this.addWhereParts(cond1, op1, cond2, op2, cond3)
    return this
  }

  public groupBy(...groupByItems: Column[]): GroupByStep {
    if (this.data.step === undefined) {
      throw new Error('Step property in builder data is not initialized')
    }
    return this.data.step.groupBy(...groupByItems)
  }

  public orderBy(...orderByItems: OrderByArgsElement[]): OrderByStep {
    if (this.data.step === undefined) {
      throw new Error('Step property in builder data is not initialized')
    }
    return this.data.step.orderBy(...orderByItems)
  }

  public limit(n: null|number|All): LimitStep {
    if (this.data.step === undefined) {
      throw new Error('Step property in builder data is not initialized')
    }
    return this.data.step.limit(n)
  }

  public limit$(n: null|number): LimitStep {
    if (this.data.step === undefined) {
      throw new Error('Step property in builder data is not initialized')
    }
    return this.data.step.limit$(n)
  }

  public offset(n: number): OffsetStep {
    if (this.data.step === undefined) {
      throw new Error('Step property in builder data is not initialized')
    }
    return this.data.step.offset(n)
  }

  public offset$(n: number): OffsetStep {
    if (this.data.step === undefined) {
      throw new Error('Step property in builder data is not initialized')
    }
    return this.data.step.offset$(n)
  }
}

//@formatter:off
export interface RootStep extends BaseStep {
  select(...items: (SelectItemInfo|SelectItem|PrimitiveType)[]): SelectStep
  selectDistinct(...items: (SelectItemInfo|SelectItem|PrimitiveType)[]): SelectStep
  selectAll(...items: (SelectItemInfo|SelectItem|PrimitiveType)[]): SelectStep
}

export interface SelectStep extends BaseStep {
  from(table: Table): FromStep
}

export interface FromStep extends BaseStep {
  where(condition: Condition): WhereStep
  where(left: Condition, operator: LogicalOperator, right: Condition): WhereStep
  where(left: Condition, operator1: LogicalOperator, middle: Condition, operator2: LogicalOperator, right: Condition): WhereStep

  groupBy(...groupByItems: Column[]): GroupByStep
  orderBy(...orderByItems: OrderByArgsElement[]): OrderByStep
  limit(n: null|number|All): LimitStep
  limit$(n: null|number): LimitStep
  offset(n: number): OffsetStep
  offset$(n: number): OffsetStep
}

interface WhereAndStep extends BaseStep {
  and(condition: Condition): WhereAndStep
  and(left: Condition, operator: LogicalOperator, right: Condition): WhereAndStep
  and(left: Condition, operator1: LogicalOperator, middle: Condition, operator2: LogicalOperator, right: Condition): WhereAndStep

  or(condition: Condition): WhereOrStep
  or(left: Condition, operator: LogicalOperator, right: Condition): WhereOrStep
  or(left: Condition, operator1: LogicalOperator, middle: Condition, operator2: LogicalOperator, right: Condition): WhereOrStep

  groupBy(...groupByItems: Column[]): GroupByStep
  orderBy(...orderByItems: OrderByArgsElement[]): OrderByStep
  limit(n: null|number|All): LimitStep
  limit$(n: null|number): LimitStep
  offset(n: number): OffsetStep
  offset$(n: number): OffsetStep
}

interface WhereOrStep extends BaseStep {
  or(condition: Condition): WhereOrStep
  or(left: Condition, operator: LogicalOperator, right: Condition): WhereOrStep
  or(left: Condition, operator1: LogicalOperator, middle: Condition, operator2: LogicalOperator, right: Condition): WhereOrStep

  and(condition: Condition): WhereAndStep
  and(left: Condition, operator: LogicalOperator, right: Condition): WhereAndStep
  and(left: Condition, operator1: LogicalOperator, middle: Condition, operator2: LogicalOperator, right: Condition): WhereAndStep

  groupBy(...groupByItems: Column[]): GroupByStep
  orderBy(...orderByItems: OrderByArgsElement[]): OrderByStep
  limit(n: null|number|All): LimitStep
  limit$(n: null|number): LimitStep
  offset(n: number): OffsetStep
  offset$(n: number): OffsetStep
}

interface GroupByStep extends BaseStep {
  orderBy(...orderByItems: OrderByArgsElement[]): OrderByStep
  limit(n: null|number|All): LimitStep
  limit$(n: null|number): LimitStep
  offset(n: number): OffsetStep
  offset$(n: number): OffsetStep
}

interface OrderByStep extends BaseStep {
  limit(n: null|number|All): LimitStep
  limit$(n: null|number): LimitStep
  offset(n: number): OffsetStep
  offset$(n: number): OffsetStep
}

interface LimitStep extends BaseStep {
  offset(n: number): OffsetStep
  offset$(n: number): OffsetStep
}

interface OffsetStep extends BaseStep {}
//@formatter:on

export enum LogicalOperator {
  AND = 'AND',
  OR = 'OR',
}

//Aliases
const AND = LogicalOperator.AND
const OR = LogicalOperator.OR

export enum Parenthesis {
  Open = '(',
  Close = ')',
}
