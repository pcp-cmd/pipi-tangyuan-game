import {runBudgetMs as previousRouteBudgetMs} from './lifecycle-route.mjs';
import {FOUNDATION_IDS,foundationRunBudgetMs} from './foundation-route.mjs';
// The request snapshot, controller timer and settlement share this one policy.
export function runBudgetMs(request){
  if(request?.judgeKind==='foundations'||FOUNDATION_IDS.includes(request?.lessonId))return foundationRunBudgetMs(request);
  return previousRouteBudgetMs(request);
}
