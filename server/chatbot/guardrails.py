from __future__ import annotations

import re
import unicodedata

_ZERO_WIDTH_RE = re.compile(r"[\u200b\u200c\u200d\u2060\ufeff]")

_LEET_MAP = str.maketrans({
    "0": "o",
    "1": "i",
    "!": "i",
    "3": "e",
    "4": "a",
    "@": "a",
    "5": "s",
    "$": "s",
    "7": "t",
    "+": "t",
    "8": "b",
    "9": "g",
})


_INTERLEAVED_JUNK_RE = re.compile(
    r"\b(?:[a-z][\s\-_.*]+){2,}[a-z]\b"
)


def _collapse_interleaved(text: str) -> str:
    def _squash(match: re.Match) -> str:
        return re.sub(r"[\s\-_.*]+", "", match.group())

    return _INTERLEAVED_JUNK_RE.sub(_squash, text)


def _normalize(text: str) -> str:
    """
    Produces a lowercased, de-obfuscated version of `text` for pattern
    matching only. Not used for anything user-facing.
    """
    text = unicodedata.normalize("NFKD", text)
    text = "".join(ch for ch in text if not unicodedata.combining(ch))

    text = _ZERO_WIDTH_RE.sub("", text)
    text = text.lower()
    text = text.translate(_LEET_MAP)
    prev = None
    while prev != text:
        prev = text
        text = _collapse_interleaved(text)

    text = re.sub(r"\s+", " ", text).strip()
    return text



_INJECTION_PATTERN_FAMILIES: dict[str, list[str]] = {
    # "ignore/forget/disregard/override (all/any) (previous/above/prior/
    # earlier/original) instructions/rules/prompt/directives"
    "instruction_override": [
        r"\b(ignore|forget|disregard|override|discard|drop|erase|scrap)\b"
        r"(\s+\w+){0,3}?\s+"
        r"(previous|above|prior|earlier|original|all|your|these|the)\b"
        r"(\s+\w+){0,3}?\s+"
        r"(instructions?|rules?|prompt|directives?|guidelines?|constraints?)",
    ],
    # "you are now / from now on you are / you are no longer / you are not
    # <anything> anymore" — generic identity-reassignment attacks. This is
    # intentionally broad: it does not require the attacker to name your
    # bot, and it catches both "become something else" and "stop being
    # yourself" framings.
    "identity_reassignment": [
        r"\byou\s*('re|are)\s+(now|no longer|not)\b",
        r"\bfrom now on\b.{0,40}\byou\s*('re|are)\b",
        r"\byour new (name|identity|role|persona|instructions?)\s+is\b",
        r"\byou\s*('re|are)\s+not\s+.{0,40}\s+(anymore|any more)\b",
        r"\bstop\s+(being|acting as|pretending to be)\b",
        r"\bswitch(ing)?\s+(roles?|personas?|identit(y|ies))\b",
    ],
    # "act as / pretend (to be) / roleplay as / simulate / behave as if you
    # have no restrictions/filters/rules"
    "roleplay_bypass": [
        r"\b(act|behave)\s+as\s+(if|though)\b",
        r"\bpretend\s+(to be|you('re| are))\b",
        r"\broleplay\s+as\b",
        r"\bsimulate\s+(a|an|being)\b",
        r"\b(unrestricted|no rules|no filter|no restrictions|without "
        r"(any\s+)?(restrictions?|limits?|filters?|guardrails?))\b",
    ],
    # Direct system-prompt extraction attempts.
    "prompt_extraction": [
        r"\b(reveal|show|print|repeat|output|leak|share)\b.{0,20}\b"
        r"(system prompt|initial prompt|instructions?|configuration)\b",
        r"\bwhat\s+(is|are)\s+your\s+(system\s+)?instructions?\b",
        r"\brepeat\s+(the\s+)?(words?|text)\s+above\b",
    ],
    # Known jailbreak-technique names/markers.
    "known_jailbreak_markers": [
        r"\bjailbreak\b",
        r"\bdan\s+mode\b",
        r"\bdeveloper\s+mode\b",
        r"\bdo anything now\b",
        r"\bopposite\s+day\b",
    ],
}

_COMPILED_INJECTION_PATTERNS: dict[str, re.Pattern] = {
    family: re.compile("|".join(patterns), re.IGNORECASE)
    for family, patterns in _INJECTION_PATTERN_FAMILIES.items()
}

_COMPACT_EVASION_FRAGMENTS = [
    "ignoreprevious", "ignoreabove", "ignoreprior", "ignoreall",
    "forgetprevious", "forgetabove", "forgetprior",
    "disregardprevious", "disregardabove", "disregardprior",
    "overrideinstructions", "overriderules",
    "youarenownot", "youarenolonger", "fromnowonyouare",
    "yournewinstructions", "yournewrole", "yournewidentity",
    "actasif", "pretendtobe", "roleplayas", "nowyouare",
    "revealsystemprompt", "showsysteminstructions", "printsystemprompt",
    "jailbreak", "danmode", "developermode", "doanythingnow",
]


