import json,re,copy
from pathlib import Path
root=Path(__file__).parent
core=json.loads((root/'Y1_Y6_CORE_WORDS.json').read_text(encoding='utf-8-sig'))['years']
base=json.loads((root/'baseline-courses.json').read_text(encoding='utf-8'))
courses=copy.deepcopy(base)
for y in ['1','2','6']:
 units=[]
 lines=(root/f'year{y}-authoring.txt').read_text(encoding='utf-8-sig').strip().splitlines()
 assert len(lines)==24,(y,len(lines))
 for i,line in enumerate(lines):
  parts=line.split('~');assert len(parts)==7,(y,i,len(parts))
  definitions=parts[0].split(';');assert len(definitions)==4
  words=[[w,*d.split('|')] for w,d in zip(core[y][i]['core_words'],definitions)]
  assert all(len(w)==3 for w in words)
  units.append(dict(year=int(y),unit=i+1,name=core[y][i]['topic'],place=base['3'][i]['place'],focus={'1':'Find who, what and where. Listen and repeat a short sentence.','2':'Follow the order and explain a simple reason.','6':'Compare ideas and support an answer with evidence from the text.'}[y],words=words,s=parts[1:3],story=parts[3],r=[parts[4].split('|'),parts[5].split('|')],l=parts[6].split('|'),exposure=[]))
 courses[y]=units
# Preserve Y3 core identities and improve only a short early text.
courses['3'][0]['story']+=' Hana knows that she can trust him with her things.'
# Y5: use the requested smoother academic ramp and retain supported reading questions.
replacements={
'precaution':['warning','경고','a message about a possible danger'],
'significance':['importance','중요성','how much something matters'],
'assumption':['theory','이론이나 설명','an idea used to explain something'],
'contradict':['question','의문을 제기하다','ask whether an idea is right'],
'counterargument':['viewpoint','관점','the way someone sees an issue'],
'transferable':['apply','적용하다','use what you know in a situation']}
for u in courses['5']:
 for i,w in enumerate(u['words']):
  if w[0] in replacements:u['words'][i]=replacements[w[0]]
