import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  hydrateTutorMcqQuestions,
  quizQuestionsSchema,
} from "../lib/curriculum/mcq-question-schema.ts";

describe("hydrateTutorMcqQuestions", () => {
  it("hydrates tutor MCQ objects", () => {
    const raw = [
      {
        kind: "multiple_choice",
        prompt: "Where does first-pass metabolism occur?",
        correctAnswer: "Liver",
        incorrectOptions: ["Kidney", "Lungs", "Skin"],
      },
    ];
    const result = hydrateTutorMcqQuestions(raw);
    assert.ok(result);
    assert.equal(result.length, 1);
    assert.equal(result[0].correctAnswer, "Liver");
    assert.deepEqual(result[0].incorrectOptions, ["Kidney", "Lungs", "Skin"]);
  });

  it("hydrates AI-style options/answer objects", () => {
    const raw = [
      {
        question: "Which organ is primary?",
        options: ["Liver", "Kidney", "Lungs", "Skin"],
        answer: "Liver",
      },
    ];
    const result = hydrateTutorMcqQuestions(raw);
    assert.ok(result);
    assert.equal(result[0].prompt, "Which organ is primary?");
    assert.equal(result[0].correctAnswer, "Liver");
    assert.equal(result[0].incorrectOptions.length, 3);
  });

  it("refuses to hydrate free-text or mixed payloads", () => {
    assert.equal(
      hydrateTutorMcqQuestions([
        { question: "Explain absorption.", answer: "..." },
      ]),
      null,
    );
    assert.equal(hydrateTutorMcqQuestions(["Prompt || answer"]), null);
    assert.equal(
      hydrateTutorMcqQuestions([
        {
          kind: "multiple_choice",
          prompt: "Ok?",
          correctAnswer: "Yes",
          incorrectOptions: ["No", "Maybe", "Skip"],
        },
        "legacy line",
      ]),
      null,
    );
  });

  it("returns null for empty or oversized arrays", () => {
    assert.equal(hydrateTutorMcqQuestions([]), null);
    assert.equal(hydrateTutorMcqQuestions(null), null);
  });
});

describe("quizQuestionsSchema", () => {
  it("rejects duplicate options", () => {
    const parsed = quizQuestionsSchema.safeParse([
      {
        kind: "multiple_choice",
        prompt: "Pick one",
        correctAnswer: "A",
        incorrectOptions: ["A", "B", "C"],
      },
    ]);
    assert.equal(parsed.success, false);
  });

  it("accepts four distinct options", () => {
    const parsed = quizQuestionsSchema.safeParse([
      {
        kind: "multiple_choice",
        prompt: "Pick one",
        correctAnswer: "A",
        incorrectOptions: ["B", "C", "D"],
      },
    ]);
    assert.equal(parsed.success, true);
  });
});
