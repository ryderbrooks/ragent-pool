import { IRequestable } from '@ragent/cross-types';



export interface IRAgentPool<A, R> {
  agentCnt: number;

  getNextAgent(): Promise<IRequestable<A, R>>;

  [ Symbol.asyncIterator ](): AsyncIterator<IRequestable<A, R>>;
}

