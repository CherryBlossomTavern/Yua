import {
  CommandExtra,
  CommandProps,
} from '../../@types'

export abstract class BaseCommand {
  private _name: string
  private _extra: CommandExtra
  constructor(name: string, extra?: CommandExtra) {
    this._name = name
    this._extra = extra
  }
  get name(): string {
    return this._name
  }
  get extra(): CommandExtra {
    return this._extra
  }
  public abstract execute(props: CommandProps): void
}
