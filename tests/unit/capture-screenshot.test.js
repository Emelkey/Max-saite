const test=require('node:test');
const assert=require('node:assert/strict');
const {captureScreenshot}=require('../helpers/capture-screenshot');
const transient=new Error('Protocol error (Page.captureScreenshot): Unable to capture screenshot');
test('capture retries a transient compositor error exactly once',async()=>{
  let calls=0,frames=0;const result=Buffer.from('png');
  const page={screenshot:async()=>{if(++calls===1)throw transient;return result;},evaluate:async()=>{frames++;}};
  assert.equal(await captureScreenshot(page),result);assert.equal(calls,2);assert.equal(frames,1);
});
test('capture does not mask persistent or unrelated failures',async()=>{
  let calls=0;await assert.rejects(captureScreenshot({screenshot:async()=>{calls++;throw transient;},evaluate:async()=>{}}),/Unable to capture/);assert.equal(calls,2);
  calls=0;await assert.rejects(captureScreenshot({screenshot:async()=>{calls++;throw Error('page closed');}}),/page closed/);assert.equal(calls,1);
});
