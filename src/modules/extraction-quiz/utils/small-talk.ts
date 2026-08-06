// Conversation classifier for the QuizRx beta chat surface.
//
// Every typed message is classified into one of the approved beta categories
// (spec H-02 / frontend interim implementation) BEFORE it can trigger question
// generation:
//
//   • Small talk        → warm, brief reply that guides toward a learning action
//   • Outside QuizRx     → medical-but-outside-module OR non-medical redirect
//   • QuizRx action      → falls through to the learning pipeline (question fetch)
//
// User-facing strings that appear in the approved response library (Appendix A)
// are reproduced here EXACTLY and must not be altered.

export type SmallTalkKind =
  | "greeting"
  | "thanks"
  | "farewell"
  | "capability"
  | "wellbeing"
  | "identity"
  | "praise"
  | "acknowledgement"
  | "chitchat";

export type ScopeKind = "medical-outside" | "non-medical";

// --- Approved exact copy (Appendix A) --------------------------------------
export const APPROVED_RESPONSES = {
  greetingNoTopic:
    "Hello! Welcome to QuizRx. Ready to begin? Choose a topic if you would like, ask for a clinical question, or tell me what you would like to learn today.",
  greetingTopic: (topic: string) =>
    `Hello! You're currently exploring ${topic}. Ask for a question, request an explanation, or start with one of the suggested prompts.`,
  thanksTopic: (topic: string) =>
    `You're welcome. When you're ready, I can generate another question, explain a concept, or continue with ${topic}.`,
  thanksNoTopic:
    "You're welcome. When you're ready, I can generate another question or explain a concept.",
  capability:
    "I can generate clinical questions, quiz you on a selected topic, explain concepts, and review a question with you. Choose a topic if you would like to focus the session, or simply type your request.",
  howAreYou:
    "I'm ready to help you learn. Choose a topic, ask for a clinical question, or tell me what you would like to review.",
  medicalOutside:
    "QuizRx is currently focused on the Calcium & Bone beta module. I can help you with topics from this module, generate clinical questions, explain concepts, or quiz you on them.",
  nonMedical:
    "I'm here to help you learn medicine through QuizRx. Let's get back to the Calcium & Bone module. Choose a topic or ask me a question whenever you're ready.",
  comparisonRedirect:
    "That's a useful distinction to practice. For this beta, I can teach it through a comparison-style clinical question.",
  generationFailure:
    "Sorry, I couldn't generate a question just now. Please try again.",
} as const;

// --- exact-match sets ------------------------------------------------------
const GREETINGS = new Set([
  "hi", "hii", "hiii", "hiya", "hey", "heyy", "heya", "hello", "helo",
  "hello there", "hi there", "hey there", "hi again", "hello again",
  "yo", "sup", "whats up", "wassup", "howdy", "greetings", "hola",
  "good morning", "good afternoon", "good evening", "good day",
  "morning", "afternoon", "evening",
]);

const THANKS = new Set([
  "thanks", "thank you", "thankyou", "thank u", "ty", "thx", "cheers",
  "thanks a lot", "thanks so much", "thank you so much", "thanks mate",
  "thanks buddy", "appreciate it", "much appreciated", "appreciated",
]);

const FAREWELLS = new Set([
  "bye", "byebye", "goodbye", "good bye", "see you", "see ya", "see u",
  "cya", "later", "see you later", "see you soon", "good night", "goodnight",
  "gtg", "got to go", "peace", "im done", "thats all", "that is all",
  "im out", "im leaving",
]);

const CAPABILITIES = new Set([
  "help", "what can you do", "what can you help me with", "what can you help with",
  "what do you do", "what do you offer", "what topics", "what subjects",
  "what can i ask", "what should i ask", "what now", "what next",
  "what is this", "what is quizrx", "how do i start", "how to use this",
]);

const ACKNOWLEDGEMENTS = new Set([
  "ok", "okay", "k", "kk", "okey", "okey dokey", "cool", "alright", "alrighty",
  "got it", "gotcha", "understood", "i see", "makes sense", "sure", "fine",
  "fair enough", "noted", "right", "yep", "yeah", "yup", "roger", "aight",
]);

// --- pattern-matched categories -------------------------------------------
const GREETING_PATTERNS: readonly RegExp[] = [
  /^(hi+|hii+|hiya+|hey+|heyy+|heya+|hello+|helo+|yo+)$/,
  /^(good )?(morning|afternoon|evening|day)$/,
  /^(hi|hii|hey|heyy|hello|yo|howdy|greetings|hiya)( there| again| quizrx| quiz rx| buddy| friend| all| everyone| team)$/,
];

const THANKS_PATTERNS: readonly RegExp[] = [
  /^(ok|okay|cool|great|perfect|nice|awesome|brilliant|lovely|alright)?\s*(thanks|thank you|thank u|thankyou|thx|ty)\b/,
];

const FAREWELL_PATTERNS: readonly RegExp[] = [
  /^(bye+|goodbye|good bye)\b/,
  /^see (you|ya|u)( later| soon| around)?$/,
  /^(im|i am) (done|leaving|out|off)\b/,
  /^(thats|that is|that s) all\b/,
];

