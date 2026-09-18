"""Generate missing fixed NZ recordings; reruns reuse successful files."""
import asyncio, json, pathlib
import edge_tts
root=pathlib.Path(__file__).parent
voices={'molly':'en-NZ-MollyNeural'}
def key(text):
    h=0
    for c in text:h=((h*31)+ord(c))&0xffffffff
    return format(h,'x')
async def main():
    texts=json.loads((root/'audio-texts.json').read_text(encoding='utf-8'))
    old=json.loads((root/'web'/'audio-manifest.json').read_text(encoding='utf-8'))
    texts=list(dict.fromkeys(texts+list(old)))
    sem=asyncio.Semaphore(5); completed=0; total=len(texts)*len(voices)
    async def one(text,voice,name):
        nonlocal completed
        folder=root/'web'/'audio' if name=='molly' else root/'web'/'audio'/name
        folder.mkdir(exist_ok=True,parents=True);dest=folder/(key(text)+'.mp3')
        if dest.exists() and dest.stat().st_size>1000:
            completed+=1;return
        async with sem:
            for attempt in range(4):
                try:
                    temp=dest.with_suffix('.tmp')
                    await edge_tts.Communicate(text,voice,rate='-5%').save(str(temp))
                    if temp.stat().st_size<1000:raise RuntimeError('Empty audio')
                    temp.replace(dest);break
                except Exception:
                    if attempt==3:raise
                    await asyncio.sleep(2*(attempt+1))
            completed+=1
            if completed%50==0:print(f'Audio {completed}/{total}',flush=True)
    await asyncio.gather(*(one(t,v,n) for n,v in voices.items() for t in texts))
    manifest={t:'audio/'+key(t)+'.mp3' for t in texts}
    (root/'web'/'audio-manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf-8')
    print(f'Complete: {len(texts)} prompts in each of {len(voices)} NZ voices.',flush=True)
asyncio.run(main())
