import { Condition } from './models/Condition'
import { Expression, ExpressionType } from './models/Expression'
import { SelectItemInfo } from './SelectItemInfo'
import { BuilderData } from './builder'
import { ComparisonOperator } from './operators'
import { Binder } from './binder'

export enum AggregateFunctionEnum {
  SUM = 'SUM',
  AVG = 'AVG',
  COUNT = 'COUNT',
  MAX = 'MAX',
  MIN = 'MIN',
}

export class AggregateFunction {
  constructor(private readonly funcName: AggregateFunctionEnum, private readonly expression: Expression) {
    if (expression.type !== ExpressionType.NUMBER)
      throw new Error('Expression Type must be number in aggregate function')
  }

  public as(alias: string): SelectItemInfo {
    return new SelectItemInfo(this, alias)
  }

  public eq(value: number): Condition {
    return new Condition(new Expression(this), ComparisonOperator.Equal, new Expression(value))
  }

  public eq$(value: number): Condition {
    return new Condition(new Expression(this), ComparisonOperator.Equal, new Expression(new Binder(value)))
  }

  public ne(value: number): Condition {
    return new Condition(new Expression(this), ComparisonOperator.NotEqual, new Expression(value))
  }

  public ne$(value:number): Condition {
    return new Condition(new Expression(this), ComparisonOperator.NotEqual, new Expression(new Binder(value)))
  }

  public gt(value: number): Condition {
    return new Condition(new Expression(this), ComparisonOperator.GreaterThan, new Expression(value))
  }

  public gt$(value: number): Condition {
    return new Condition(new Expression(this), ComparisonOperator.GreaterThan, new Expression(new Binder(value)))
  }

  public ge(value: number): Condition {
    return new Condition(new Expression(this), ComparisonOperator.GreaterOrEqual, new Expression(value))
  }

  public ge$(value: number): Condition {
    return new Condition(new Expression(this), ComparisonOperator.GreaterOrEqual, new Expression(new Binder(value)))
  }

  public lt(value: number): Condition {
    return new Condition(new Expression(this), ComparisonOperator.LesserThan, new Expression(value))
  }

  public lt$(value: number): Condition {
    return new Condition(new Expression(this), ComparisonOperator.LesserThan, new Expression(new Binder(value)))
  }

  public le(value: number): Condition {
    return new Condition(new Expression(this), ComparisonOperator.LesserOrEqual, new Expression(value))
  }

  public le$(value: number): Condition {
    return new Condition(new Expression(this), ComparisonOperator.LesserOrEqual, new Expression(new Binder(value)))
  }

  public getStmt(data: BuilderData): string {
    return `${this.funcName}(${this.expression.getStmt(data, { withOuterBracket: false })})`
  }
}
