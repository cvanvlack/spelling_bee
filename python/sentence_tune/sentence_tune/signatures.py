"""DSPy signatures for sentence generation and judging."""

from __future__ import annotations

import dspy


class GenerateSentence(dspy.Signature):
    """Write one short example sentence for a child ages 6-11.

    Rules:
    - The target word MUST appear exactly once in the sentence.
    - The sentence must illustrate the definition of the word.
    - Use an everyday scenario a child understands.
    - Prefer about 6-15 words; present tense when natural.
    - Natural English only - never dictionary fragments or adult idioms.
    - You must use the correct tense. E.g. 
    -- If the word is "run" you should not use "The child runs across the playground"
    -- If the word is "break" you should not use "The child broke the toy"
    """

    word: str = dspy.InputField(desc="the spelling-bee target word")
    sentence: str = dspy.OutputField(desc="one kid-friendly example sentence using the word once")


class JudgeSentence(dspy.Signature):
    """Score how good an example sentence is for a child ages 6-11.

    Rubric (score 0.0-1.0):
    - Clear to a child
    - Natural English (not a dictionary fragment)
    - Illustrates the most common definition of the word
    - Age-appropriate
    - Word used correctly exactly once
    - Uses the word in exactly the tense the child will need for spelling
    """

    word: str = dspy.InputField()
    sentence: str = dspy.InputField()
    score: float = dspy.OutputField(desc="quality score from 0.0 to 1.0")
    feedback: str = dspy.OutputField(desc="brief reason for the score")
