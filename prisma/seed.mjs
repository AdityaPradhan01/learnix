import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// ── Careers: the target skill vectors the scoring engine compares every
// course's skill vector against. Axes: ml, stat, sys, alg, prac (0..1). ──
const CAREERS = [
  { key: "ml", name: "Machine Learning Engineer", desc: "Build and ship models", t: { ml: 0.95, stat: 0.8, sys: 0.6, alg: 0.7, prac: 0.6 } },
  { key: "data", name: "Data Scientist", desc: "Turn data into decisions", t: { ml: 0.7, stat: 0.95, sys: 0.3, alg: 0.5, prac: 0.4 } },
  { key: "plat", name: "Platform Engineer", desc: "Build the systems everything else runs on", t: { ml: 0.2, stat: 0.3, sys: 0.95, alg: 0.6, prac: 0.7 } },
  { key: "prod", name: "Product Engineer", desc: "Ship features end to end", t: { ml: 0.3, stat: 0.3, sys: 0.6, alg: 0.6, prac: 0.95 } },
  { key: "res", name: "Research Scientist", desc: "Push the boundary of what's known", t: { ml: 0.9, stat: 0.85, sys: 0.4, alg: 0.8, prac: 0.3 } },
  { key: "unsure", name: "Still deciding", desc: "Keep options open across every track", t: { ml: 0.6, stat: 0.6, sys: 0.6, alg: 0.6, prac: 0.6 } },
];

// ── Instructors, deduped by name and referenced from courses below. ──
const INSTRUCTORS = {
  "Dr. Priya Nair": { role: "Senior Lecturer, Computer Science", years: 12, rating: 4.7, bio: "Teaches the first course most CS majors take. Known for patient office hours and a zero-judgment debugging policy." },
  "Dr. Felix Okafor": { role: "Associate Professor, Mathematics", years: 10, rating: 4.4, bio: "Makes discrete math click with puzzles instead of proofs-first lectures." },
  "Dr. Grace Halvorsen": { role: "Associate Professor, Computer Science", years: 11, rating: 4.5, bio: "Systems-minded algorithmicist. Problem sets are hard; the intuition sticks." },
  "Dr. Soo-Yun Park": { role: "Professor, Mathematics", years: 16, rating: 4.6, bio: "Two decades of teaching linear algebra as the language every other course borrows." },
  "Dr. Renata Kolisi": { role: "Associate Professor, Statistics", years: 9, rating: 4.5, bio: "Former industry data scientist. Grounds every distribution in a real dataset." },
  "Dr. Amara Bequette": { role: "Associate Professor, Computer Science", years: 9, rating: 4.6, bio: "Works on robust learning under distribution shift. Known for clear problem sets and generous office hours." },
  "Dr. Mateo Lindqvist": { role: "Associate Professor, Computer Science", years: 10, rating: 4.5, bio: "Runs the database and distributed-systems sequence like a small production team." },
  "Dr. Julia Marchetti": { role: "Professor, Computer Science", years: 14, rating: 4.7, bio: "Ex-engineering-manager. Software Engineering and Capstone are run like a real product team." },
  "Dr. Sena Haruna": { role: "Associate Professor, Computer Science", years: 7, rating: 4.5, bio: "Studies how people actually use the software we build. Studio-style critiques, not lectures." },
  "Dr. Katarzyna Nowak": { role: "Associate Professor, Informatics", years: 8, rating: 4.5, bio: "Believes a chart is an argument. Every assignment ships as a public dashboard." },
  "Dr. Elias Vasquez": { role: "Associate Professor, Computer Science", years: 9, rating: 4.6, bio: "Red-team background. Every lecture ends with 'now break it'." },
  "Prof. Elena Struthers": { role: "Senior Lecturer, Writing Program", years: 15, rating: 4.5, bio: "Teaches technical writing as a craft, not a formality." },
  "Dr. Tomasz Wren": { role: "Associate Professor, Philosophy", years: 8, rating: 4.6, bio: "Runs the ethics-of-technology seminar as a standing argument, not a lecture." },
};

