import { BaseStep } from './BaseStep'
import { BuilderData } from '../builder'
import { Condition } from '../models/Condition'
import { Column } from '../columns'
import { OrderByArgsElement } from '../orderBy'
import { All } from '../singletoneConstants'
import {
	CrossJoinStep, FullOuterJoinStep, GroupByStep, IAfterFromSteps, InnerJoinStep, JoinStep, LeftJoinStep,
	LimitStep, OffsetStep, OnAndStep, OnOrStep, OrderByStep, ReturningStep, RightJoinStep,
} from './stepInterfaces'
import { LogicalOperator } from '../operators'
import { SelectWhereStep } from './SelectWhereStep'
import { Table } from '../database'
import { returnStepOrThrow } from '../util'
import { ItemInfo } from '../ItemInfo'
import { ReturningItem } from '../ReturningItemInfo'
import { PrimitiveType } from '../models/types'

export class OnStep extends BaseStep implements IAfterFromSteps {
	constructor(protected data: BuilderData) { super(data) }

	public or(condition: Condition): OnOrStep {
		this.data.fromItemInfos[this.data.fromItemInfos.length - 1].addOrCondition(condition)
		return this
	}

	public and(condition: Condition): OnAndStep {
		this.data.fromItemInfos[this.data.fromItemInfos.length - 1].addAndCondition(condition)
		return this
	}

	public crossJoin(table: Table): CrossJoinStep {
		return returnStepOrThrow(this.data.step).crossJoin(table)
	}

	public join(table: Table): JoinStep {
		return returnStepOrThrow(this.data.step).join(table)
	}

	public leftJoin(table: Table): LeftJoinStep {
		return returnStepOrThrow(this.data.step).leftJoin(table)
	}

	public rightJoin(table: Table): RightJoinStep {
		return returnStepOrThrow(this.data.step).rightJoin(table)
	}

	public innerJoin(table: Table): InnerJoinStep {
		return returnStepOrThrow(this.data.step).innerJoin(table)
	}

	public fullOuterJoin(table: Table): FullOuterJoinStep {
		return returnStepOrThrow(this.data.step).fullOuterJoin(table)
	}

	where(condition: Condition): SelectWhereStep
	where(left: Condition, operator: LogicalOperator, right: Condition): SelectWhereStep
	where(left: Condition, operator1: LogicalOperator, middle: Condition, operator2: LogicalOperator, right: Condition): SelectWhereStep
	public where(left: Condition, operator?: LogicalOperator, right?: Condition): SelectWhereStep {
		return returnStepOrThrow(this.data.step).where(left, operator, right)
	}

	public groupBy(...groupByItems: Column[]): GroupByStep {
		return returnStepOrThrow(this.data.step).groupBy(...groupByItems)
	}

	public orderBy(...orderByItems: OrderByArgsElement[]): OrderByStep {
		return returnStepOrThrow(this.data.step).orderBy(...orderByItems)
	}

	public limit(n: null|number|All): LimitStep {
		return returnStepOrThrow(this.data.step).limit(n)
	}

	public limit$(n: null|number): LimitStep {
		return returnStepOrThrow(this.data.step).limit$(n)
	}

	public offset(n: number): OffsetStep {
		return returnStepOrThrow(this.data.step).offset(n)
	}

	public offset$(n: number): OffsetStep {
		return returnStepOrThrow(this.data.step).offset$(n)
	}

	public returning(...items: (ItemInfo|ReturningItem|PrimitiveType)[]): ReturningStep {
		return returnStepOrThrow(this.data.step).returning(...items)
	}
}