const CAPABILITY_PATTERNS: readonly RegExp[] = [
  /^what (can|do) you\b/,
  /^what (topics|subjects) (are|can i|do you)\b/,
  /^what (can|should) i (ask|study|do|start|begin|pick|choose)\b/,
  /^how (do i|to) (start|use|begin)\b/,
  /^how do you work\b/,
  /^how does (this|it) work\b/,
];

const IDENTITY_PATTERNS: readonly RegExp[] = [
  /\b(are|r) ?you (an? )?(ai|a i|bot|robot|human|real|person|chatgpt|gpt|machine|sentient|conscious|alive|a doctor|doctor)\b/,
  /^(who|what) (are|r) you\b/,
  /\bwhat(s| is)? your name\b/,
  /\bwho (made|created|built|trained|designed) you\b/,
  /\b(which|what) (ai |language )?model (are you|do you use)\b/,
  /\bare you (there|listening|human|real)\b/,
];

const WELLBEING_PATTERNS: readonly RegExp[] = [
  /^how (are|r|is|s) ?(you|u|it going|things|everything|your day)\b/,
  /^how ?(are|r) (things|you doing|u doing|ya doing)\b/,
  /^hows (it going|things|everything|your day|life)\b/,
  /^how (you|u|ya) doing\b/,
  /^how do you do\b/,
  /^(you|u) (good|ok|okay|alright|doing (good|well|ok))\b/,
  /\bhope (you|u)(re| are)? (well|good|ok|okay|doing (well|good|ok))\b/,
  /^whats good\b/,
];

