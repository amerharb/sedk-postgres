import { Column } from './columns'
import { Expression } from './models/Expression'
import { escapeDoubleQuote } from './util'
import { BuilderData } from './builder'
import { Binder } from './binder'
import { Asterisk } from './singletoneConstants'
import { ColumnLike } from './steps/Step'
import { ItemInfo } from './ItemInfo'

export type ReturningItem = ColumnLike|Binder|Asterisk

export class ReturningItemInfo extends ItemInfo {
	constructor(
    private readonly returningItem: ReturningItem,
    public readonly alias?: string,
	) {
		super(alias)
	}

	public getColumns(): Column[] {
		if (this.returningItem instanceof Column) {
			return [this.returningItem]
		} else if (this.returningItem instanceof Expression) {
			return this.returningItem.getColumns()
		}
		return []
	}

	public getStmt(data: BuilderData): string {
		if (this.alias !== undefined) {
			// escape double quote by repeating it
			const escapedAlias = escapeDoubleQuote(this.alias)
			const asString = (data.option?.addAsBeforeColumnAlias === 'always')
				? ' AS' : ''
			return `${this.returningItem.getStmt(data)}${asString} "${escapedAlias}"`
		}
		return `${this.returningItem.getStmt(data)}`
	}
}
