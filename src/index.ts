import { RAgentPool }   from './lib/RAgentPool';
import { IRAgentPool }  from './meta/interfaces';
import { IRequestable } from '@ragent/cross-types';


type tAgentConstructor<T> = () => Promise<T>;
export { IRAgentPool }  from './meta/interfaces';
export { RAgentPool }   from './lib/RAgentPool';

export function createRAgentPool<A, R>( agentConstructor: tAgentConstructor<IRequestable<A, R>>,
                                        maxAgents: number ): IRAgentPool<A, R> {
  return new RAgentPool(agentConstructor, maxAgents);
}

