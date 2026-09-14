const fs = require('fs');
let content = fs.readFileSync('src/types/index.ts', 'utf-8');
content = content.replace(
    /export interface Homework \{[\s\S]*?createdAt: string;\n\}/g,
    `export interface Homework {\n  id?: string;\n  schoolId: string;\n  teacherId: string;\n  teacherName?: string;\n  class: string;\n  section: string;\n  subject: string;\n  title: string;\n  description: string;\n  assignedDate?: string;\n  dueDate: string;\n  priority?: string;\n  status: "ACTIVE" | "ARCHIVED" | "PUBLISHED" | "CLOSED";\n  createdAt: string;\n  updatedAt?: string;\n}`
);
fs.writeFileSync('src/types/index.ts', content);