u=courses['5'][3]
u['s']=['The warning says that strong winds are likely tomorrow.','Checking the conditions helps us prepare for a change.']
u['story']=u['story'].replace('Tony suggests preparing an indoor space as a precaution.','After reading the warning, Tony suggests preparing an indoor space.')
u['r'][0][0]='How does the group prepare for possible rain?'
u['l']=['The warning says strong winds may happen tomorrow.','The speaker guarantees that tomorrow will be calm.','The speaker says the wind has already stopped.']
u=courses['5'][15]
u['story']=u['story'].replace('significance','importance')
u['s'][0]='Could you explain the importance of this family custom?'
u['r'][0][1]='The importance of each custom'
u=courses['5'][20]
u['story']="A classroom plant droops. Tony's first theory is that it needs more water. Before adding any, he checks the soil with the teacher. It is already very wet. This evidence makes him question his first explanation. They investigate drainage and light next. They do not conclude that either is the cause yet. A useful theory helps them decide what to check, but it is not the same as a fact."
u['s']=['We should investigate before accepting our theory as a fact.','New evidence can make us question our first explanation.']
u['r'][0][0]='What makes Tony question his first theory?'
u['l']=['The speaker wants to check an explanation before accepting it.','The speaker says every first idea must be right.','The speaker wants to ignore all the clues.']
u=courses['5'][22];u['story']=u['story'].replace('acknowledges this counterargument','considers this different viewpoint')
u['s'][1]='Considering another viewpoint can help us explain our proposal.'
u=courses['5'][23];u['s'][1]='I can apply these skills in a real discussion.'
# Clarifying context supports early Y5 without unnecessary hard vocabulary.
additions={0:'They check the chart together, so both can explain the results to visitors.',1:'A small change to the rules has made room for someone new.',2:'Students can explain their preferences while respecting what other people need to eat.',4:'Their destination stays the same, even though they choose a different way to reach it.',5:'They can explain their purchase by showing the prices and what the project needs.',7:'Everyone knows which task to do next, so less time is spent waiting for tools.',10:'They leave the animals in the places where they found them.',11:'They tell the person meeting them about the new arrival time.',13:'The group thanks the visitor for pointing out something they had not noticed themselves.',14:'Their notes help them decide what to do differently next time.',15:'Tony listens without assuming that his own family does things in the only right way.',16:'He asks for consent before including a classmate in a photo of the notice.',17:'A loss of shelter can be a threat even when the birds are not touched.',18:'Keeping useful resources in good condition is part of making the proposal work.'}
for i,extra in additions.items():courses['5'][i]['story']+=' '+extra
# Avoid a vague "final sentence" reference after a context addition.
courses['5'][2]['r'][1][0]='What does the shared-lunch plan suggest?'
courses['5'][19]['r'][1][0]='What does the text suggest about achievement?'
# Shorten later bridge stories without removing the evidence used by questions.
bridge=[
"Tony gets an online message offering free items for his password. The sender uses a familiar picture, but Tony does not know who sent it. To stay safe, he does not reply or open the link. He shows an adult he can trust. They report the message together. A familiar picture is not proof that a request is safe.",
"The class visits a forest with a guide. They hear birds and insects. Each creature needs this environment to survive. A fallen log looks untidy, but it shelters insects and helps the soil as it breaks down. Tony learns that a healthy forest does not have to look neat. The class stays on the path and leaves the log alone.",
"The class collects information about lunch waste for three days. Food scraps can go into compost, but plastic wrappers cannot. Tony suggests signs showing what belongs in each bin. Another group suggests reusable containers to save materials. They try both ideas for a week and check the bins again. The results will show whether their changes helped reduce waste.",
"Tony practises passing in netball. The coach begins with a warm-up and explains the routine. Tony passes quickly but often misses. The coach suggests slowing down and checking his hand position. After several sessions, his skill improves. Tony learns that useful effort means practising carefully rather than rushing. He records one small improvement after each session to see his progress.",
"Groups roll a toy car down a ramp. A pattern appears: it goes further on smooth flooring. One unusual result is very short. Tony suggests a possibility: the car touched the ramp's edge. They check their notes and repeat the run. The new result fits the pattern. They keep the original result and explain why they checked it.",
"Tony writes about two friends whose kite gets stuck in a tree. His first story jumps from the problem to the ending. His partner cannot follow it. Tony adds a paragraph about their plan and dialogue showing their ideas. He connects each event clearly. Now his partner understands how the friends solve the problem. The missing link makes the story clearer.",
"Tony suggests a quiet reading corner. To support his point, he gives an example: yesterday a classmate moved three times to find quiet. Another student worries about space for building activities. Tony listens and suggests testing a small corner for one week. He hopes to convince others with reasons and a fair trial. The class can check whether his idea works.",
"Tony compares early writing with recent work. His progress in connecting ideas is now a strength. He still needs to check punctuation, so his target is to reread a paragraph aloud before handing work in. Kai chooses a different target. Both use evidence from their work to plan for the future. Their next steps do not need to be identical."
]
for i,story in enumerate(bridge,16):courses['4'][i]['story']=story
courses['4'][9]['s'][1]='We measure growth and check how much sunlight arrives.'
courses['4'][15]['s'][1]='We ask before joining an unfamiliar ceremony.'
courses['4'][22]['s'][1]='My reasons may convince others to consider this idea.'
courses['5'][6]['s'][0]='We can disagree and still remain respectful to others.'
courses['5'][12]['s'][1]='Someone I trust can help me choose a strategy.'
# Full authoring metadata and exact authoritative map checks.
changes={}
for y in map(str,range(1,7)):
 changes[y]=[]
 for i,u in enumerate(courses[y]):
  u['unit']=i+1
  assert [w[0] for w in u['words']]==core[y][i]['core_words'],(y,i)
  u['vocabularyLanguage']='ko' if int(y)<=3 or (y=='4' and i<8) else 'en'
  u['curriculumRevision']='y1-y6-20260916'
  if y not in base or any(u[k]!=base[y][i][k] for k in ['words','s','story','r','l']):changes[y].append(i)
(root/'web/course-content.js').write_text("// Supplementary English practice, not the whole NZ curriculum. Generated by build_learning_data.py.\nexport const COURSE_VERSION='nz-life-1'; // Retained for legacy save compatibility.\nexport const DATA_REVISION='y1-y6-20260916';\nexport const CHANGED_UNITS="+json.dumps(changes)+";\nexport const COURSES="+json.dumps(courses,ensure_ascii=False,indent=2)+";\nCOURSES.Kai=COURSES[3];COURSES.Tony=COURSES[5];\n",encoding='utf-8')
(root/'learning-data.json').write_text(json.dumps(courses,ensure_ascii=False,indent=2),encoding='utf-8')
print('Generated 144 units; changed units:',changes)
for y,us in sorted(courses.items()):
 lengths=[len(u['story'].split()) for u in us]
 print('Year',y,'story range',min(lengths),max(lengths),'target lengths',min(len(t.split()) for u in us for t in u['s']),max(len(t.split()) for u in us for t in u['s']))
