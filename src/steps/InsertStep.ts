import { BaseStep } from './BaseStep'
import { BuilderData } from '../builder'
import { Table } from '../database'
import { Column } from '../columns'
import { IntoStep } from './IntoStep'

export class InsertStep extends BaseStep {
	constructor(protected data: BuilderData) { super(data) }

	public into(table: Table, ...columns:Column[]): IntoStep {
		this.throwIfTableNotInDb(table)
		this.data.insertIntoTable = table
		this.data.insertIntoColumns.push(...columns)
		return new IntoStep(this.data)
	}
}