def _compact(text: str) -> str:
    return re.sub(r"[^a-z0-9]", "", text)


def _detect_injection_families(normalized_text: str) -> list[str]:
    hits = []
    for family, pattern in _COMPILED_INJECTION_PATTERNS.items():
        if pattern.search(normalized_text):
            hits.append(family)

    compact = _compact(normalized_text)
    if any(fragment in compact for fragment in _COMPACT_EVASION_FRAGMENTS):
        hits.append("compact_evasion")
    seen = set()
    deduped = []
    for h in hits:
        if h not in seen:
            seen.add(h)
            deduped.append(h)
    return deduped


def check_input(user_message: str, bot_name: str | None = None) -> list[str]:
    """
    Deterministic pre-checks. Returns a list of flags (empty = clean).
    Runs BEFORE any LLM call so a bad input never reaches your model.

    bot_name: optional. If given, also checks for "you are not <bot_name>"
    / "you're not <bot_name>" style attacks that name your bot specifically
    (e.g. "now you are not ViralForge, you are ..."), in addition to the
    generic identity_reassignment family above.
    """
    flags: list[str] = []

    if len(user_message.strip()) == 0:
        flags.append("empty_message")
        return flags

    normalized = _normalize(user_message)

    for family in _detect_injection_families(normalized):
        flags.append(f"possible_prompt_injection:{family}")

    if bot_name:
        bot_pattern = re.compile(
            r"\byou\s*('re|are)\s+not\s+" + re.escape(bot_name.lower()),
            re.IGNORECASE,
        )
        if bot_pattern.search(normalized):
            flags.append("possible_prompt_injection:named_identity_attack")

    if any(len(word) > 500 for word in user_message.split()):
        flags.append("suspicious_token_stuffing")

    zero_width_count = len(_ZERO_WIDTH_RE.findall(user_message))
    if zero_width_count > 3:
        flags.append("suspicious_zero_width_chars")

    if re.search(r"(.)\1{40,}", user_message):
        flags.append("suspicious_character_flooding")

    return flags



_EMAIL_RE = re.compile(r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}")

_PHONE_RE = re.compile(
    r"(?<!\d)(\+?\d{1,3}[-.\s]?)?"
    r"\(?\d{3}\)?[-.\s]\d{3}[-.\s]\d{4}(?!\d)"
)

_CARD_CANDIDATE_RE = re.compile(r"\b(?:\d[ -]?){13,19}\b")


def _luhn_valid(digits: str) -> bool:
    total = 0
    for i, ch in enumerate(reversed(digits)):
        d = int(ch)
        if i % 2 == 1:
            d *= 2
            if d > 9:
                d -= 9
        total += d
    return total % 10 == 0


def _contains_valid_card_number(text: str) -> bool:
    for match in _CARD_CANDIDATE_RE.finditer(text):
        digits = re.sub(r"[ -]", "", match.group())
        if 13 <= len(digits) <= 19 and _luhn_valid(digits):
            return True
    return False


def check_output(reply_text: str, system_prompt: str | None = None) -> list[str]:
    """
    Deterministic post-checks on what the model is about to return.
    """
    flags: list[str] = []

    if _EMAIL_RE.search(reply_text):
        flags.append("possible_pii:email")

    if _PHONE_RE.search(reply_text):
        flags.append("possible_pii:phone")

    if _contains_valid_card_number(reply_text):
        flags.append("possible_pii:card_number")

    if system_prompt is None:
        flags.append("system_prompt_leak_check_skipped")
    else:
        stripped = system_prompt.strip()
        if len(stripped) > 20:
            normalized_reply = _normalize(reply_text)
            # Check several overlapping windows of the system prompt, not
            # just the first 80 chars, so a leak starting mid-prompt (e.g.
            # the model paraphrases the opening line but quotes a later
            # rule verbatim) still gets caught.
            normalized_prompt = _normalize(stripped)
            window = 80
            step = 40
            for start in range(0, max(len(normalized_prompt) - window, 0) + 1, step):
                chunk = normalized_prompt[start:start + window]
                if len(chunk) >= 20 and chunk in normalized_reply:
                    flags.append("possible_system_prompt_leak")
                    break

    return flags


async def run_input_guardrails(
    user_message: str, bot_name: str | None = None
) -> list[str]:
    return check_input(user_message, bot_name=bot_name)


async def run_output_guardrails(
    reply_text: str, system_prompt: str | None = None
) -> list[str]:
    return check_output(reply_text, system_prompt)