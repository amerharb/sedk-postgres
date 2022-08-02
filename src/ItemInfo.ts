import { Column } from './columns'
import { BuilderData } from './builder'
import { IStatementGiver } from './models/IStatementGiver'

export abstract class ItemInfo implements IStatementGiver {
	private readonly unique: symbol = Symbol()

	protected constructor(
    public readonly alias?: string,
	) {}

  public abstract getColumns(): Column[]

  public abstract getStmt(data: BuilderData): string
}