// Transcript matching is a sentence check, never an acoustic/phoneme score.
export function normaliseSpeech(value){return String(value).normalize('NFKC').toLowerCase().replace(/[’‘]/g,"'").replace(/\b(can't)\b/g,'cannot').replace(/\b(won't)\b/g,'will not').replace(/\b(i'm)\b/g,'i am').replace(/\b(it's)\b/g,'it is').replace(/\b(let's)\b/g,'let us').replace(/\b([a-z]+)'ll\b/g,'$1 will').replace(/\b([a-z]+)'re\b/g,'$1 are').replace(/\b([a-z]+)n't\b/g,'$1 not').replace(/\bcolor(s)?\b/g,'colour$1').replace(/\borganize\b/g,'organise').replace(/\bpractice\b/g,'practise').replace(/[^\p{L}\p{N}\s]/gu,' ').replace(/\s+/g,' ').trim();}
export function checkSpokenSentence(expected,transcripts){const target=normaliseSpeech(expected);const options=transcripts.map(t=>({text:t,normal:normaliseSpeech(t)}));const exact=options.find(t=>t.normal===target);if(exact)return {matched:true,heard:exact.text};const best=options[0]?.text||'';return {matched:false,heard:best};}
// Injectable recognition constructor keeps lifecycle checks independent of a real microphone.
export function startSentenceRecognition({Recognition,expected,onStatus,onMatch,onEnd}){const r=new Recognition();let active=true,accepted=false,timer;
 r.lang='en-NZ';r.continuous=false;r.interimResults=false;r.maxAlternatives=3;
 const stop=()=>{if(!active)return;active=false;clearTimeout(timer);r.onresult=null;r.onerror=null;r.onend=null;try{r.abort();}catch{}};
 r.onresult=e=>{if(!active||accepted)return;const result=e.results[e.resultIndex??0];if(!result?.isFinal)return;const checked=checkSpokenSentence(expected,Array.from(result,x=>x.transcript));if(checked.matched){accepted=true;stop();onMatch(checked.heard);}else onStatus('mismatch',checked.heard);};
 r.onerror=e=>{if(active)onStatus(e.error||'error','');};r.onend=()=>{if(!active)return;active=false;clearTimeout(timer);onEnd();};
 try{r.start();if(active)timer=setTimeout(()=>{stop();onStatus('timeout','');onEnd();},20000);}catch{stop();onStatus('unavailable','');onEnd();}
 return {stop};}
