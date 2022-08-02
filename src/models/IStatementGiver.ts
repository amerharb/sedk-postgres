import { BuilderData } from '../builder'

export interface IStatementGiver {
	getStmt(data: BuilderData): string
}