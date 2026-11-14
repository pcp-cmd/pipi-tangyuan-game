import {EXTERNAL_TASKS} from './external-task-data.mjs';
import {TRUSTED_EXTERNAL_ASSESSORS} from './external-review-policy.mjs';

const WORK_SCHEMA = 'pipi-external-work/v1';
const BUNDLE_SCHEMA = 'pipi-external-submission/v1';
const RECEIPT_SCHEMA = 'pipi-external-review/v1';
const MAX_FILE_BYTES = 64 * 1024;
const MAX_TOTAL_BYTES = 512 * 1024;
const MAX_BUNDLE_BYTES = 700 * 1024;
const encoder = new TextEncoder();
const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const exact = (value, keys) => object(value) && Object.keys(value).length === keys.length && keys.every(key => Object.hasOwn(value,key));
const text = (value, limit, nonempty=false) => typeof value === 'string' && value.length <= limit && (!nonempty || value.length > 0);
const digestValue = value => typeof value === 'string' && /^[a-f0-9]{64}$/.test(value);
const instant = value => Number.isSafeInteger(value) && value >= 0;
const scopeValue = value => typeof value === 'string' && /^work-[a-f0-9-]{36}$/.test(value);
const deepFreeze = value => { if (value && typeof value === 'object') { Object.values(value).forEach(deepFreeze); Object.freeze(value); } return value; };
const fail = (reason, message, extra={}) => ({ok:false,reason,message,...extra});
export function canonicalExternalJson(value) {
  if (value === null || typeof value === 'string' || typeof value === 'boolean' || Number.isSafeInteger(value)) return JSON.stringify(value);
  if (Array.isArray(value)) return '[' + value.map(canonicalExternalJson).join(',') + ']';
  if (object(value)) return '{' + Object.keys(value).sort().map(key => JSON.stringify(key)+':'+canonicalExternalJson(value[key])).join(',') + '}';
  throw new Error('Unsupported review encoding.');
}
export async function externalDigest(value) {
  const result = await crypto.subtle.digest('SHA-256',encoder.encode(value));
  return [...new Uint8Array(result)].map(byte=>byte.toString(16).padStart(2,'0')).join('');
}

export function externalAssignments() { return [...EXTERNAL_TASKS]; }
export function externalAssignment(id) { return EXTERNAL_TASKS.find(task => task.id === id) ?? null; }

