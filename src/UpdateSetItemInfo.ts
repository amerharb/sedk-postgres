import { IStatementGiver } from './models/IStatementGiver'
import { Column } from './columns'
import { Expression } from './models/Expression'
import { BuilderData } from './builder'
import { Binder } from './binder'
import { PrimitiveType } from './models/types'
import { Operand } from './models/Operand'
import { Default } from './singletoneConstants'

export class UpdateSetItemInfo implements IStatementGiver {
	public readonly operand: Operand|Default

	constructor(
    public readonly column: Column,
    value: PrimitiveType|Binder|Expression|Default,
	) {
		if (value instanceof Default) {
			this.operand = value
		} else {
			this.operand = new Operand(value)
		}
	}

	public getColumns(): Column[] {
		return [this.column]
	}

	public getStmt(data: BuilderData): string {
		return `${this.column.getStmt(data)} = ${this.operand.getStmt(data)}`
	}
}
