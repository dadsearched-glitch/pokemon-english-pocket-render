import asyncio, json, pathlib, hashlib
import edge_tts
root=pathlib.Path(__file__).parent
out=root/'web'/'audio';out.mkdir(exist_ok=True)
def key(text):
    h=0
    for c in text:h=((h*31)+ord(c))&0xffffffff
    return format(h,'x')
async def main():
    texts=json.loads((root/'audio-texts.json').read_text(encoding='utf-8'));sem=asyncio.Semaphore(5)
    async def one(text):
        dest=out/(key(text)+'.mp3')
        if dest.exists() and dest.stat().st_size>1000:return
        async with sem:
            for attempt in range(3):
                try:
                    await edge_tts.Communicate(text,'en-NZ-MollyNeural',rate='-5%').save(str(dest));return
                except Exception:
                    if attempt==2:raise
                    await asyncio.sleep(2)
    await asyncio.gather(*(one(t) for t in texts))
    manifest={t:'audio/'+key(t)+'.mp3' for t in texts}
    (root/'web'/'audio-manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf-8')
    print(f'Generated and verified {len(texts)} NZ English audio files.')
asyncio.run(main())
