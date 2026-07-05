// Small-talk handling for the quiz surface.
//
// This beta chat page is a quiz-only surface: every typed message is otherwise
// treated as "fetch the next question". A conversational message ("hi",
// "thanks", "how are you", "are you an AI?", "ok", "good job", "tell me a joke")
// should instead get a natural, human reply and NOT consume a question.
//
// We classify intent with a mix of exact-match sets (for short fixed phrases)
// and anchored regex patterns (for phrasings that vary). Everything is anchored
// tightly enough that it can't collide with a real quiz prompt — see the
// false-positive tests documented alongside this module.

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
// These vary too much for an exact allowlist, but are distinctive enough that
// they can't collide with a real quiz prompt.
const GREETING_PATTERNS: readonly RegExp[] = [
  /^(hi+|hii+|hiya+|hey+|heyy+|heya+|hello+|helo+|yo+)$/,     // "hiiii", "heyyy"
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
  /^what (can|do) you\b/,                       // "what can you do", "what do you do"
  /^what (topics|subjects) (are|can i|do you)\b/, // "what topics are available" (not "what topics cause X")
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

// Match only when the WHOLE message is small-talk (after stripping punctuation
// and collapsing whitespace), so real questions that merely contain "hi" or
// "help" (e.g. "help me understand hypercalcaemia") still flow to the quiz.
export function classifySmallTalk(input: string): SmallTalkKind | null {
  const normalized = input
    .toLowerCase()
    .replace(/[^a-z\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!normalized) return null;

  const matches = (
    set: Set<string>,
    patterns: readonly RegExp[]
  ): boolean => set.has(normalized) || patterns.some((re) => re.test(normalized));

  // Order matters: more specific / higher-signal categories first so an
  // ambiguous token (e.g. "cool thanks" → thanks, not acknowledgement) lands
  // in the right bucket.
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

const pick = (options: readonly string[]): string =>
  options[Math.floor(Math.random() * options.length)];

type ReplyContext = {
  isFirstTurn: boolean;
  topicLabel?: string | null;
};

const INTRO =
  "I'm QuizRX, your endocrinology study partner — I can quiz you with " +
  "board-style questions and give you instant feedback. This beta focuses on " +
  "calcium, bone, and parathyroid topics.";

// How the user actually starts/continues the quiz on this surface.
function howToProceed(topicLabel?: string | null): string {
  if (topicLabel) {
    return `You're on “${topicLabel}”. Just ask for a question — e.g. "next question" or a keyword like "osteoporosis" — and I'll pull one up.`;
  }
  return "Pick a topic from Explore Topics below, then ask for a question to begin.";
}

export function smallTalkReply(
  kind: SmallTalkKind,
  ctx: ReplyContext
): string {
  const proceed = howToProceed(ctx.topicLabel);

  if (kind === "greeting") {
    if (ctx.isFirstTurn) {
      const opener = pick(["Hi!", "Hello!", "Hey there!"]);
      return `${opener} ${INTRO} ${proceed}`;
    }
    return pick([
      `Ready when you are — ${proceed}`,
      "Hello again! Ask for the next question whenever you like.",
      `Hi! ${proceed}`,
    ]);
  }

  if (kind === "thanks") {
    return pick([
      "You're welcome! Ask for another question whenever you're ready.",
      "Anytime! Want to keep going? Just ask for the next question.",
      "Glad that helped! Ready for the next one whenever you are.",
    ]);
  }

  if (kind === "farewell") {
    return pick([
      "Take care! Come back anytime to keep practicing calcium & bone questions.",
      "Bye for now — good luck with your studying!",
      "See you next time. Keep up the great work!",
    ]);
  }

  if (kind === "wellbeing") {
    return pick([
      `I'm doing great, thanks for asking! Ready when you are — ${proceed}`,
      `All good on my end! ${proceed}`,
      `Doing well, thank you! ${proceed}`,
    ]);
  }

  if (kind === "identity") {
    return pick([
      `I'm QuizRX, an AI study assistant for endocrinology — not a person, but I'm good at quizzing you and explaining calcium, bone, and parathyroid topics. ${proceed}`,
      `I'm QuizRX, an AI built to help you prep for endocrinology exams. ${proceed}`,
      `I'm QuizRX — an AI, not a human. My job is helping you practice endocrinology. ${proceed}`,
    ]);
  }

  if (kind === "praise") {
    return pick([
      "Thank you — that means a lot! Ready for the next question whenever you are.",
      "Aw, thanks! Glad it's helping. Ask for another whenever you like.",
      "Appreciate it! Let's keep the momentum going — just ask for the next question.",
    ]);
  }

  if (kind === "acknowledgement") {
    return pick([
      "Great — just ask for the next question whenever you're ready.",
      "Perfect. Say the word and I'll pull up the next one.",
      "Sounds good! Ready when you are.",
    ]);
  }

  if (kind === "chitchat") {
    return pick([
      `Ha! I'll leave the jokes to the comedians — I'm all about endocrinology. ${proceed}`,
      `That's a little outside my wheelhouse — I focus on endocrinology study. ${proceed}`,
      `I'm not much of a small-talker, but I'm great at quizzing you. ${proceed}`,
    ]);
  }

  // capability
  return `${INTRO} ${proceed}`;
}
