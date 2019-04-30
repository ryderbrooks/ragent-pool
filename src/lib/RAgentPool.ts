import { createAsyncPool, IAsyncPool, tAgentConstructor } from 'async-concurrency-pool';
import { IRAgentPool }                                    from '../meta/interfaces';
import { IRequestable }                                   from '@ragent/cross-types';
import { AsyncEventEmitter }                              from '@ryder_brooks/event-emitter-async';



export class RAgentPool<A, R> extends AsyncEventEmitter<string> implements IRAgentPool<A, R> {
  public get agentCnt(): number {
    return this.pool.agentCnt;
  }


  public async getNextAgent(): Promise<IRequestable<A, R>> {
    return this.pool.getNext();
  }


  public constructor( agentConstructor: tAgentConstructor<IRequestable<A, R>>,
                      maxAgents: number ) {
    super();
    this.pool = createAsyncPool<IRequestable<A, R>>(agentConstructor,
                                                    maxAgents);
  }


  private pool: IAsyncPool<IRequestable<A, R>>;


  //@ts-ignore
  protected removeAgent( agent: IRequestable<A, R>, err?: Error ): void {
    this.pool.remove(agent);
  }


  protected returnAgent( agent: IRequestable<A, R> ): void {
    this.pool.add(agent);
  }


  public [ Symbol.asyncIterator ](): AsyncIterator<IRequestable<A, R>> {
    return {
      next : async (): Promise<IteratorResult<IRequestable<A, R>>> => {
        const agent: IRequestable<A, R> = await this.getNextAgent();
        return {
          value :
            {
              request : ( args: A ): Promise<R> => {
                if( !agent ) {
                  throw new Error('agent is bad');
                }

                return agent.request(args)
                            .then(( response: R | Promise<R> ) => {
                              this.returnAgent(agent);
                              return response;
                            })
                            .catch(( err: Error ) => {
                              switch ( err.message ) {
                                default:
                                  this.removeAgent(agent, err);
                              }
                              throw err;
                            });
              },
            },
          done  : false,
        };
      },
    };
  }
}


