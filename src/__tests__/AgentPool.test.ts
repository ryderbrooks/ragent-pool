import { createRAgentPool }           from '../index';
import { IRAgentPool }                from '../meta/interfaces';
import { IRequestable }               from '@ragent/cross-types';
import { LoopStats, TestHelperTypes } from 'async-concurrency-pool';
import sTestArgs = TestHelperTypes.sTestArgs;
import sTestResponse = TestHelperTypes.sTestResponse;
import TEST_PATHS = TestHelperTypes.TEST_PATHS;
import ILoopStats = TestHelperTypes.ILoopStats;



class LStats extends LoopStats<IRequestable<sTestArgs, sTestResponse>,
  IRAgentPool<sTestArgs, sTestResponse>,
  sTestArgs,
  sTestResponse> {


  protected agentConstructor( agentID: number ): Promise<IRequestable<sTestArgs, sTestResponse>> {
    return new Promise<IRequestable<sTestArgs, sTestResponse>>(( res ): void => {
      res({
            request : ( args: sTestArgs ): Promise<sTestResponse> => {
              return this.basic(args, agentID);
            },
          });
    });
  }


  protected doWork( agent: IRequestable<sTestArgs, sTestResponse>,
                    testCondition: sTestArgs ): Promise<sTestResponse> {
    return agent.request(testCondition);
  }
}



describe('RAgentPool', () => {
  describe('single agent', () => {
    it('runs in series', async () => {
      const delay                              = 100;
      const maxAgents                          = 1;
      const tCon: sTestArgs[]                  = [
        { path : TEST_PATHS.RESOLVE, delay : delay, message : '1' },
        { path : TEST_PATHS.REJECT, delay : delay, message : '2' },
        { path : TEST_PATHS.RESOLVE, delay : delay, message : '3' },
      ];
      const results: ILoopStats<sTestResponse> = await new LStats(maxAgents,
                                                                  tCon,
                                                                  createRAgentPool).run();

      expect(results.totalLoopTime).toBeGreaterThan(results.totalDelay);
    });
  });


  describe('multiAgent', () => {
    it('waits for agent', async () => {
      const delay     = 100;
      const maxAgents = 2;

      const delta              = 15;
      const tCon: sTestArgs [] = [
        { path : TEST_PATHS.RESOLVE, delay : delay, message : '1' },
        { path : TEST_PATHS.RESOLVE, delay : delay, message : '2' },
        { path : TEST_PATHS.RESOLVE, delay : delay, message : '3' },
        { path : TEST_PATHS.RESOLVE, delay : delay, message : '4' },
        { path : TEST_PATHS.RESOLVE, delay : delay, message : '5' },
        { path : TEST_PATHS.RESOLVE, delay : delay, message : '6' },
      ];

      const results: ILoopStats<sTestResponse> = await new LStats(maxAgents,
                                                                  tCon,
                                                                  createRAgentPool).run();
      expect(results.totalLoopTime).toBeGreaterThan((results.totalDelay / 2) - delta);
      expect(results.totalLoopTime).toBeLessThan((results.totalDelay / 2) + delta);
    });
  });
});