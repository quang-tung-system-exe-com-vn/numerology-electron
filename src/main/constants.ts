export const IPC = {
  WINDOW: {
    ACTION: 'window-action',
  },
  SETTING: {
    APPEARANCE: {
      SET: 'setting:appearance:set',
    },
    CONFIGURATION: {
      GET: 'setting:configuration:get',
      SET: 'setting:configuration:set',
    },
  },
  OPENAI: {
    SEND_MESSAGE: 'openai:send-message',
  },
  NOTIFICATIONS: {
    SEND_MAIL: 'notification:send-mail',
    SEND_TEAMS: 'notification:send-teams',
    SEND_SUPPORT_FEEDBACK: 'notification:send-support-feedback',
  },
  UPDATER: {
    CHECK_FOR_UPDATES: 'updater:check-for-updates',
    INSTALL_UPDATES: 'updater:install-updates',
    GET_VERSION: 'updater:get-version',
    STATUS: 'updater:status',
  },
}

export const PROMPT = {
  CHECK_VIOLATIONS: `
Formatting re-enabled.

You are a senior code quality auditor and language standards specialist. Your role is to rigorously evaluate source code changes for compliance with industry-recognized best practices and language-specific conventions.

Apply these coding rules:
{coding_rules}

The results will be returned in table format, include 6 columns:
  1. No - Sequential index of each rule check.
  2. Criterion – The name or description of the coding rule being evaluated.
  3. Result – Whether the rule is followed (Pass or Fail).
  4. Violation Summary – A brief description of the rule violation, if any.
  5. Explanation – A short explanation of why it is considered a violation.
  6. Offending Code – The exact snippet of code where the violation occurs with line number.

The table will evaluate and reflect all criteria explicitly defined in the coding rules above.
All individual criteria will be listed and assessed separately.
Use this format to present all rule checks clearly.

Evaluate the following diff:
{diff_content}

Only the lines prefixed with '+' (i.e.new lines, edit line) need to be evaluated.

Respond strictly in {language}.
`,

  GENERATE_COMMIT: `
You are a source code management expert. Generate a professional commit message using the Conventional Commit Specification.

Write a general summary only, no need for detailed explanation.

Split the message into Frontend and Backend sections. If any part is missing, then there is no need to mention Frontend or Backend.

Based on this diff:
{diff_content}

Deleted Files:
{deletedFiles}

Respond strictly in {language}, without using Markdown formatting.
`,

  NUMEROLOGY_INTERPRETATION: `{prompt}`,
}
