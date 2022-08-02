export class Asterisk {
	private static instance: Asterisk
	private readonly unique: symbol = Symbol()

	private constructor() {}

	public static getInstance(): Asterisk {
		if (!Asterisk.instance) {
			Asterisk.instance = new Asterisk()
		}
		return Asterisk.instance
	}

	public getStmt(): string {
		return '*'
	}
}

export const ASTERISK = Asterisk.getInstance()

export class Distinct {
	private static instance: Distinct
	private readonly unique: symbol = Symbol()

	private constructor() {}

	public static getInstance(): Distinct {
		if (!Distinct.instance) {
			Distinct.instance = new Distinct()
		}
		return Distinct.instance
	}

	public toString(): string {
		return 'DISTINCT'
	}
}

export const DISTINCT = Distinct.getInstance()

export class All {
	private static instance: All
	private readonly unique: symbol = Symbol()

	private constructor() {}

	public static getInstance(): All {
		if (!All.instance) {
			All.instance = new All()
		}
		return All.instance
	}

	public toString(): string {
		return 'ALL'
	}
}

export const ALL = All.getInstance()

export class Default {
	private static instance: Default
	private readonly unique: symbol = Symbol()

	private constructor() {}

	public static getInstance(): Default {
		if (!Default.instance) {
			Default.instance = new Default()
		}
		return Default.instance
	}

	public getStmt(): string {
		return 'DEFAULT'
	}
}

export const DEFAULT = Default.getInstance()
