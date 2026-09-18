// Persist help exposure even when the learner closes the hint or reloads.
export function markHintSeen(state, question) {
 if (!question?.word || !question.hint) return false;
 state.hintSeen = true;
 return true;
}
export function usedHelp(state, question) {
 return Boolean(question?.word && (state.attempts > 0 || state.hintSeen || question.hintOpen));
}