const PRAISE_PATTERNS: readonly RegExp[] = [
  /\b(good|great|nice|excellent) (job|work|one|going|stuff)\b/,
  /\bwell done\b/,
  /\b(you( a|')?re|youre) (great|awesome|amazing|the best|helpful|smart|good|brilliant)\b/,
  /\bthis is (great|awesome|helpful|amazing|useful|good|brilliant)\b/,
  /\b(so|very|really) (helpful|useful|good)\b/,
  /^(awesome|amazing|brilliant|excellent|impressive|fantastic|wonderful|superb|good bot)$/,
  /\bi (like|love) (this|it|quizrx|you)\b/,
];

const CHITCHAT_PATTERNS: readonly RegExp[] = [
  /\btell (me )?a joke\b/,
  /\b(say something|be) funny\b/,
  /\bare you (fun|funny|bored|serious)\b/,
  /\b(sing|dance|rap)\b/,
  /\bdo you (dream|sleep|eat|drink|have feelings|get tired)\b/,
  /\bwhat ?s the weather\b/,
  /\bwhat time( is it)?\b/,
  /\bhow old are you\b/,
  /\bwhere (are|r) you (from|located)\b/,
  /\b(do you love me|marry me|will you marry)\b/,
];

const normalize = (input: string): string =>
  input
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

export function classifySmallTalk(input: string): SmallTalkKind | null {
  const normalized = normalize(input).replace(/[0-9]/g, "").trim();
  if (!normalized) return null;

  const matches = (set: Set<string>, patterns: readonly RegExp[]): boolean =>
    set.has(normalized) || patterns.some((re) => re.test(normalized));

  if (matches(THANKS, THANKS_PATTERNS)) return "thanks";
  if (matches(FAREWELLS, FAREWELL_PATTERNS)) return "farewell";
  if (PRAISE_PATTERNS.some((re) => re.test(normalized))) return "praise";
  if (matches(CAPABILITIES, CAPABILITY_PATTERNS)) return "capability";
  if (IDENTITY_PATTERNS.some((re) => re.test(normalized))) return "identity";
  if (WELLBEING_PATTERNS.some((re) => re.test(normalized))) return "wellbeing";
  if (CHITCHAT_PATTERNS.some((re) => re.test(normalized))) return "chitchat";
  if (matches(GREETINGS, GREETING_PATTERNS)) return "greeting";
  if (ACKNOWLEDGEMENTS.has(normalized)) return "acknowledgement";

  return null;
}

// --- scope classification --------------------------------------------------
// In-module terms mean the request belongs to the Calcium & Bone beta, so it
// should flow through to the learning pipeline rather than being redirected.
const IN_MODULE_TERMS: readonly RegExp[] = [
  /\bcalcium\b/, /\bbone(s)?\b/, /\bskeletal\b/, /\bosteoporosis\b/,
  /\bosteomalacia\b/, /\brickets\b/, /\bpaget\b/, /\bosteogenesis\b/,
  /\bhypercalc\w*/, /\bhypocalc\w*/, /\bhypomagnes\w*/, /\bmagnesium\b/,
  /\bparathyroid\b/, /\bhyperparathyroid\w*/, /\bhypoparathyroid\w*/,
  /\bpth\b/, /\bvitamin ?d\b/, /\bphosphate\b/, /\bphosphor\w*/,
  /\bfhh\b/, /\bfamilial hypocalciuric\b/, /\bbisphosphonate(s)?\b/,
  /\bdenosumab\b/, /\bteriparatide\b/, /\bcinacalcet\b/, /\bde ?xa\b/,
  /\bt[- ]score\b/, /\balkaline phosphatase\b/, /\balp\b/, /\bcalcitonin\b/,
  /\bfracture(s)?\b/, /\bphpt\b/, /\bmetabolic bone\b/,
];

// Common medical topics that are OUTSIDE the current module.
const OUTSIDE_MEDICAL_TERMS: readonly RegExp[] = [
  /\bdiabet\w*/, /\bketoacidosis\b/, /\bdka\b/, /\binsulin\b/, /\bglucose\b/,
  /\bthyroid\b/, /\bhyperthyroid\w*/, /\bhypothyroid\w*/, /\bgoit\w*/,
  /\batrial fibrillation\b/, /\barrhythmia\b/, /\baf\b/, /\btachycard\w*/,
  /\bhypertension\b/, /\bblood pressure\b/, /\basthma\b/, /\bcopd\b/,
  /\bpneumonia\b/, /\bmyocard\w*/, /\bheart attack\b/, /\bangina\b/,
  /\bstroke\b/, /\bsepsis\b/, /\banaemia\b/, /\banemia\b/, /\bleukaemia\b/,
  /\bleukemia\b/, /\blymphoma\b/, /\bcovid\b/, /\binfluenza\b/, /\bflu\b/,
  /\bmigraine\b/, /\bepilepsy\b/, /\bseizure(s)?\b/, /\bdepression\b/,
  /\bschizophren\w*/, /\bpregnan\w*/, /\bhepatitis\b/, /\bcirrhosis\b/,
  /\basthma\b/, /\bappendicitis\b/, /\bulcer\b/, /\bcrohn\b/, /\bcolitis\b/,
];

// Clearly non-medical / unrelated requests.
const NON_MEDICAL_TERMS: readonly RegExp[] = [
  /\bweather\b/, /\bjoke(s)?\b/, /\bfootball\b/, /\bsoccer\b/, /\bbasketball\b/,
  /\bcricket\b/, /\btennis\b/, /\bmovie(s)?\b/, /\bfilm(s)?\b/, /\bsong(s)?\b/,
  /\bmusic\b/, /\bpolitic\w*/, /\bpresident\b/, /\belection\b/, /\bgovernment\b/,
  /\bstock(s)?\b/, /\bcrypto\w*/, /\bbitcoin\b/, /\brecipe\b/, /\bcook\w*/,
  /\bcelebrit\w*/, /\bgame(s)?\b/, /\btravel\b/, /\bholiday\b/, /\bhoroscope\b/,
  /\bnews\b/, /\bpoem\b/, /\bstory\b/,
];

export function classifyScope(input: string): ScopeKind | null {
  const normalized = normalize(input);
  if (!normalized) return null;

  const hasInModule = IN_MODULE_TERMS.some((re) => re.test(normalized));
  if (hasInModule) return null;

  if (OUTSIDE_MEDICAL_TERMS.some((re) => re.test(normalized))) {
    return "medical-outside";
  }
  if (NON_MEDICAL_TERMS.some((re) => re.test(normalized))) {
    return "non-medical";
  }
  return null;
}

const COMPARISON_PATTERNS: readonly RegExp[] = [
  /\bcompare\b/,
  /\bcomparison\b/,
  /\bdifference(s)? between\b/,
  /\bdifferentiate\b/,
  /\b(vs\.?|versus)\b/,
];

export function isComparisonRequest(input: string): boolean {
  const normalized = normalize(input);
  return COMPARISON_PATTERNS.some((re) => re.test(normalized));
}

type ReplyContext = {
  topicLabel?: string | null;
};

export function smallTalkReply(kind: SmallTalkKind, ctx: ReplyContext): string {
  const topic = ctx.topicLabel?.trim() || null;

  switch (kind) {
    case "greeting":
      return topic
        ? APPROVED_RESPONSES.greetingTopic(topic)
        : APPROVED_RESPONSES.greetingNoTopic;
    case "thanks":
    case "praise":
    case "acknowledgement":
      return topic
        ? APPROVED_RESPONSES.thanksTopic(topic)
        : APPROVED_RESPONSES.thanksNoTopic;
    case "capability":
      return APPROVED_RESPONSES.capability;
    case "wellbeing":
      return APPROVED_RESPONSES.howAreYou;
    case "identity":
      return topic
        ? APPROVED_RESPONSES.greetingTopic(topic)
        : APPROVED_RESPONSES.capability;
    case "farewell":
      return "Thanks for studying with QuizRx. Come back anytime to continue with the Calcium & Bone module.";
    case "chitchat":
      // Casual / off-topic chatter is treated as an unrelated-scope request.
      return APPROVED_RESPONSES.nonMedical;
    default:
      return APPROVED_RESPONSES.capability;
  }
}

export function scopeReply(kind: ScopeKind): string {
  return kind === "medical-outside"
    ? APPROVED_RESPONSES.medicalOutside
    : APPROVED_RESPONSES.nonMedical;
}