// ── Course catalogue: 8 foundational/gen-ed courses (mostly prerequisites)
// and 12 upper-level courses the recommender actually competes over. ──
const COURSES = [
  {
    code: "WRIT 110", dept: "WRIT", name: "Academic Writing and Rhetoric", credits: 3, hoursPerWeek: 4,
    days: "TR", startTime: 10, endTime: 11.25, slot: "Tue & Thu 10:00–11:15", seats: 25, capacity: 30,
    instructor: "Prof. Elena Struthers", rating: 4.3, reviewCount: 90, ratingDist: [40, 35, 15, 7, 3],
    sk: { ml: 0, stat: 0, sys: 0, alg: 0, prac: 0.05 },
    historyScore: 95, scheduleScore: 90, costScore: 85,
    historyReason: "No prerequisites — open to every incoming student",
    scheduleReason: "Two short mid-morning sessions a week",
    costReason: "Included in the standard first-year course fee",
    prerequisites: [], requirementCategory: "General education",
    blurb: "Argumentative and technical writing for an academic and professional audience.",
    syllabus: ["The thesis-driven essay", "Reading and summarizing sources", "Structuring an argument", "Revision as a process", "Technical and audience-aware writing", "The portfolio review"],
    assessment: [{ name: "Essays", percent: 60 }, { name: "Portfolio", percent: 25 }, { name: "Participation", percent: 15 }],
    reviews: [{ who: "Year 1, Undeclared", term: "Autumn 2025", stars: 4, text: "Genuinely made me a clearer writer." }, { who: "Year 1, CS", term: "Spring 2026", stars: 5, text: "Best-run writing seminar I've taken." }],
  },
  {
    code: "PHIL 120", dept: "PHIL", name: "Ethics of Technology", credits: 3, hoursPerWeek: 4,
    days: "MW", startTime: 11, endTime: 12.25, slot: "Mon & Wed 11:00–12:15", seats: 30, capacity: 40,
    instructor: "Dr. Tomasz Wren", rating: 4.4, reviewCount: 120, ratingDist: [45, 30, 15, 6, 4],
    sk: { ml: 0, stat: 0, sys: 0, alg: 0, prac: 0.05 },
    historyScore: 95, scheduleScore: 88, costScore: 85,
    historyReason: "No prerequisites — a general-education seminar",
    scheduleReason: "Meets midday, easy to schedule around",
    costReason: "Standard tuition, no additional fees",
    prerequisites: [], requirementCategory: "General education",
    blurb: "Moral frameworks applied to AI, privacy, surveillance and automation.",
    syllabus: ["Consequentialism vs. deontology, quickly", "Privacy and surveillance", "Algorithmic bias", "Automation and labor", "AI safety framings", "A case-study debate"],
    assessment: [{ name: "Reading responses", percent: 30 }, { name: "Debate", percent: 30 }, { name: "Final paper", percent: 40 }],
    reviews: [{ who: "Year 2, Data Science", term: "Autumn 2025", stars: 5, text: "Changed how I think about the models I build." }, { who: "Year 3, CS", term: "Spring 2026", stars: 4, text: "Discussion-heavy, in a good way." }],
  },
  {
    code: "CS 174", dept: "CS", name: "Intro to Programming", credits: 4, hoursPerWeek: 9,
    days: "MWF", startTime: 9, endTime: 9.83, slot: "Mon/Wed/Fri 09:00–09:50", seats: 40, capacity: 120,
    instructor: "Dr. Priya Nair", rating: 4.6, reviewCount: 340, ratingDist: [70, 20, 7, 2, 1],
    sk: { ml: 0, stat: 0, sys: 0.15, alg: 0.2, prac: 0.35 },
    historyScore: 92, scheduleScore: 85, costScore: 80,
    historyReason: "No prerequisites — the entry point to the major",
    scheduleReason: "Short daily sessions that leave your afternoons open",
    costReason: "Included in the standard first-year course fee",
    prerequisites: [], requirementCategory: "CS core",
    blurb: "Variables, control flow, functions, and a first pass at object-oriented design, in Python.",
    syllabus: ["Variables, types and control flow", "Functions and recursion", "Lists, dicts and strings", "Files and simple I/O", "Classes and objects", "A small final project"],
    assessment: [{ name: "Labs", percent: 30 }, { name: "Programming assignments", percent: 40 }, { name: "Final exam", percent: 30 }],
    reviews: [{ who: "Year 1, CS", term: "Autumn 2025", stars: 5, text: "Office hours saved me twice a week." }, { who: "Year 1, CS", term: "Spring 2026", stars: 4, text: "Fast pace but the labs build real intuition." }],
  },
  {
    code: "CS 210", dept: "CS", name: "Data Structures & Algorithms I", credits: 4, hoursPerWeek: 10,
    days: "MWF", startTime: 10, endTime: 10.83, slot: "Mon/Wed/Fri 10:00–10:50", seats: 35, capacity: 100,
    instructor: "Dr. Priya Nair", rating: 4.5, reviewCount: 300, ratingDist: [65, 22, 8, 3, 2],
    sk: { ml: 0, stat: 0, sys: 0.05, alg: 0.3, prac: 0.1 },
    historyScore: 88, scheduleScore: 82, costScore: 80,
    historyReason: "Its only prerequisite is Intro to Programming",
    scheduleReason: "Three short morning sessions a week",
    costReason: "Standard tuition, no additional fees",
    prerequisites: ["CS 174"], requirementCategory: "CS core",
    blurb: "Stacks, queues, trees, hash tables and the algorithmic complexity to reason about all of them.",
    syllabus: ["Arrays, stacks and queues", "Linked structures", "Trees and traversals", "Hash tables", "Big-O in practice", "A capstone data-structure project"],
    assessment: [{ name: "Problem sets", percent: 45 }, { name: "Midterm", percent: 25 }, { name: "Final exam", percent: 30 }],
    reviews: [{ who: "Year 2, CS", term: "Autumn 2025", stars: 5, text: "The course that made everything after it easier." }, { who: "Year 2, CS", term: "Spring 2026", stars: 4, text: "Dense but extremely well organized." }],
  },
  {
    code: "CS 220", dept: "CS", name: "Discrete Mathematics", credits: 3, hoursPerWeek: 7,
    days: "TR", startTime: 9, endTime: 10.25, slot: "Tue & Thu 09:00–10:15", seats: 45, capacity: 100,
    instructor: "Dr. Felix Okafor", rating: 4.2, reviewCount: 210, ratingDist: [50, 28, 14, 5, 3],
    sk: { ml: 0, stat: 0.05, sys: 0, alg: 0.25, prac: 0 },
    historyScore: 90, scheduleScore: 85, costScore: 82,
    historyReason: "No prerequisites — a foundational math requirement",
    scheduleReason: "Two sessions a week, no lab component",
    costReason: "Standard tuition, no additional fees",
    prerequisites: [], requirementCategory: "CS core",
    blurb: "Logic, proof technique, sets, combinatorics and graph theory for computer scientists.",
    syllabus: ["Propositional and predicate logic", "Proof by induction", "Sets and functions", "Counting and combinatorics", "Graphs and trees", "A proof-writing workshop"],
    assessment: [{ name: "Problem sets", percent: 50 }, { name: "Midterm", percent: 20 }, { name: "Final exam", percent: 30 }],
    reviews: [{ who: "Year 2, CS", term: "Autumn 2025", stars: 4, text: "Puzzle-driven, not proof-drilling — I liked it." }, { who: "Year 1, Maths", term: "Spring 2026", stars: 4, text: "Good pacing for a first proofs course." }],
  },
  {
    code: "CS 250", dept: "CS", name: "Computer Organization", credits: 4, hoursPerWeek: 10,
    days: "MW", startTime: 13, endTime: 14.5, slot: "Mon & Wed 13:00–14:30", seats: 32, capacity: 80,
    instructor: "Dr. Grace Halvorsen", rating: 4.3, reviewCount: 180, ratingDist: [52, 28, 12, 5, 3],
    sk: { ml: 0, stat: 0, sys: 0.4, alg: 0, prac: 0.15 },
    historyScore: 85, scheduleScore: 78, costScore: 80,
    historyReason: "Its only prerequisite is Intro to Programming",
    scheduleReason: "Two long afternoon sessions with a lab block",
    costReason: "Small lab-kit fee for the assembly unit",
    prerequisites: ["CS 174"], requirementCategory: "CS core",
    blurb: "From logic gates to the instruction set: how the machine underneath your code actually works.",
    syllabus: ["Boolean logic and gates", "Number representation", "The instruction set", "The memory hierarchy", "Pipelining basics", "A small assembly project"],
    assessment: [{ name: "Labs", percent: 35 }, { name: "Midterm", percent: 25 }, { name: "Final exam", percent: 40 }],
    reviews: [{ who: "Year 2, CS", term: "Autumn 2025", stars: 4, text: "Finally understood what a CPU is actually doing." }, { who: "Year 2, CS", term: "Spring 2026", stars: 4, text: "Labs are long but worth it." }],
  },
  {
    code: "MATH 245", dept: "MATH", name: "Linear Algebra", credits: 3, hoursPerWeek: 7,
    days: "TR", startTime: 11, endTime: 12.25, slot: "Tue & Thu 11:00–12:15", seats: 40, capacity: 90,
    instructor: "Dr. Soo-Yun Park", rating: 4.4, reviewCount: 260, ratingDist: [55, 26, 12, 4, 3],
    sk: { ml: 0.15, stat: 0.1, sys: 0, alg: 0.15, prac: 0 },
    historyScore: 90, scheduleScore: 84, costScore: 82,
    historyReason: "No prerequisites beyond standard calculus placement",
    scheduleReason: "Two mid-morning sessions a week",
    costReason: "Standard tuition, no additional fees",
    prerequisites: [], requirementCategory: "Maths & statistics",
    blurb: "Vectors, matrices, eigenvalues and the geometry underneath most of machine learning.",
    syllabus: ["Vectors and vector spaces", "Matrix operations", "Systems of linear equations", "Determinants", "Eigenvalues and eigenvectors", "Applications in data and graphics"],
    assessment: [{ name: "Problem sets", percent: 40 }, { name: "Midterm", percent: 25 }, { name: "Final exam", percent: 35 }],
    reviews: [{ who: "Year 2, CS", term: "Autumn 2025", stars: 5, text: "You'll use this in every ML course after." }, { who: "Year 2, Maths", term: "Spring 2026", stars: 4, text: "Rigorous but fair grading." }],
  },
  {
    code: "STAT 200", dept: "STAT", name: "Probability", credits: 3, hoursPerWeek: 7,
    days: "MW", startTime: 9, endTime: 10.25, slot: "Mon & Wed 09:00–10:15", seats: 38, capacity: 90,
    instructor: "Dr. Renata Kolisi", rating: 4.3, reviewCount: 200, ratingDist: [50, 30, 13, 5, 2],
    sk: { ml: 0.05, stat: 0.3, sys: 0, alg: 0, prac: 0 },
    historyScore: 88, scheduleScore: 86, costScore: 82,
    historyReason: "No prerequisites beyond standard calculus placement",
    scheduleReason: "Two mid-morning sessions a week",
    costReason: "Standard tuition, no additional fees",
    prerequisites: [], requirementCategory: "Maths & statistics",
    blurb: "Random variables, distributions and the probabilistic reasoning behind every statistical model.",
    syllabus: ["Probability axioms", "Random variables", "Common distributions", "Expectation and variance", "The central limit theorem", "An applied simulation project"],
    assessment: [{ name: "Problem sets", percent: 40 }, { name: "Midterm", percent: 25 }, { name: "Final exam", percent: 35 }],
    reviews: [{ who: "Year 2, Data Science", term: "Autumn 2025", stars: 4, text: "Clear lectures, hard problem sets." }, { who: "Year 2, CS", term: "Spring 2026", stars: 4, text: "Sets you up well for Applied Statistics." }],
  },
  {
    code: "CS 361", dept: "CS", name: "Machine Learning Foundations", credits: 3, hoursPerWeek: 11,
    days: "MW", startTime: 13, endTime: 14.33, slot: "Mon & Wed 13:00–14:20", seats: 18, capacity: 60,
    instructor: "Dr. Amara Bequette", rating: 4.5, reviewCount: 212, ratingDist: [62, 26, 8, 3, 1],
    sk: { ml: 1, stat: 0.5, sys: 0.1, alg: 0.4, prac: 0.2 },
    historyScore: 84, scheduleScore: 72, costScore: 66,
    historyReason: "You'll need a confirmed grade in Linear Algebra, its prerequisite",
    scheduleReason: "It fits a Mon/Wed afternoon slot",
    costReason: "No lab fees",
    prerequisites: ["MATH 245", "CS 210"], requirementCategory: "CS electives",
    blurb: "Supervised and unsupervised learning from first principles, with weekly problem sets in Python and a final project on a real dataset.",
    syllabus: ["Loss functions and gradient descent", "Linear and logistic regression", "Regularisation, bias and variance", "Trees, forests and boosting", "Clustering and dimensionality reduction", "Evaluating models honestly"],
    assessment: [{ name: "Problem sets", percent: 40 }, { name: "Midterm", percent: 25 }, { name: "Final project", percent: 35 }],
    reviews: [{ who: "Year 3, CS", term: "Spring 2026", stars: 5, text: "Hard but fair — the final project taught me more than any lecture." }, { who: "Year 4, Maths", term: "Autumn 2025", stars: 4, text: "Great lectures, dense problem sets." }, { who: "Year 3, CS", term: "Autumn 2025", stars: 4, text: "Office hours saved me." }],
  },
  {
    code: "CS 340", dept: "CS", name: "Algorithms II", credits: 3, hoursPerWeek: 10,
    days: "TR", startTime: 13, endTime: 14.25, slot: "Tue & Thu 13:00–14:15", seats: 22, capacity: 60,
    instructor: "Dr. Grace Halvorsen", rating: 4.4, reviewCount: 250, ratingDist: [58, 27, 10, 3, 2],
    sk: { ml: 0.1, stat: 0, sys: 0, alg: 0.9, prac: 0.2 },
    historyScore: 88, scheduleScore: 80, costScore: 70,
    historyReason: "Both Data Structures and Discrete Math prerequisites confirmed",
    scheduleReason: "It fits your Tue/Thu availability",
    costReason: "No lab fees",
    prerequisites: ["CS 210", "CS 220"], requirementCategory: "CS core",
    blurb: "Graph algorithms, dynamic programming, NP-completeness and how to recognise a hard problem when you see one.",
    syllabus: ["Divide and conquer", "Graph traversal and shortest paths", "Dynamic programming", "Greedy algorithms", "NP-completeness", "Approximation and heuristics"],
    assessment: [{ name: "Problem sets", percent: 45 }, { name: "Midterm", percent: 25 }, { name: "Final exam", percent: 30 }],
    reviews: [{ who: "Year 3, CS", term: "Autumn 2025", stars: 5, text: "The most useful interview-prep course on campus." }, { who: "Year 3, CS", term: "Spring 2026", stars: 4, text: "Tough but the problem sets are excellent." }],
  },
  {
    code: "CS 372", dept: "CS", name: "Database Systems", credits: 3, hoursPerWeek: 9,
    days: "MF", startTime: 14, endTime: 15.25, slot: "Mon & Fri 14:00–15:15", seats: 20, capacity: 55,
    instructor: "Dr. Mateo Lindqvist", rating: 4.3, reviewCount: 190, ratingDist: [52, 30, 12, 4, 2],
    sk: { ml: 0, stat: 0.1, sys: 0.6, alg: 0.1, prac: 0.3 },
    historyScore: 82, scheduleScore: 75, costScore: 68,
    historyReason: "Computer Organization prerequisite confirmed",
    scheduleReason: "It fits a Mon/Fri afternoon slot",
    costReason: "No lab fees",
    prerequisites: ["CS 250"], requirementCategory: "CS core",
    blurb: "Relational modelling, SQL, transactions and the storage engines that make queries fast.",
    syllabus: ["Relational modelling", "SQL in depth", "Indexing and query plans", "Transactions and ACID", "Normalisation", "A schema-design project"],
    assessment: [{ name: "Labs", percent: 35 }, { name: "Midterm", percent: 25 }, { name: "Final project", percent: 40 }],
    reviews: [{ who: "Year 3, CS", term: "Autumn 2025", stars: 4, text: "Practical — I use this in my internship already." }, { who: "Year 3, Info Systems", term: "Spring 2026", stars: 4, text: "Good balance of theory and SQL practice." }],
  },
  {
    code: "CS 330", dept: "CS", name: "Software Engineering", credits: 3, hoursPerWeek: 10,
    days: "TR", startTime: 15, endTime: 16.25, slot: "Tue & Thu 15:00–16:15", seats: 24, capacity: 60,
    instructor: "Dr. Julia Marchetti", rating: 4.6, reviewCount: 230, ratingDist: [64, 24, 8, 2, 2],
    sk: { ml: 0, stat: 0, sys: 0.3, alg: 0.15, prac: 0.7 },
    historyScore: 80, scheduleScore: 74, costScore: 70,
    historyReason: "Data Structures prerequisite confirmed",
    scheduleReason: "It fits your Tue/Thu availability",
    costReason: "No lab fees",
    prerequisites: ["CS 210"], requirementCategory: "CS core",
    blurb: "Team-based development: version control, testing, code review and shipping software that outlives the term.",
    syllabus: ["Version control and branching", "Testing and CI", "Code review practice", "Architecture and design patterns", "Agile planning", "A semester-long team project"],
    assessment: [{ name: "Team project", percent: 55 }, { name: "Code reviews", percent: 20 }, { name: "Final presentation", percent: 25 }],
    reviews: [{ who: "Year 3, CS", term: "Autumn 2025", stars: 5, text: "Closest thing to a real job on campus." }, { who: "Year 3, CS", term: "Spring 2026", stars: 5, text: "Team project was genuinely fun." }],
  },
  {
    code: "CS 355", dept: "CS", name: "Human–Computer Interaction", credits: 3, hoursPerWeek: 8,
    days: "TF", startTime: 10, endTime: 11.25, slot: "Tue & Fri 10:00–11:15", seats: 26, capacity: 65,
    instructor: "Dr. Sena Haruna", rating: 4.4, reviewCount: 160, ratingDist: [55, 28, 11, 4, 2],
    sk: { ml: 0, stat: 0.1, sys: 0, alg: 0, prac: 0.5 },
    historyScore: 86, scheduleScore: 82, costScore: 75,
    historyReason: "Intro to Programming prerequisite confirmed",
    scheduleReason: "It fits your Tue/Fri availability",
    costReason: "No lab fees",
    prerequisites: ["CS 174"], requirementCategory: "CS electives",
    blurb: "Usability heuristics, prototyping and studio-style critique of interfaces you design and test on real users.",
    syllabus: ["Usability heuristics", "Low-fidelity prototyping", "User research methods", "Interaction design patterns", "Usability testing", "A studio critique final"],
    assessment: [{ name: "Design studio work", percent: 50 }, { name: "User testing report", percent: 25 }, { name: "Final critique", percent: 25 }],
    reviews: [{ who: "Year 3, CS", term: "Autumn 2025", stars: 4, text: "Changed how I think about interfaces." }, { who: "Year 2, Design", term: "Spring 2026", stars: 5, text: "Best studio course I've taken." }],
  },
  {
    code: "MATH 380", dept: "MATH", name: "Numerical Methods", credits: 3, hoursPerWeek: 8,
    days: "MW", startTime: 15, endTime: 16.25, slot: "Mon & Wed 15:00–16:15", seats: 20, capacity: 50,
    instructor: "Dr. Soo-Yun Park", rating: 4.2, reviewCount: 110, ratingDist: [45, 30, 16, 6, 3],
    sk: { ml: 0.1, stat: 0.2, sys: 0, alg: 0.3, prac: 0 },
    historyScore: 84, scheduleScore: 78, costScore: 72,
    historyReason: "Linear Algebra prerequisite confirmed",
    scheduleReason: "It fits a Mon/Wed afternoon slot",
    costReason: "No lab fees",
    prerequisites: ["MATH 245"], requirementCategory: "Maths & statistics",
    blurb: "Root-finding, interpolation and the floating-point reality of computing math on real hardware.",
    syllabus: ["Floating point and error", "Root-finding methods", "Interpolation", "Numerical integration", "Solving linear systems numerically", "Stability and conditioning"],
    assessment: [{ name: "Problem sets", percent: 45 }, { name: "Midterm", percent: 25 }, { name: "Final project", percent: 30 }],
    reviews: [{ who: "Year 3, Maths", term: "Autumn 2025", stars: 4, text: "Great complement to the ML sequence." }, { who: "Year 3, CS", term: "Spring 2026", stars: 4, text: "Small class, lots of instructor attention." }],
  },
  {
    code: "INFO 320", dept: "INFO", name: "Data Visualisation", credits: 3, hoursPerWeek: 8,
    days: "TR", startTime: 9, endTime: 10.25, slot: "Tue & Thu 09:00–10:15", seats: 22, capacity: 55,
    instructor: "Dr. Katarzyna Nowak", rating: 4.4, reviewCount: 150, ratingDist: [54, 29, 11, 4, 2],
    sk: { ml: 0.1, stat: 0.3, sys: 0, alg: 0, prac: 0.4 },
    historyScore: 85, scheduleScore: 80, costScore: 74,
    historyReason: "Probability prerequisite confirmed",
    scheduleReason: "It fits your Tue/Thu availability",
    costReason: "No lab fees",
    prerequisites: ["STAT 200"], requirementCategory: "CS electives",
    blurb: "Turning data into honest, legible charts and interactive dashboards people actually use.",
    syllabus: ["Perception and chart choice", "Working with real datasets", "Interactive dashboards", "Narrative and annotation", "Common chart distortions", "A public dashboard final"],
    assessment: [{ name: "Weekly charts", percent: 35 }, { name: "Dashboard project", percent: 45 }, { name: "Critique participation", percent: 20 }],
    reviews: [{ who: "Year 3, Data Science", term: "Autumn 2025", stars: 5, text: "I use these skills in every internship interview." }, { who: "Year 2, INFO", term: "Spring 2026", stars: 4, text: "Practical and portfolio-ready." }],
  },
  {
    code: "CS 410", dept: "CS", name: "Distributed Systems", credits: 3, hoursPerWeek: 12,
    days: "MW", startTime: 16, endTime: 17.33, slot: "Mon & Wed 16:00–17:20", seats: 16, capacity: 45,
    instructor: "Dr. Mateo Lindqvist", rating: 4.5, reviewCount: 140, ratingDist: [58, 26, 10, 4, 2],
    sk: { ml: 0, stat: 0, sys: 0.9, alg: 0.2, prac: 0.3 },
    historyScore: 78, scheduleScore: 65, costScore: 62,
    historyReason: "Requires both Computer Organization and Algorithms II confirmed",
    scheduleReason: "Late-afternoon slot, can crowd a heavy week",
    costReason: "Small cloud-credits fee for the project",
    prerequisites: ["CS 250", "CS 340"], requirementCategory: "CS electives",
    blurb: "Consensus, replication and the failure modes of systems that span more than one machine.",
    syllabus: ["The fallacies of distributed computing", "Consensus and Raft", "Replication and consistency", "Partitioning and sharding", "Fault tolerance", "A small distributed-systems build"],
    assessment: [{ name: "Labs", percent: 40 }, { name: "Midterm", percent: 25 }, { name: "Final project", percent: 35 }],
    reviews: [{ who: "Year 4, CS", term: "Autumn 2025", stars: 5, text: "Directly relevant to my platform-engineering internship." }, { who: "Year 4, CS", term: "Spring 2026", stars: 4, text: "Heavy workload but worth it." }],
  },
  {
    code: "CS 425", dept: "CS", name: "Computer Security", credits: 3, hoursPerWeek: 10,
    days: "TR", startTime: 16, endTime: 17.25, slot: "Tue & Thu 16:00–17:15", seats: 18, capacity: 45,
    instructor: "Dr. Elias Vasquez", rating: 4.5, reviewCount: 170, ratingDist: [60, 25, 10, 3, 2],
    sk: { ml: 0, stat: 0, sys: 0.6, alg: 0.2, prac: 0.5 },
    historyScore: 80, scheduleScore: 68, costScore: 65,
    historyReason: "Computer Organization prerequisite confirmed",
    scheduleReason: "Late-afternoon slot, can crowd a heavy week",
    costReason: "No lab fees",
    prerequisites: ["CS 250"], requirementCategory: "CS electives",
    blurb: "Threat modelling, cryptography fundamentals, and finding (then fixing) real vulnerabilities.",
    syllabus: ["Threat modelling", "Cryptography fundamentals", "Web application vulnerabilities", "Network security", "Secure coding practice", "A capture-the-flag final"],
    assessment: [{ name: "Labs", percent: 40 }, { name: "Midterm", percent: 25 }, { name: "Capture-the-flag final", percent: 35 }],
    reviews: [{ who: "Year 4, CS", term: "Autumn 2025", stars: 5, text: "The CTF final is the best exam format I've had." }, { who: "Year 3, CS", term: "Spring 2026", stars: 4, text: "Fast-paced, worth every hour." }],
  },
  {
    code: "CS 445", dept: "CS", name: "Natural Language Processing", credits: 3, hoursPerWeek: 11,
    days: "MF", startTime: 13, endTime: 14.33, slot: "Mon & Fri 13:00–14:20", seats: 14, capacity: 40,
    instructor: "Dr. Amara Bequette", rating: 4.6, reviewCount: 95, ratingDist: [65, 24, 7, 3, 1],
    sk: { ml: 0.9, stat: 0.6, sys: 0.1, alg: 0.3, prac: 0.2 },
    historyScore: 76, scheduleScore: 68, costScore: 60,
    historyReason: "Requires Machine Learning Foundations confirmed",
    scheduleReason: "It fits a Mon/Fri afternoon slot",
    costReason: "No lab fees",
    prerequisites: ["CS 361"], requirementCategory: "CS electives",
    blurb: "From tokenisation to transformers: how machines model and generate language.",
    syllabus: ["Tokenisation and embeddings", "Sequence models", "Attention and transformers", "Language model evaluation", "Fine-tuning and adaptation", "A final NLP project"],
    assessment: [{ name: "Problem sets", percent: 35 }, { name: "Midterm", percent: 25 }, { name: "Final project", percent: 40 }],
    reviews: [{ who: "Year 4, CS", term: "Autumn 2025", stars: 5, text: "Cutting-edge material, extremely well taught." }, { who: "Year 4, CS", term: "Spring 2026", stars: 4, text: "Fast-moving field, course kept up." }],
  },
  {
    code: "CS 450", dept: "CS", name: "Senior Capstone Project", credits: 4, hoursPerWeek: 14,
    days: "F", startTime: 13, endTime: 16, slot: "Fri 13:00–16:00", seats: 30, capacity: 60,
    instructor: "Dr. Julia Marchetti", rating: 4.7, reviewCount: 130, ratingDist: [70, 20, 7, 2, 1],
    sk: { ml: 0.1, stat: 0, sys: 0.3, alg: 0.2, prac: 0.9 },
    historyScore: 70, scheduleScore: 55, costScore: 58,
    historyReason: "Requires Software Engineering confirmed",
    scheduleReason: "One long weekly block that can crowd a heavy term",
    costReason: "No additional fees beyond standard tuition",
    prerequisites: ["CS 330"], requirementCategory: "CS electives",
    blurb: "A full term shipping one real project end to end, from proposal to a public demo day.",
    syllabus: ["Proposal and scoping", "Architecture review", "Sprint 1 build", "Mid-term critique", "Sprint 2 build", "Public demo day"],
    assessment: [{ name: "Milestones", percent: 40 }, { name: "Final build", percent: 40 }, { name: "Demo day", percent: 20 }],
    reviews: [{ who: "Year 4, CS", term: "Autumn 2025", stars: 5, text: "The single most useful course for my job search." }, { who: "Year 4, CS", term: "Spring 2026", stars: 5, text: "Demo day was worth every late night." }],
  },
  {
    code: "STAT 310", dept: "STAT", name: "Applied Statistics", credits: 3, hoursPerWeek: 6,
    days: "TR", startTime: 8, endTime: 9.25, slot: "Tue & Thu 08:00–09:15", seats: 30, capacity: 70,
    instructor: "Dr. Renata Kolisi", rating: 4.5, reviewCount: 180, ratingDist: [58, 27, 10, 3, 2],
    sk: { ml: 0.2, stat: 0.9, sys: 0.1, alg: 0.2, prac: 0.1 },
    historyScore: 90, scheduleScore: 88, costScore: 70,
    historyReason: "Probability prerequisite confirmed",
    scheduleReason: "Two early sessions that leave the rest of your day free",
    costReason: "No lab fees",
    prerequisites: ["STAT 200"], requirementCategory: "Maths & statistics",
    blurb: "Regression, inference and experiment design — the statistical toolkit behind most applied data work.",
    syllabus: ["Estimation and confidence intervals", "Hypothesis testing", "Linear regression", "ANOVA", "Experiment design", "A capstone analysis project"],
    assessment: [{ name: "Problem sets", percent: 40 }, { name: "Midterm", percent: 25 }, { name: "Final project", percent: 35 }],
    reviews: [{ who: "Year 3, Data Science", term: "Autumn 2025", stars: 5, text: "The most directly useful stats course I've taken." }, { who: "Year 3, CS", term: "Spring 2026", stars: 4, text: "Early start time, but worth it." }],
  },
];

