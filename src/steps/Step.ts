import { PrimitiveType } from '../models/types'
import { Condition } from '../models/Condition'
import { Expression } from '../models/Expression'
import { Column } from '../columns'
import { AliasedTable, Table } from '../database'
import {
	ColumnNotFoundError,
	InvalidLimitValueError,
	InvalidOffsetValueError,
	MoreThanOneWhereStepError,
} from '../errors'
import { BuilderData, SqlPath } from '../builder'
import { ALL, All, Asterisk, DISTINCT } from '../singletoneConstants'
import { OrderByArgsElement, OrderByDirection, OrderByItem, OrderByItemInfo, OrderByNullsPosition } from '../orderBy'
import { SelectItemInfo } from '../SelectItemInfo'
import { escapeDoubleQuote } from '../util'
import { AggregateFunction } from '../AggregateFunction'
import { Binder } from '../binder'
import { BaseStep } from './BaseStep'
import { SelectWhereStep } from './SelectWhereStep'
import { HavingStep } from './HavingStep'
import {
	CrossJoinStep,
	DefaultValuesStep,
	FullOuterJoinStep,
	GroupByStep,
	InnerJoinStep,
	JoinStep,
	LeftJoinStep,
	LimitStep,
	OffsetStep,
	OrderByStep,
	ReturningStep,
	RightJoinStep,
	RootStep,
	SelectFromStep,
	SelectStep,
	UpdateStep,
	ValuesStep,
} from './stepInterfaces'
import { LogicalOperator } from '../operators'
import { FromItemRelation } from '../FromItemInfo'
import { OnStep } from './OnStep'
import { DeleteStep } from './DeleteStep'
import { ReturningItem, ReturningItemInfo } from '../ReturningItemInfo'
import { ItemInfo } from '../ItemInfo'
import { InsertStep } from './InsertStep'
import { UpdateSetItemInfo } from '../UpdateSetItemInfo'
import { SetStep } from './SetStep'

export type ColumnLike = Column|Expression

export type SelectItem = ColumnLike|AggregateFunction|Binder|Asterisk