function relativePathSyntax(path) {
  return text(path,180,true) && !path.startsWith('/') && !path.includes('\\') && !path.includes(':') && !/[\u0000-\u001f\u007f]/.test(path) &&
    path.split('/').every(part=>part && part !== '.' && part !== '..');
}
function validPath(path) { return relativePathSyntax(path) && !path.split('/').some(part=>/^(?:\.git|\.venv|venv|node_modules|__pycache__)$/i.test(part)); }
function allowedPath(path, assignment) { return assignment.allowedFiles.includes(path) || /^tests\/test_[A-Za-z0-9_-]{1,60}\.py$/.test(path); }
function validateDeclaration(value) {
  if (!exact(value,['execution','pythonVersion','commandLog','assistance','notes']) ||
      !['not-run','self-reported-run','setup-blocked'].includes(value.execution) || !text(value.pythonVersion,200) ||
      !text(value.commandLog,6000) || !text(value.notes,2000) || !['none','hint','reference','ai','peer','mixed'].includes(value.assistance))
    throw new Error('请用提交表填写运行情况、环境与帮助来源。');
  return structuredClone(value);
}
export const DEFAULT_EXTERNAL_DECLARATION = deepFreeze({execution:'not-run',pythonVersion:'',commandLog:'',assistance:'none',notes:''});
function secretRisk(content) {
  return /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/.test(content) || /\bAKIA[0-9A-Z]{16}\b/.test(content) ||
    /\bsk-(?:proj-)?[A-Za-z0-9_-]{24,}\b/.test(content) ||
    /(?:api[_-]?key|access[_-]?token|password)\s*[=:]\s*['"]?[A-Za-z0-9+/_=-]{12,}/i.test(content);
}
function normalizedFiles(files, excludedPaths=[], assignment) {
  if (!Array.isArray(files) || files.length > 128 || files.some(file=>!exact(file,['path','text']) || !text(file.path,240,true) || typeof file.text !== 'string'))
    throw new Error('请提供文本文件清单。压缩包与可执行文件不能作为提交材料。');
  let prefix = '';
  // A rejected directory entry must not poison the common project-root name.
  // Original paths still undergo independent rejection before any inclusion.
  const originals = files.map(file=>file.path).filter(path=>relativePathSyntax(path) && !excludedPaths.includes(path));
  if (originals.length) {
    const first=originals[0].split('/')[0];
    const knownRoots = new Set(['tests', ...assignment.allowedFiles.filter(path=>path.includes('/')).map(path=>path.split('/')[0])]);
    if (!knownRoots.has(first) && originals.every(path=>path.startsWith(first+'/'))) prefix=first+'/';
  }
  return files.map(file=>({...file,originalPath:file.path,path:prefix&&file.path.startsWith(prefix)?file.path.slice(prefix.length):file.path}));
}
export async function prepareExternalSubmission({taskId, files, excludedPaths=[], declaration=DEFAULT_EXTERNAL_DECLARATION}={}) {
  const assignment = externalAssignment(taskId);
  if (!assignment) return fail('unknown-task','这份外部委托尚未开放。');
  let rows, declared;
  try { rows=normalizedFiles(files,Array.isArray(excludedPaths)?excludedPaths:[],assignment); declared=validateDeclaration(declaration); }
  catch(error) { return fail('invalid-material',error.message); }
  if (!Array.isArray(excludedPaths) || new Set(excludedPaths).size !== excludedPaths.length || excludedPaths.some(path=>typeof path !== 'string' || !rows.some(row=>row.originalPath===path)))
    return fail('invalid-exclusions','排除清单与已选文件不一致，请重新预览。');
  const included=[], omitted=[], issues=[], seen=new Set();
  let totalBytes=0;
  for(const row of rows) {
    if (excludedPaths.includes(row.originalPath)) { omitted.push({path:row.originalPath,reason:'已由你排除'}); continue; }
    const bytes=encoder.encode(row.text).length;
    let reason='';
    if (!validPath(row.originalPath) || !validPath(row.path)) reason='路径不在可提交的项目范围内';
    else if (!allowedPath(row.path, assignment)) reason='不属于这份作业的源码、测试、合成样例或说明';
    else if (seen.has(row.path)) reason='同一个提交路径出现了两次';
    else if (bytes>MAX_FILE_BYTES) reason='单个文本文件超过64 KiB';
    else if (/\u0000|\ufffd/.test(row.text)) reason='含有二进制或无法可靠解码的内容';
    else if (secretRisk(row.text)) reason='发现可能的凭证，请先去敏或排除该文件';
    if (reason) { issues.push({path:row.originalPath,reason,canExclude:true}); continue; }
    seen.add(row.path); totalBytes+=bytes;
    included.push({path:row.path,text:row.text,bytes,sha256:await externalDigest(row.text)});
  }
  if(included.length>48 || totalBytes>MAX_TOTAL_BYTES) issues.push({path:'',reason:'最小提交最多48个文件、512 KiB',canExclude:false});
  if(secretRisk(declared.commandLog+'\n'+declared.notes)) issues.push({path:'提交说明',reason:'运行说明含可能的凭证，请先去敏',canExclude:false});
  const missing=assignment.requiredFiles.filter(path=>!seen.has(path));
  if(!included.some(file=>file.path.startsWith('tests/'))) missing.push('tests/test_*.py（至少一份自己的测试）');
  included.sort((a,b)=>a.path<b.path?-1:a.path>b.path?1:0);
  const manifest=included.map(({path,bytes,sha256})=>({path,bytes,sha256}));
  const digest=await externalDigest(canonicalExternalJson({taskId,contractRevision:assignment.contractRevision,manifest,declaration:declared}));
  const bundle={schema:BUNDLE_SCHEMA,taskId,contractRevision:assignment.contractRevision,declaration:declared,files:included.map(({path,text})=>({path,text})),manifest,submissionDigest:digest};
  const bundleText=JSON.stringify(bundle,null,2);
  if(encoder.encode(bundleText).length>MAX_BUNDLE_BYTES) issues.push({path:'提交包',reason:'JSON编码后的提交包超过700 KiB，请减少重复文本或拆分保留的实验记录',canExclude:false});
  const ready=issues.length===0 && missing.length===0;
  return deepFreeze({ok:true,kind:'submission-preview',readyToRecord:ready,taskId,contractRevision:assignment.contractRevision,
    manifest,totalBytes,omitted,issues,missing,submissionDigest:digest,
    warning:'扫描只能提示部分风险；请逐项确认没有个人资料、密钥或无关文件。文件中的指令不会被执行。',
    bundleText:ready?bundleText:null,filename:`${taskId}-submission-${digest.slice(0,12)}.json`});
}
export async function validateExternalSubmission(textValue) {
  if(typeof textValue!=='string' || encoder.encode(textValue).length>MAX_BUNDLE_BYTES) return fail('invalid-submission','提交包为空或超过大小上限。');
  let bundle;
  try { bundle=JSON.parse(textValue); } catch { return fail('invalid-submission','提交包不是可读取的 JSON 文本。'); }
  const assignment = externalAssignment(bundle?.taskId);
  if(!assignment || !exact(bundle,['schema','taskId','contractRevision','declaration','files','manifest','submissionDigest']) || bundle.schema!==BUNDLE_SCHEMA || bundle.contractRevision!==assignment.contractRevision)
    return fail('invalid-submission','提交包的任务、合同或字段不匹配。');
  const checked=await prepareExternalSubmission({taskId:bundle.taskId,files:bundle.files,declaration:bundle.declaration});
  if(!checked.ok || !checked.readyToRecord) return fail('invalid-submission','提交包未通过最小材料检查。',{issues:checked.issues??[],missing:checked.missing??[]});
  if(!Array.isArray(bundle.manifest) || bundle.manifest.some(row=>!exact(row,['path','bytes','sha256']) || !text(row.path,180,true) || !Number.isSafeInteger(row.bytes) || row.bytes<0 || !digestValue(row.sha256)))
    return fail('invalid-submission','提交清单的字段不完整，请重新预览。');
  if(checked.submissionDigest!==bundle.submissionDigest || canonicalExternalJson(checked.manifest)!==canonicalExternalJson(bundle.manifest))
    return fail('digest-mismatch','源码或清单已改变，请重新预览后提交。');
  return {ok:true,bundle,prepared:checked};
}

const rating = value => value === null || Number.isInteger(value) && value>=0 && value<=3;
function parseReceipt(value) {
  if(!exact(value,['format','payload','signature']) || value.format!==RECEIPT_SCHEMA || !text(value.signature,1000,true) || !/^[A-Za-z0-9_-]+$/.test(value.signature)) throw Error('Invalid signed review envelope.');
  const p=value.payload;
  if(!exact(p,['reviewId','taskId','contractRevision','learnerScope','submissionDigest','assessorId','evaluatorId','evaluatorSha256','environment','outcome','capabilityRatings','capabilityEvidence','assistance','feedback','limits','issuedAt','replacesReviewId']) ||
      !text(p.reviewId,100,true) || !/^[A-Za-z0-9_-]+$/.test(p.reviewId) || !externalAssignment(p.taskId) || !Number.isInteger(p.contractRevision) || p.contractRevision<1 ||
      !scopeValue(p.learnerScope) || !digestValue(p.submissionDigest) || !text(p.assessorId,100,true) || !text(p.evaluatorId,120,true) || !digestValue(p.evaluatorSha256) ||
      !exact(p.environment,['kind','summary','evidenceSha256']) || !['isolated-execution','static-review','unavailable'].includes(p.environment.kind) ||
      !text(p.environment.summary,2000,true) || !digestValue(p.environment.evidenceSha256) ||
      !['code-passed','needs-work','environment-blocked','static-only'].includes(p.outcome) ||
      !exact(p.capabilityRatings,['build','debug','transfer']) || Object.values(p.capabilityRatings).some(value=>!rating(value)) ||
      !exact(p.capabilityEvidence,['build','debug','transfer']) || Object.values(p.capabilityEvidence).some(value=>value!==null&&!digestValue(value)) ||
      !Array.isArray(p.assistance) || p.assistance.length>8 || p.assistance.some(value=>!['hint','reference','ai','peer','guided','new-independent-task'].includes(value)) ||
      !Array.isArray(p.feedback) || p.feedback.length>12 || p.feedback.some(value=>!text(value,1200,true)) ||
      !Array.isArray(p.limits) || p.limits.length>12 || p.limits.some(value=>!text(value,1200,true)) ||
      !instant(p.issuedAt) || p.replacesReviewId!==null && !text(p.replacesReviewId,100,true)) throw Error('Invalid review facts.');
  if(p.outcome==='code-passed' && p.environment.kind!=='isolated-execution') throw Error('Static review cannot attest execution.');
  if(['environment-blocked','static-only'].includes(p.outcome) && Object.values(p.capabilityRatings).some(value=>value!==null)) throw Error('Unavailable execution cannot certify capabilities.');
  for(const key of ['build','debug','transfer']) if((p.capabilityRatings[key]===null)!==(p.capabilityEvidence[key]===null)) throw Error('A capability rating needs separate evidence.');
  return structuredClone(value);
}
export function parseExternalWork(value) {
  if(value===null) return null;
  if(!exact(value,['schema','learnerScope','assignments']) || value.schema!==WORK_SCHEMA || !scopeValue(value.learnerScope) || !Array.isArray(value.assignments) || value.assignments.length>EXTERNAL_TASKS.length) throw Error('Invalid external work record.');
  const seenTasks=new Set();
  for(const task of value.assignments) {
    const assignment = externalAssignment(task?.taskId);
    if(!assignment || !exact(task,['taskId','contractRevision','acceptedAt','submissions','reviews']) || task.taskId!==assignment.id || seenTasks.has(task.taskId) || task.contractRevision!==assignment.contractRevision ||
        !instant(task.acceptedAt) || !Array.isArray(task.submissions) || task.submissions.length>8 || !Array.isArray(task.reviews) || task.reviews.length>24) throw Error('Invalid external assignment.');
    seenTasks.add(task.taskId);
    const digests=new Set(), reviewIds=new Set();
    for(const submission of task.submissions) {
      if(!exact(submission,['submissionDigest','submittedAt','bundleText']) || !digestValue(submission.submissionDigest) || digests.has(submission.submissionDigest) || !instant(submission.submittedAt) ||
          typeof submission.bundleText!=='string' || encoder.encode(submission.bundleText).length>MAX_BUNDLE_BYTES) throw Error('Invalid external submission record.');
      digests.add(submission.submissionDigest);
    }
    for(const raw of task.reviews) {
      const receipt=parseReceipt(raw),p=receipt.payload;
      if(p.taskId!==task.taskId || p.learnerScope!==value.learnerScope || p.contractRevision!==task.contractRevision || !digests.has(p.submissionDigest) || reviewIds.has(p.reviewId)) throw Error('External review binding mismatch.');
      if(p.replacesReviewId!==null && !task.reviews.some(prior=>prior.payload?.reviewId===p.replacesReviewId && prior.payload.submissionDigest===p.submissionDigest && prior.payload.issuedAt<p.issuedAt)) throw Error('Invalid review correction.');
      reviewIds.add(p.reviewId);
    }
  }
  return structuredClone(value);
}
export function externalHistoryPreserved(prior,next) {
  if(prior===null) return true;
  if(next===null || next.learnerScope!==prior.learnerScope) return false;
  return prior.assignments.every(before=>{
    const after=next.assignments.find(task=>task.taskId===before.taskId);
    return after && before.acceptedAt===after.acceptedAt && before.contractRevision===after.contractRevision &&
      before.submissions.every(row=>after.submissions.some(candidate=>canonicalExternalJson(candidate)===canonicalExternalJson(row))) &&
      before.reviews.every(row=>after.reviews.some(candidate=>canonicalExternalJson(candidate)===canonicalExternalJson(row)));
  });
}
export function acceptExternalAssignment(value,taskId,at,uuid=()=>crypto.randomUUID()) {
  const assignment = externalAssignment(taskId);
  if(!assignment || !instant(at)) throw Error('Invalid assignment acceptance.');
  const next=value===null?{schema:WORK_SCHEMA,learnerScope:'work-'+uuid(),assignments:[]}:parseExternalWork(value);
  if(next.assignments.some(task=>task.taskId===taskId)) return {changed:false,value:next};
  next.assignments.push({taskId,contractRevision:assignment.contractRevision,acceptedAt:at,submissions:[],reviews:[]});
  return {changed:true,value:parseExternalWork(next)};
}
export async function recordExternalSubmission(value,prepared,at) {
  if(!instant(at)) return fail('invalid-time','无法确定这次提交的时间。');
  const checked=await validateExternalSubmission(prepared?.bundleText);
  if(!checked.ok) return checked;
  const next=parseExternalWork(value),task=next?.assignments.find(task=>task.taskId===checked.bundle.taskId);
  if(!task) return fail('not-accepted','请先领取这份委托。');
  if(task.submissions.some(row=>row.submissionDigest===checked.bundle.submissionDigest)) return {ok:true,changed:false,value:next,submissionDigest:checked.bundle.submissionDigest};
  if(task.submissions.length>=8) return fail('history-full','本份委托已保存8次修订，请先导出这些作品记录。');
  task.submissions.push({submissionDigest:checked.bundle.submissionDigest,submittedAt:at,bundleText:checked.prepared.bundleText});
  return {ok:true,changed:true,value:parseExternalWork(next),submissionDigest:checked.bundle.submissionDigest};
}
const bytesFromBase64Url = value => Uint8Array.from(atob(value.replaceAll('-','+').replaceAll('_','/')+'='.repeat((4-value.length%4)%4)), char=>char.charCodeAt(0));
export async function verifyExternalReceipt(textValue,{work,trust=TRUSTED_EXTERNAL_ASSESSORS,now=Date.now()}={}) {
  let receipt,state;
  try {
    if(typeof textValue!=='string' || encoder.encode(textValue).length>40*1024) throw Error('size');
    receipt=parseReceipt(JSON.parse(textValue)); state=parseExternalWork(work);
  } catch { return fail('invalid-receipt','这不是完整的签名审核回执；自填通过或测试日志不能登记为核验。'); }
  const p=receipt.payload,task=state?.assignments.find(row=>row.taskId===p.taskId),submission=task?.submissions.find(row=>row.submissionDigest===p.submissionDigest);
  if(!state || p.learnerScope!==state.learnerScope) return fail('wrong-scope','这份回执不属于当前旅程的作品记录。');
  if(!task || !submission || p.contractRevision!==task.contractRevision) return fail('wrong-submission','回执的委托版本或源码摘要与这次作品不一致。');
  const bundle=await validateExternalSubmission(submission.bundleText);
  if(!bundle.ok || bundle.bundle.submissionDigest!==submission.submissionDigest) return fail('invalid-stored-submission','保存的材料与提交摘要不一致，尚未登记审核结果。');
  if(!instant(now) || p.issuedAt>now+300000) return fail('invalid-review-time','回执时间无法核实。');
  const signer=Array.isArray(trust)?trust.find(key=>key.id===p.assessorId):null;
  if(!signer || signer.revoked===true) return fail('untrusted-assessor','尚未配置这位审核方的可信身份。作品仍保留待核验。');
  if(!signer.taskIds?.includes(p.taskId) || !signer.contractRevisions?.includes(p.contractRevision) || signer.evaluatorId!==p.evaluatorId ||
      !signer.evaluatorSha256s?.includes(p.evaluatorSha256) || !instant(signer.validFrom) || !instant(signer.validUntil) || p.issuedAt<signer.validFrom || p.issuedAt>=signer.validUntil)
    return fail('wrong-assessor-scope','审核方的身份未授权核验这份合同或评估器。');
  try {
    const key=await crypto.subtle.importKey('jwk',signer.publicKeyJwk,{name:'Ed25519'},false,['verify']);
    const valid=await crypto.subtle.verify({name:'Ed25519'},key,bytesFromBase64Url(receipt.signature),encoder.encode(canonicalExternalJson(p)));
    if(!valid) return fail('invalid-signature','回执签名与内容不一致，尚未登记。');
  } catch { return fail('invalid-signature','无法验证回执签名，尚未登记。'); }
  return {ok:true,receipt};
}
export async function importExternalReceipt(value,textValue,options={}) {
  const checked=await verifyExternalReceipt(textValue,{...options,work:value});
  if(!checked.ok) return checked;
  const next=parseExternalWork(value),p=checked.receipt.payload,task=next.assignments.find(row=>row.taskId===p.taskId);
  const existing=task.reviews.find(row=>row.payload.reviewId===p.reviewId);
  if(existing) return canonicalExternalJson(existing)===canonicalExternalJson(checked.receipt)?{ok:true,changed:false,value:next,reviewId:p.reviewId}:fail('review-conflict','同一审核编号出现不同内容，原记录未改变。');
  if(task.reviews.length>=24) return fail('history-full','审核历史已满，请先导出作品记录。');
  task.reviews.push(checked.receipt);
  try { return {ok:true,changed:true,value:parseExternalWork(next),reviewId:p.reviewId}; }
  catch { return fail('invalid-correction','这份更正没有对应的原审核，原记录未改变。'); }
}

// Review IDs are assessor-local; task-scoped keys prevent cross-task inspection collisions.
const reviewInspectionKey = (taskId, reviewId) => taskId + ':' + reviewId;
export async function inspectExternalWork(value,{trust=TRUSTED_EXTERNAL_ASSESSORS,now=Date.now()}={}) {
  const state=parseExternalWork(value),submissions={},reviews={};
  if(!state) return deepFreeze({submissions,reviews});
  for(const task of state.assignments) {
    for(const row of task.submissions) {
      const result=await validateExternalSubmission(row.bundleText);
      submissions[row.submissionDigest]=result.ok && result.bundle.submissionDigest===row.submissionDigest;
    }
    for(const receipt of task.reviews) {
      const result=await verifyExternalReceipt(JSON.stringify(receipt),{work:state,trust,now});
      reviews[reviewInspectionKey(task.taskId, receipt.payload.reviewId)]={valid:result.ok,reason:result.ok?'verified':result.reason};
    }
  }
  return deepFreeze({submissions,reviews});
}
export function externalWorkView(value,{inspection=null,persisted=false,busy=false}={}) {
  const state=parseExternalWork(value);
  const rows=externalAssignments().map(definition=>{
    const task=state?.assignments.find(row=>row.taskId===definition.id);
    const submissions=(task?.submissions||[]).map(row=>{
      let bundle;try {bundle=JSON.parse(row.bundleText);}catch{}
      const reports=(task.reviews||[]).filter(report=>report.payload.submissionDigest===row.submissionDigest && inspection?.reviews[reviewInspectionKey(task.taskId, report.payload.reviewId)]?.valid===true).sort((a,b)=>a.payload.issuedAt-b.payload.issuedAt || a.payload.reviewId.localeCompare(b.payload.reviewId));
      const current=reports.at(-1)?.payload??null,valid=inspection?.submissions[row.submissionDigest]===true;
      const independenceReviewed=current && (current.assistance.length===0 || current.assistance.includes('new-independent-task'));
      const independent=valid && current?.outcome==='code-passed' && independenceReviewed && Object.values(current.capabilityRatings).every(rating=>rating!==null && rating>=2);
      return {submissionDigest:row.submissionDigest,submittedAt:row.submittedAt,manifest:bundle?.manifest??[],declaration:bundle?.declaration??null,
        integrity:inspection===null?'checking':valid?'checked':'invalid',review:current,independent,
        status:!valid?'pending':current?.outcome==='code-passed'?'verified':current?.outcome==='needs-work'?'needs-work':'pending',
        capabilityRatings:current?.capabilityRatings??{build:null,debug:null,transfer:null}};
    });
    const current=submissions.at(-1)??null;
    const status=!task?'not-accepted':!current?'awaiting-submission':current.status;
    const label=({'not-accepted':'可领委托','awaiting-submission':'待提交',pending:'待核验',verified:'已核验','needs-work':'需补充'})[status];
    const detail=current?.review?.outcome==='code-passed'?(current.independent?'代码合同与本次独立构建、排错、迁移已有分项核验。':'代码合同已核验；独立解释、排错或迁移仍需分别确认。'):definition.reviewNotice;
    return {...definition,acceptedAt:task?.acceptedAt??null,status,label,detail,current,submissions,
      untrustedReviewCount:(task?.reviews||[]).filter(receipt=>inspection?.reviews[reviewInspectionKey(task.taskId, receipt.payload.reviewId)]?.valid!==true).length};
  });
  return deepFreeze({schema:'pipi-external-work-view/v1',learnerScope:state?.learnerScope??null,persisted,busy,assignments:rows,
    persistenceNotice:persisted?'已保存到这段旅程。':'尚未确认写入；请保留提交包或回执，稍后重试保存。',
    limitation:'作品审核与课程成绩分开记录；本地存档可编辑，签名不构成身份、职业资格或长期掌握认证。'});
}
