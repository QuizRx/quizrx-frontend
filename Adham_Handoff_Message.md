# Calcium/Bone Quiz — Frontend Integration

This is a **new quiz type** for Calcium/Bone (Ramy's content). It's **live on prod now** (backend + cognitive deployed and verified). It's frontend-only on your side, through our normal GraphQL endpoint + existing Firebase auth — no direct cognitive calls, no CORS work.

**GraphQL endpoint:** `https://quizrx-platform-backend-356295304767.us-central1.run.app/graphql`
(the same one you already use — these are just two new operations on it)
**Auth:** existing `Authorization: Bearer <token>`

## Flow

User picks a Calcium/Bone topic from a dropdown → fetch a question → render the MCQ → on answer, grade + show explanation → send feedback. Questions are pre-authored/deterministic (no LLM), so the fetch is fast.

## Dropdown options

| chainId | label |
|---|---|
| CAL-BONE-01 | Calcium & Bone Physiology |
| CAL-BONE-02 | Rickets & Osteomalacia |
| CAL-BONE-03 | Osteoporosis |
| CAL-BONE-04 | Paget's Disease of Bone |
| CAL-BONE-05 | Osteogenesis Imperfecta |
| CAL-HYP-01 | Hypercalcaemia (selected causes) |
| CAL-HYPO-01 | Hypocalcaemia |
| CAL-MG-01 | Hypomagnesaemia |
| CAL-PTH-01 | Primary Hyperparathyroidism |

## 1. Fetch a question

```graphql
query GetExtractionQuestion($chainId: String!, $dpId: String) {
  getExtractionQuestion(chainId: $chainId, dpId: $dpId) {
    data
    statusCode
    message
    error
  }
}
```

- `dpId` is optional — omit for a random question, pass to re-fetch a specific one.
- `data` is JSON. Use:
  - `data.question.question` — stem
  - `data.question.choices` — string[], render in order (3–5 options)
  - `data.question.answer` — correct option text (for grading)
  - `data.question.dp_id` — question id (needed for feedback)
  - `data.question.option_trap_ids` — 1:1 with `choices`; correct option is `null`
  - `data.part2_data.explanation` — teaching text to show after answering
  - `data.concept_target` — chain id

## 2. Submit feedback (one call per attempt)

```graphql
mutation SubmitQuestionFeedback($input: QuestionFeedbackInput!) {
  submitQuestionFeedback(input: $input) {
    feedbackId
    statusCode
    message
    error
  }
}
```

Map a finished attempt (`i` = index of the option the user picked):

```js
{
  chainId: data.concept_target,
  dpId: data.question.dp_id,
  isCorrect: choices[i] === data.question.answer,
  shownTrapIds: data.question.option_trap_ids.filter(Boolean),
  selectedTrapId: data.question.option_trap_ids[i],   // null if correct pick
  selectedOptionLabel: ["A","B","C","D","E"][i],
  selectedOptionText: choices[i],
  rating: "up" | "down" | null,   // optional thumbs
  freeText: "...",                 // optional
  sessionId: "<session>"           // optional
}
```

> `userId` is added server-side from the token 

## Notes

- Calcium/Bone only for now; everything else is unchanged, so nothing you've built breaks.
- Full reference doc: `Guide/QuizRx_Extraction_Quiz_API.md`.

