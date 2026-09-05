/** @typedef {{name: string, email: string, message: string}} Enquiry */
/** @param {FormData} form @returns {Enquiry} */
export function validateEnquiry(form) {
 const values = /** @type {Enquiry} */ (Object.fromEntries(['name','email','message'].map(key => {
  const value = form.get(key);
  if (typeof value !== 'string') throw new Error('Please complete all fields.');
  return [key,value.trim()];
 })));
 if (!values.name || !values.email || !values.message) throw new Error('Please complete all fields.');
 if (values.name.length > 120 || values.email.length > 254 || values.message.length > 10000) throw new Error('One or more fields are too long.');
 if (/[\r\n]/.test(values.name) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) throw new Error('Please check your name and email address.');
 return values;
}
/** @param {string} value */
export function escapeHtml(value) {
 return value.replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
}
/** @param {URLSearchParams} body @param {typeof fetch} fetcher */
export async function sendEnquiry(body, fetcher = fetch) {
 const response = await fetcher('/api/contact', {method:'POST',body,signal:AbortSignal.timeout(20000)});
 const result = await response.json();
 if (!response.ok || result.success !== true) throw new Error('Could not send enquiry');
 return typeof result.message === 'string' && result.message.trim() ? result.message : 'Thank you. Your enquiry has been sent.';
}
