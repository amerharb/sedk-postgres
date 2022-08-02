import { BaseStep } from './BaseStep'
import { BuilderData } from '../builder'
import { Condition } from '../models/Condition'
import { LogicalOperator } from '../operators'
import { ReturningStep } from './stepInterfaces'
import { ReturningItem } from '../ReturningItemInfo'
import { PrimitiveType } from '../models/types'
import { returnStepOrThrow } from '../util'
import { ItemInfo } from '../ItemInfo'

export interface UpdateWhereOrStep extends UpdateWhereStep {}

export interface UpdateWhereAndStep extends UpdateWhereStep {}

export class UpdateWhereStep extends BaseStep {
	constructor(protected data: BuilderData) { super(data) }

	public and(condition: Condition): UpdateWhereStep
	public and(left: Condition, operator: LogicalOperator, right: Condition): UpdateWhereAndStep
	public and(left: Condition, operator1: LogicalOperator, middle: Condition, operator2: LogicalOperator, right: Condition): UpdateWhereAndStep
	public and(cond1: Condition, op1?: LogicalOperator, cond2?: Condition, op2?: LogicalOperator, cond3?: Condition): UpdateWhereAndStep {
		this.data.whereParts.push(LogicalOperator.AND)
		this.addWhereParts(cond1, op1, cond2, op2, cond3)
		return this
	}

	public or(condition: Condition): UpdateWhereOrStep
	public or(left: Condition, operator: LogicalOperator, right: Condition): UpdateWhereOrStep
	public or(left: Condition, operator1: LogicalOperator, middle: Condition, operator2: LogicalOperator, right: Condition): UpdateWhereOrStep
	public or(cond1: Condition, op1?: LogicalOperator, cond2?: Condition, op2?: LogicalOperator, cond3?: Condition): UpdateWhereOrStep {
		this.data.whereParts.push(LogicalOperator.OR)
		this.addWhereParts(cond1, op1, cond2, op2, cond3)
		return this
	}

	public returning(...items: (ItemInfo|ReturningItem|PrimitiveType)[]): ReturningStep {
		return returnStepOrThrow(this.data.step).returning(...items)
	}
}