// ── Degree-requirement buckets. "have" is never stored — it's derived at
// query time from the student's confirmed transcript against these. ──
const PROGRAM_REQUIREMENTS = [
  { program: "BS Computer Science", name: "CS core", creditsNeed: 40 },
  { program: "BS Computer Science", name: "CS electives", creditsNeed: 24 },
  { program: "BS Computer Science", name: "Maths & statistics", creditsNeed: 20 },
  { program: "BS Computer Science", name: "General education", creditsNeed: 36 },
];

const NOTIFICATIONS = [
  { kind: "Deadline", title: "Priority registration opens", body: "Your slot opens 14 days from now, at 07:00. Saved courses can be registered in one click.", daysFromNow: 14 },
  { kind: "Seats", title: "CS 340 is filling up", body: "Algorithms II has fewer than 25% of seats left. Register soon if it's on your list.", daysFromNow: null },
  { kind: "Deadline", title: "Advising appointment reminder", body: "Your advising check-in is coming up — bring your saved-course list.", daysFromNow: 5 },
  { kind: "New", title: "A new course matches your goal", body: "Natural Language Processing was just added to the catalogue and scores well against your career goal.", daysFromNow: null },
  { kind: "Deadline", title: "Add/drop deadline", body: "Last day to add or drop a course without it appearing on your transcript.", daysFromNow: 21 },
];

