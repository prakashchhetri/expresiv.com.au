import test from 'node:test';
import assert from 'node:assert/strict';
import {validateEnquiry,escapeHtml,sendEnquiry} from '../src/lib/enquiry.mjs';
const makeForm = (changes={}) => {
 const f = new FormData();
 for (const [key,value] of Object.entries({name:' Test Person ',email:' test@example.com ',message:' A project idea ',...changes})) f.set(key,value);
 return f;
};
test('valid enquiries are trimmed',()=>assert.deepEqual(validateEnquiry(makeForm()),{name:'Test Person',email:'test@example.com',message:'A project idea'}));
test('blank and malformed inputs are rejected',()=>{
 for (const invalid of [{name:'  '},{message:''},{email:'not-an-email'},{email:'x\ny@example.com'},{name:'a\nb'},{name:'x'.repeat(121)},{email:'x'.repeat(255)},{message:'x'.repeat(10001)}]) assert.throws(()=>validateEnquiry(makeForm(invalid)));
});
test('file values are rejected',()=>{const f=makeForm();f.set('name',new Blob(['name']),'name.txt');assert.throws(()=>validateEnquiry(f));});
test('HTML content remains text inside emails',()=>assert.equal(escapeHtml(`<img src="x" onerror='alert(1)'>&`),'&lt;img src=&quot;x&quot; onerror=&#39;alert(1)&#39;&gt;&amp;'));
test('successful response returns message and sends URL-encoded fields',async()=>{
 const body = new URLSearchParams({name:'Test Person',email:'test@example.com',message:'A & B'});
 const result=await sendEnquiry(body,async(url,options)=>{assert.equal(url,'/api/contact');assert.equal(options.method,'POST');assert.equal(options.body.get('message'),'A & B');assert(options.signal);return Response.json({success:true,message:'Received.'});});
 assert.equal(result,'Received.');
});
test('error statuses cannot be mistaken for success',async()=>{
 await assert.rejects(sendEnquiry(new URLSearchParams(),async()=>Response.json({success:true},{status:500})));
 await assert.rejects(sendEnquiry(new URLSearchParams(),async()=>Response.json({success:false})));
 await assert.rejects(sendEnquiry(new URLSearchParams(),async()=>Response.json({success:'true'})));
});
test('network failures and invalid JSON surface as errors',async()=>{
 await assert.rejects(sendEnquiry(new URLSearchParams(),async()=>{throw new Error('offline');}));
 await assert.rejects(sendEnquiry(new URLSearchParams(),async()=>new Response('<html>Error</html>')));
});
test('missing success message gets a safe fallback',async()=>assert.equal(await sendEnquiry(new URLSearchParams(),async()=>Response.json({success:true})),'Thank you. Your enquiry has been sent.'));
