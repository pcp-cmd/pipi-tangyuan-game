import {FOUNDATION_LESSON_DATA,FOUNDATION_SCHEMAS,FOUNDATION_CONTRACT_DIGEST} from './foundation-data.mjs';
import {validateResult} from './foundation-validator.mjs';
const byId=new Map(FOUNDATION_LESSON_DATA.map(row=>[row.id,row]));
export const FOUNDATION_LESSONS=FOUNDATION_LESSON_DATA;
export const FOUNDATION_IDS=Object.freeze(FOUNDATION_LESSONS.map(row=>row.id));
export {FOUNDATION_CONTRACT_DIGEST};
export function foundationSchema(task){if(!Object.hasOwn(FOUNDATION_SCHEMAS,task))throw new Error('Unknown foundation task.');return FOUNDATION_SCHEMAS[task];}
export function foundationRequestFields(lessonId,scene='normal'){
  const lesson=byId.get(lessonId);
  if(!lesson||scene!=='normal')throw new Error('Unknown foundation lesson or scene.');
  return Object.freeze({judgeKind:'foundations',foundationTask:lesson.foundationTask,foundationContractDigest:FOUNDATION_CONTRACT_DIGEST,scene,checks:Object.freeze([])});
}
export function validateFoundationRequest(request){
  if(!request||request.kind!=='lesson'||request.judgeKind!=='foundations')throw new Error('Mismatched foundation route.');
  const trusted=foundationRequestFields(request.lessonId,request.scene);
  if(request.foundationTask!==trusted.foundationTask||request.foundationContractDigest!==FOUNDATION_CONTRACT_DIGEST)throw new Error('Mismatched foundation contract.');
  return trusted;
}
export function foundationRunBudgetMs(request){validateFoundationRequest(request);return 25000;}
export function parseFoundationResult(raw,request,sourceDigest){
  const trusted=validateFoundationRequest(request);
  if(!/^[a-f0-9]{64}$/.test(sourceDigest)||raw?.foundationContractDigest!==FOUNDATION_CONTRACT_DIGEST)throw new Error('Mismatched foundation source or contract proof.');
  validateResult(raw,trusted.foundationTask,sourceDigest);
  const checks=raw.checks.map(row=>({id:row.id,label:row.label,passed:row.passed,detail:row.detail}));
  if(checks.some(row=>row.detail.length>2400||[...row.detail].length>1200))throw new Error('Oversized foundation check detail.');
  if(!raw.ok){
    const {name,message,line}=raw.error;
    if(name.length>100||message.length>2000||(line!=null&&(!Number.isInteger(line)||line<1||line>20001)))throw new Error('Invalid foundation error.');
    return {kind:'python-error',stdout:raw.stdout,checks,worldEvents:[],error:{name,message,line:line??null}};
  }
  return raw.passed?{kind:'success',stdout:raw.stdout,checks,worldEvents:[],effects:[]}:{kind:'incorrect',stdout:raw.stdout,checks,worldEvents:[]};
}