function gradeFor(pct) {
  // Deterministic-looking letter grade from a course's historyScore, purely for seed flavor.
  if (pct >= 90) return "A";
  if (pct >= 85) return "A-";
  if (pct >= 80) return "B+";
  if (pct >= 75) return "B";
  return "B-";
}

async function main() {
  // Careers
  for (const c of CAREERS) {
    await prisma.career.upsert({
      where: { key: c.key },
      update: { name: c.name, desc: c.desc, tMl: c.t.ml, tStat: c.t.stat, tSys: c.t.sys, tAlg: c.t.alg, tPrac: c.t.prac },
      create: { key: c.key, name: c.name, desc: c.desc, tMl: c.t.ml, tStat: c.t.stat, tSys: c.t.sys, tAlg: c.t.alg, tPrac: c.t.prac },
    });
  }

  // Instructors
  const instructorIds = {};
  for (const [name, info] of Object.entries(INSTRUCTORS)) {
    const existing = await prisma.instructor.findFirst({ where: { name } });
    const row = existing
      ? await prisma.instructor.update({ where: { id: existing.id }, data: { ...info } })
      : await prisma.instructor.create({ data: { name, ...info } });
    instructorIds[name] = row.id;
  }

  // Courses (+ nested reviews)
  const courseIds = {};
  for (const c of COURSES) {
    const data = {
      code: c.code,
      dept: c.dept,
      name: c.name,
      credits: c.credits,
      hoursPerWeek: c.hoursPerWeek,
      days: c.days,
      startTime: c.startTime,
      endTime: c.endTime,
      slot: c.slot,
      seats: c.seats,
      capacity: c.capacity,
      instructorId: instructorIds[c.instructor],
      rating: c.rating,
      reviewCount: c.reviewCount,
      ratingDist: c.ratingDist,
      skMl: c.sk.ml, skStat: c.sk.stat, skSys: c.sk.sys, skAlg: c.sk.alg, skPrac: c.sk.prac,
      historyScore: c.historyScore,
      scheduleScore: c.scheduleScore,
      costScore: c.costScore,
      historyReason: c.historyReason,
      scheduleReason: c.scheduleReason,
      costReason: c.costReason,
      prerequisites: c.prerequisites,
      blurb: c.blurb,
      syllabus: c.syllabus,
      assessment: c.assessment,
      requirementCategory: c.requirementCategory,
    };
    const row = await prisma.course.upsert({ where: { code: c.code }, update: data, create: data });
    courseIds[c.code] = row.id;

    await prisma.review.deleteMany({ where: { courseId: row.id } });
    if (c.reviews?.length) {
      await prisma.review.createMany({ data: c.reviews.map((r) => ({ ...r, courseId: row.id })) });
    }
  }

  // Program requirements
  for (const r of PROGRAM_REQUIREMENTS) {
    await prisma.programRequirement.upsert({
      where: { program_name: { program: r.program, name: r.name } },
      update: { creditsNeed: r.creditsNeed },
      create: r,
    });
  }

  // Notifications (global; per-user read state lives in NotificationRead)
  const notifIds = [];
  for (const n of NOTIFICATIONS) {
    const existing = await prisma.notification.findFirst({ where: { title: n.title } });
    const occursAt = n.daysFromNow == null ? null : new Date(Date.now() + n.daysFromNow * 86400000);
    const row = existing
      ? await prisma.notification.update({ where: { id: existing.id }, data: { kind: n.kind, body: n.body, occursAt } })
      : await prisma.notification.create({ data: { kind: n.kind, title: n.title, body: n.body, occursAt } });
    notifIds.push(row.id);
  }

  // Demo account
  const passwordHash = await bcrypt.hash("learnix-demo", 10);
  const user = await prisma.user.upsert({
    where: { email: "demo@learnix.app" },
    update: {},
    create: { name: "Demo Student", email: "demo@learnix.app", passwordHash, program: "BS Computer Science", year: 3 },
  });

  await prisma.profile.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      userId: user.id,
      careerKey: "ml",
      interests: ["Machine learning", "Statistics"],
      hours: 30,
      offDays: ["F"],
      onboarded: true,
      largeText: false,
    },
  });

  await prisma.weightsProfile.upsert({
    where: { userId: user.id },
    update: {},
    create: { userId: user.id, goals: 30, gap: 25, history: 20, schedule: 15, cost: 10 },
  });

  await prisma.notificationSettings.upsert({
    where: { userId: user.id },
    update: {},
    create: { userId: user.id, deadlines: true, seats: true, newCourses: true, email: false },
  });

  // Demo transcript: the foundational courses a Year-3 CS student would have finished by now.
  const TAKEN = ["WRIT 110", "PHIL 120", "CS 174", "CS 210", "CS 220", "CS 250", "MATH 245", "STAT 200"];
  for (const code of TAKEN) {
    const course = COURSES.find((c) => c.code === code);
    await prisma.transcriptEntry.upsert({
      where: { userId_courseId: { userId: user.id, courseId: courseIds[code] } },
      update: {},
      create: {
        userId: user.id,
        courseId: courseIds[code],
        grade: gradeFor(course.historyScore),
        term: "Spring 2026",
        confirmed: true,
      },
    });
  }

  // Demo saved courses
  for (const code of ["STAT 310", "CS 340"]) {
    await prisma.savedCourse.upsert({
      where: { userId_courseId: { userId: user.id, courseId: courseIds[code] } },
      update: {},
      create: { userId: user.id, courseId: courseIds[code] },
    });
  }

  // Mark the "new course match" notification read, matching the design's default state.
  const newCourseNotif = await prisma.notification.findFirst({ where: { title: "A new course matches your goal" } });
  if (newCourseNotif) {
    await prisma.notificationRead.upsert({
      where: { userId_notificationId: { userId: user.id, notificationId: newCourseNotif.id } },
      update: {},
      create: { userId: user.id, notificationId: newCourseNotif.id },
    });
  }

  console.log(`Seeded ${CAREERS.length} careers, ${Object.keys(INSTRUCTORS).length} instructors, ${COURSES.length} courses, ${PROGRAM_REQUIREMENTS.length} requirement rows, ${NOTIFICATIONS.length} notifications.`);
  console.log("Demo account -> demo@learnix.app / learnix-demo");
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
