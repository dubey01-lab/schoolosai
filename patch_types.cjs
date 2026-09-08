const fs = require('fs');
let types = fs.readFileSync('src/types/index.ts', 'utf8');

const newTypes = `
export interface ClassRecord {
  id?: string;
  schoolId: string;
  name: string;
  status: "ACTIVE" | "INACTIVE";
  createdAt: string;
  createdBy: string;
}

export interface Section {
  id?: string;
  schoolId: string;
  classId: string;
  name: string;
  status: "ACTIVE" | "INACTIVE";
  createdAt: string;
  createdBy: string;
}

export interface Subject {
  id?: string;
  schoolId: string;
  name: string;
  classId?: string; // Optional if generic across school
  status: "ACTIVE" | "INACTIVE";
  createdAt: string;
  createdBy: string;
}
`;

fs.writeFileSync('src/types/index.ts', types + '\n' + newTypes);
console.log('Types updated');
