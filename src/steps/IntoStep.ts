import { BaseStep } from './BaseStep'
import { BuilderData } from '../builder'
import { PrimitiveType } from '../models/types'
import { DefaultValuesStep, ValuesStep } from './stepInterfaces'
import { InsertColumnsAndExpressionsNotEqualError, InsertColumnsAndValuesNotEqualError } from '../errors'
import { Binder } from '../binder'
import { SelectStep } from './stepInterfaces'
import { returnStepOrThrow } from '../util'
import { SelectItemInfo } from '../SelectItemInfo'
import { SelectItem } from './Step'
import { Default } from '../singletoneConstants'

export class IntoStep extends BaseStep {
	constructor(protected data: BuilderData) { super(data) }

	public values(...values: (PrimitiveType|Binder|Default)[]): ValuesStep {
		this.throwForInvalidValuesNumber(values)
		this.data.insertIntoValues.push(...values)
		return returnStepOrThrow(this.data.step)
	}

	public values$(...values: PrimitiveType[]): ValuesStep {
		this.throwForInvalidValuesNumber(values)
		this.data.insertIntoValues.push(...values.map(it => new Binder(it)))
		return returnStepOrThrow(this.data.step)
	}

	public defaultValues(): DefaultValuesStep {
		this.data.insertIntoDefaultValues = true
		return returnStepOrThrow(this.data.step)
	}

	public select(...items: (SelectItemInfo|SelectItem|PrimitiveType)[]): SelectStep {
		this.throwForInvalidExpressionsNumber(items)
		return returnStepOrThrow(this.data.step).select(...items)
	}

	private throwForInvalidValuesNumber(values: (PrimitiveType|Binder|Default)[]) {
		const columnsCount = this.data.insertIntoColumns.length
		if (columnsCount > 0 && columnsCount !== values.length) {
			throw new InsertColumnsAndValuesNotEqualError(columnsCount, values.length)
		}
	}

	private throwForInvalidExpressionsNumber(items: (SelectItemInfo|SelectItem|PrimitiveType)[]) {
		const columnsCount = this.data.insertIntoColumns.length
		if (columnsCount > 0 && columnsCount !== items.length) {
			throw new InsertColumnsAndExpressionsNotEqualError(columnsCount, items.length)
		}
	}
}