export class Step extends BaseStep
	implements RootStep, SelectStep, SelectFromStep, CrossJoinStep, JoinStep, LeftJoinStep, RightJoinStep, InnerJoinStep,
    FullOuterJoinStep, GroupByStep, OrderByStep, LimitStep, OffsetStep, ValuesStep, DefaultValuesStep, UpdateStep {
	constructor(protected data: BuilderData) {
		super(data)
		data.step = this
	}

	public select(...items: (SelectItemInfo|SelectItem|PrimitiveType)[]): SelectStep {
		if (this.data.sqlPath === undefined) {
			this.data.sqlPath = SqlPath.SELECT
		}
		const selectItemInfos: SelectItemInfo[] = items.map(it => {
			if (it instanceof SelectItemInfo) {
				return it
			} else if (it instanceof Expression || it instanceof Column || it instanceof AggregateFunction || it instanceof Asterisk) {
				return new SelectItemInfo(it, undefined)
			} else if (it instanceof Binder) {
				if (it.no === undefined) {
					this.data.binderStore.add(it)
				}
				return new SelectItemInfo(it, undefined)
			} else {
				return new SelectItemInfo(new Expression(it), undefined)
			}
		})
		this.throwIfColumnsNotInDb(selectItemInfos)
		this.data.selectItemInfos.push(...selectItemInfos)
		return this
	}

	public selectDistinct(...items: (SelectItemInfo|SelectItem|PrimitiveType)[]): SelectStep {
		if (this.data.sqlPath === undefined) {
			this.data.sqlPath = SqlPath.SELECT
		}
		this.data.distinct = DISTINCT
		return this.select(...items)
	}

	public selectAll(...items: (SelectItemInfo|SelectItem|PrimitiveType)[]): SelectStep {
		if (this.data.sqlPath === undefined) {
			this.data.sqlPath = SqlPath.SELECT
		}
		this.data.distinct = ALL
		return this.select(...items)
	}

	public delete(): DeleteStep {
		this.data.sqlPath = SqlPath.DELETE
		return new DeleteStep(this.data)
	}

	public insert(): InsertStep {
		this.data.sqlPath = SqlPath.INSERT
		return new InsertStep(this.data)
	}

	public update(table: Table): UpdateStep {
		this.data.sqlPath = SqlPath.UPDATE
		this.data.updateTable = table
		return this
	}

	public from(...tables: (Table|AliasedTable)[]): SelectFromStep {
		if (tables.length === 0)
			throw new Error('No tables specified')

		tables.forEach(table => {
			this.throwIfTableNotInDb(BaseStep.getTable(table))
		})

		for (let i = 0; i < tables.length; i++) {
			this.addFromItemInfo(tables[i], i === 0 ? FromItemRelation.NO_RELATION : FromItemRelation.COMMA)
		}

		// return new SelectFromStep(this.data)
		return this
	}

	public crossJoin(table: Table|AliasedTable): CrossJoinStep {
		this.addFromItemInfo(table, FromItemRelation.CROSS_JOIN)
		return this
	}

	public join(table: Table|AliasedTable): JoinStep {
		this.addFromItemInfo(table, FromItemRelation.JOIN)
		return this
	}

	public leftJoin(table: Table|AliasedTable): LeftJoinStep {
		this.addFromItemInfo(table, FromItemRelation.LEFT_JOIN)
		return this
	}

	public rightJoin(table: Table|AliasedTable): RightJoinStep {
		this.addFromItemInfo(table, FromItemRelation.RIGHT_JOIN)
		return this
	}

	public innerJoin(table: Table|AliasedTable): InnerJoinStep {
		this.addFromItemInfo(table, FromItemRelation.INNER_JOIN)
		return this
	}

	public fullOuterJoin(table: Table|AliasedTable): FullOuterJoinStep {
		this.addFromItemInfo(table, FromItemRelation.FULL_OUTER_JOIN)
		return this
	}

	public on(condition: Condition): OnStep {
		this.data.fromItemInfos[this.data.fromItemInfos.length - 1].addFirstCondition(condition)
		return new OnStep(this.data)
	}

	public where(cond1: Condition, op1?: LogicalOperator, cond2?: Condition, op2?: LogicalOperator, cond3?: Condition): SelectWhereStep {
		if (this.data.whereParts.length > 0) {
			throw new MoreThanOneWhereStepError('WHERE step already specified')
		}
		this.addWhereParts(cond1, op1, cond2, op2, cond3)
		return new SelectWhereStep(this.data)
	}

	public groupBy(...groupByItems: Column[]): GroupByStep {
		this.data.groupByItems.push(...groupByItems)
		return this
	}

	public having(cond1: Condition, op1?: LogicalOperator, cond2?: Condition, op2?: LogicalOperator, cond3?: Condition): HavingStep {
		this.addHavingParts(cond1, op1, cond2, op2, cond3)
		return new HavingStep(this.data)
	}

	public orderBy(...orderByArgsElement: OrderByArgsElement[]): OrderByStep {
		if (orderByArgsElement.length === 0) {
			throw new Error('Order by should have at lease one item')
		}
    type StoreType = { orderByItem?: OrderByItem, direction?: OrderByDirection, nullsPos?: OrderByNullsPosition }
    const store: StoreType = { orderByItem: undefined, direction: undefined, nullsPos: undefined }
    const pushWhenOrderByItemDefined = () => {
    	if (store.orderByItem !== undefined) {
    		this.data.orderByItemInfos.push(new OrderByItemInfo(
    			store.orderByItem,
    			store.direction,
    			store.nullsPos,
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
    		pushWhenOrderByItemDefined()
    	} else if (it instanceof OrderByItemInfo) {
    		pushWhenOrderByItemDefined()
    		this.data.orderByItemInfos.push(it)
    	} else if (it instanceof Column) {
    		pushWhenOrderByItemDefined()
    		store.orderByItem = it
    	} else if (it instanceof Expression) {
    		pushWhenOrderByItemDefined()
    		store.orderByItem = it
    	} else { //it is a string
    		pushWhenOrderByItemDefined()
    		//look for the alias
    		if (this.data.selectItemInfos.find(info => info.alias === it)) {
    			store.orderByItem = `"${escapeDoubleQuote(it)}"`
    		} else {
    			throw new Error(`Alias ${it} is not exist, if this is a column, then it should be entered as Column class`)
    		}
    	}
    })
    pushWhenOrderByItemDefined()
    return this
	}

	public limit(n: null|number|All): LimitStep {
		if (typeof n === 'number' && (!Number.isFinite(n) || n < 0)) {
			throw new InvalidLimitValueError(`Invalid limit value: ${n}, value must be positive numbers, null or "ALL"`)
		}
		this.data.limit = n
		return this
	}

	public limit$(n: null|number): LimitStep {
		if (typeof n === 'number' && (!Number.isFinite(n) || n < 0)) {
			throw new InvalidLimitValueError(`Invalid limit value: ${n}, value must be positive numbers or null`)
		}
		this.data.limit = this.data.binderStore.getBinder(n)
		return this
	}

	public offset(n: number): OffsetStep {
		if (!Number.isFinite(n) || n < 0) {
			throw new InvalidOffsetValueError(`Invalid offset value: ${n}, value must be positive numbers`)
		}
		this.data.offset = n
		return this
	}

	public offset$(n: number): OffsetStep {
		if (!Number.isFinite(n) || n < 0) {
			throw new InvalidOffsetValueError(`Invalid offset value: ${n}, value must be positive numbers`)
		}
		this.data.offset = this.data.binderStore.getBinder(n)
		return this
	}

	public returning(...items: (ItemInfo|ReturningItem|PrimitiveType)[]): ReturningStep {
		if (this.data.sqlPath === SqlPath.SELECT) {
			throw new Error('Returning step can not be used in SELECT statement, It can be only use if the path start with INSERT, DELETE, or UPDATE')
		}
		const returningItemInfo: ReturningItemInfo[] = items.map(it => {
			if (it instanceof ReturningItemInfo) {
				return it
			} else if (it instanceof Expression || it instanceof Column || it instanceof Asterisk) {
				return new ReturningItemInfo(it, undefined)
			} else if (it instanceof Binder) {
				if (it.no === undefined) {
					this.data.binderStore.add(it)
				}
				return new ReturningItemInfo(it, undefined)
			} else if (it instanceof SelectItemInfo) {
				if (it.selectItem instanceof AggregateFunction) {
					throw new Error(`Aggregate function ${it.selectItem.funcName} cannot be used in RETURNING clause`)
				} else {
					return new ReturningItemInfo(it.selectItem, it.alias)
				}
			} else if (it instanceof ItemInfo) { // not possible as long as ItemInfo is an abstract class
				throw new Error('ItemInfo is an abstract class')
			} else { //it from here is a PrimitiveType
				return new ReturningItemInfo(new Expression(it), undefined)
			}
		})
		this.throwIfColumnsNotInDb(returningItemInfo)
		this.data.returning.push(...returningItemInfo)
		return this
	}

	private throwIfColumnsNotInDb(columns: (ReturningItemInfo|SelectItemInfo|ColumnLike)[]) {
		for (const item of columns) {
			if (
				item instanceof Expression
        || item instanceof SelectItemInfo
        || item instanceof ReturningItemInfo
			) {
				this.throwIfColumnsNotInDb(item.getColumns())
				continue
			}
			// after this, item is type Column
			if (!this.data.database.hasColumn(item)) {
				throw new ColumnNotFoundError(`Column: "${item.name}" not found in database`)
			}
		}
	}

	set(...items: UpdateSetItemInfo[]): SetStep {
		this.data.updateSetItemInfos.push(...items)
		return new SetStep(this.data)
	}
}
