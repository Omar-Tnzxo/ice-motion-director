# Prerequisites per route and per OS

Owned by the `ice-engines` skill: open its `references/engine-choice.md` section 7. It holds what each route needs (7.1), the check order to run once at intake (7.2), the one plain step per OS for a system tool (7.3), the fallback ladder when the chosen engine is missing (7.4), the gates that replace HyperFrames lint and `check` on the zero-install route (7.5), installs without a question (7.6) and disk space (7.7). This file holds nothing else, so there is only one version of these rules.

Two rules are stated here because they decide the stage 01 message:
- Python with the `ice-qa` packages is required on every route that delivers a rendered film (film, explainer, remake, edit), because an unmeasured richness floor blocks delivery (section 7.1 of that file).
- Free tools, models and packages are installed by Ice without a question and recorded (section 7.6), so they never appear in the stage 01 questions. The `tools` question is asked only for a paid service, something that needs an account or a sign-in, or spending; a system tool that needs an administrator password is one plain step for the user (section 7.3), never a question.
