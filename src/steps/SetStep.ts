import { BaseStep } from './BaseStep'
import { Condition } from '../models/Condition'
import { UpdateWhereStep } from './UpdateWhereStep'
import { LogicalOperator } from '../operators'
import { MoreThanOneWhereStepError } from '../errors'
import { ItemInfo } from '../ItemInfo'
import { ReturningItem } from '../ReturningItemInfo'
import { PrimitiveType } from '../models/types'
import { ReturningStep } from './stepInterfaces'
import { returnStepOrThrow } from '../util'
import { BuilderData } from '../builder'

export class SetStep extends BaseStep {
	constructor(protected data: BuilderData) { super(data) }

	public where(condition: Condition): UpdateWhereStep
	public where(left: Condition, operator: LogicalOperator, right: Condition): UpdateWhereStep
	public where(left: Condition, operator1: LogicalOperator, middle: Condition, operator2: LogicalOperator, right: Condition): UpdateWhereStep
	public where(cond1: Condition, op1?: LogicalOperator, cond2?: Condition, op2?: LogicalOperator, cond3?: Condition): UpdateWhereStep {
		if (this.data.whereParts.length > 0) {
			throw new MoreThanOneWhereStepError('WHERE step already specified')
		}
		this.addWhereParts(cond1, op1, cond2, op2, cond3)
		return new UpdateWhereStep(this.data)
	}

	public returning(...items: (ItemInfo|ReturningItem|PrimitiveType)[]): ReturningStep {
		return returnStepOrThrow(this.data.step).returning(...items)
	}
}