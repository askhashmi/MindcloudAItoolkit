---
name: technical-proposal-development
description: >
  Create full Arabic technical proposals as professional Word (.docx) and PowerPoint (.pptx)
  documents for TAM consulting engagements. Use this skill whenever the user wants to write,
  draft, build, produce, or prepare a technical proposal, tender response, RFP reply, or
  consulting offer — even if they just say "help me with a proposal", "I have an RFP", or
  "ابني مقترح". Handles government, private sector, and innovation/grant proposals.
  Accepts RFP documents (PDF/Word) and/or user notes as input. Automatically drafts the full
  proposal in Arabic across all sections, presents it for review, then builds both DOCX and
  PPTX files using the client's brand colors.
---

# Technical Proposal Skill — TAM للاستشارات الإدارية

Produces complete Arabic technical proposals as professional Word and PowerPoint documents.
Covers government, private sector, and innovation/grant contexts.

---

## Inputs

Accept any combination of:
- An uploaded RFP or brief document (PDF or Word)
- Bullet points or notes from the user
- A previous proposal to adapt from

If no input is provided, ask the user for the RFP or key points before proceeding.

---

## Critical Writing Rules (ALWAYS APPLY)

These rules were refined through real proposal work and must never be broken:

1. **لا صيغة النفي** — Never use negation like "لا مجرد وثيقة". Use direct positive phrasing: "خارطة حوكمة منضبطة".

2. **لا ذكر الغياب أو النقص** — Never say the client lacks something or has a gap. Frame everything as growth, development, and acceleration.

3. **صيغة التطوير والنمو دائماً** — All framing must be positive and forward-looking.

4. **اللغة العربية الرسمية** — All content in formal Arabic. English only for proper nouns/acronyms.

5. **كل قسم يُشير للعميل بالاسم** — Every section references the client name and RFP title explicitly.

---

## Workflow

### Step 1 — Extract & Analyze RFP

Read all provided inputs. Internally map: client name, sector, RFP title, scope/deliverables, objectives, timeline, evaluation criteria, strategic context (Vision 2030 alignment).

---

### Step 2 — Draft Full Proposal in Arabic

Draft all 8 sections below. Present for review before building files.

---

#### القسم 1: الملخص التنفيذي
- 1–2 paragraphs: opportunity, TAM's approach, value proposition
- Confident strategic tone for senior decision-makers
- Reference client name and RFP title explicitly
- Highlight key numbers: deliverables count, duration, methodology name

#### القسم 2: السياق والفرصة الاستراتيجية
- Frame as growth opportunity, never as a problem or gap
- Reference Vision 2030 or relevant national strategic frameworks
- Connect to sector-specific data or benchmarks
- End with what TAM's intervention enables

#### القسم 3: فهمنا للمشروع (three sub-sections)

**3أ — متطلبات الطرح:** Summarize requirements in structured Arabic. Include deliverables table:
المخرج | الأسبوع | نسبة السداد | الوصف

**3ب — أهداف العميل وتوجهاته الاستراتيجية:** Analyze client's mandate and strategic ambitions. Align RFP outputs with Vision 2030 and sector goals. Frame as ambitions not gaps.

**3ج — خبراتنا ذات الصلة:** Table: مجال الخبرة | التفاصيل. Leave placeholder if CVs not provided: [يُستكمل من قِبَل الفريق]

#### القسم 4: الدراسات المعيارية والمقارنة الدولية

**ALWAYS include before methodology.** Three parts:

1. **المقارنة الدولية** — Benchmark 3–4 international programs. Table: المؤشر | Program A | Program B | Program C | Program D. Rows: نوع البرنامج، المدة، المشاركون/دورة، الاستقطاب، حفل الختام، نقل المعرفة، المخرج الرئيسي.

2. **المقارنة المحلية** — Benchmark 3–4 Saudi/regional programs. Table: الجهة | القطاع | النموذج | الدرس المستفاد.

3. **الدروس المستفادة** — Table mapping lessons to design decisions: الدرس المستفاد | المصدر | الانعكاس على مقترح TAM. Minimum 5 rows.

#### القسم 5: الحل المقترح — الرؤية والمفهوم
- Open with bold concept statement in quotes
- Explain the strategic logic
- 4–5 pillars in a table: الركيزة | التفاصيل
- All phrasing positive and forward-looking

#### القسم 6: المنهجية

**ALWAYS use a detailed table — never prose only.** Required columns:
| المرحلة | المدة | الأنشطة الرئيسية والفرعية | المخرجات | المسؤول |

Requirements:
- Select methodology type based on project: 4-phase (complex), 3-phase (lean), or custom matching RFP structure
- 5–8 sub-activities per phase
- Map deliverables to RFP codes (D1, D2, etc.)
- Include knowledge transfer in every phase
- Responsible party: TAM (رئيسي) / العميل / مشترك

#### القسم 7: الفريق
Table: المسمى الوظيفي | الاسم | الدور في المشروع | سنوات الخبرة
Standard roles: الشريك المسؤول، مدير المشروع، متخصص قطاعي، متخصص تنفيذ، محلل بيانات وأداء
Add team philosophy note. Use [الاسم] placeholder if not provided.

#### القسم 8: الجدول الزمني
Table: المخرج | الأسبوع | نسبة السداد | المسار/البرنامج | الوصف
Map all RFP deliverables with exact weeks and payment percentages.

---

### Step 3 — Present for Review

Present draft section by section. Say:
> "هذه المسودة الكاملة للمقترح. راجع كل قسم وأخبرني بأي تعديلات قبل أن ننتقل لبناء الملفات."

Apply all feedback. Confirm before building files.

---

### Step 4 — Build Output Files

Build BOTH files:

#### DOCX (Word Document)
Use `docx` npm package:
- A4 (11906 × 16838 DXA), 0.75" margins, RTL bidirectional throughout
- Header: proposal title + TAM name | Footer: confidentiality + page number
- TAM colors: Purple `3D1272`, Yellow `F5C400`, White `FFFFFF`, Black `1A1A1A`
- Tables: dual widths (columnWidths + cell width), ShadingType.CLEAR, DXA units
- Header rows: purple bg + white bold text | Alternating rows: GRAY_LIGHT / WHITE
- Validate: `python scripts/office/validate.py output.docx`

#### PPTX (PowerPoint)
Use `pptxgenjs` npm package:
- 16x9 layout, RTL Arabic (rtlMode: true), matching color scheme
- Slide per major section, all tables with proper column widths
- Cover: dark purple bg + yellow accent | Closing: dark purple bg
- Content slides: white bg + purple header bar + yellow accent strip

#### Delivery
Save both to `/mnt/user-data/outputs/` and present via `present_files`.
Files: `[ClientName]_Technical_Proposal_[Year].docx` and `.pptx`

---

## Quality Checklist

Before delivery, verify:
- [ ] Every section references the client and RFP by name
- [ ] No negative framing, no mention of gaps or absence
- [ ] Methodology in table format with all 5 columns
- [ ] Benchmarking section present before methodology
- [ ] All RFP deliverable codes mapped in timeline table
- [ ] Both DOCX and PPTX validated and delivered
- [ ] Vision 2030 mentioned for Saudi government clients
