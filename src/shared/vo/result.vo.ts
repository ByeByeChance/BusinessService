export class ResultVo {
  readonly code!: number;
  readonly msg!: string;
}

export class ResultDataVo<T = any> extends ResultVo {
  readonly data!: T;
}

export class ResultListVo<T> {
  readonly list!: T[];
  readonly total!: number;
  readonly pageSize!: number;
  readonly current!: number;
}
