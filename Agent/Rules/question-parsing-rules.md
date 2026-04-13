# Question Parsing Rules

### 1. Cleaning and Ignoring
- **DO NOT** include the university name, academic year (e.g., 2021-2022), semester (Spring, Fall), exam type (Midterm, Final, Summer School), or question numbers in the JSON output.
- Only utilize the **Department Name** (`department`) and **Course Name** (`courseName`) information.

### 2. Deduplication (Critical)
- Identical questions may appear across different booklet versions (e.g., Booklet A, Booklet B) or different years.
- **NEVER** add the same question twice to the `questions` array. If the question text is identical, include it only once in the JSON.

### 3. Answer Key Matching
- Locate the answer key at the end of the text.
- Record the correct answer (A, B, C, D, or E) in the `correctAnswer` field as a single character.

### 4. Formatting
- Your output must be **ONLY** a valid JSON object. Do not include any introductory text, greetings, explanations, or closing remarks.
- **DO NOT** use Markdown code blocks (e.g., ```json ... ```). Provide raw JSON output beginning with `{` and ending with `}`.

---
**Important:** Never corrupt or overwrite existing data; only append new data to the structure.