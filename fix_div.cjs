const fs = require('fs');

function fixFile(file, buttonText) {
    let content = fs.readFileSync(file, 'utf-8');
    
    // Add the missing closing div
    content = content.replace(
        new RegExp(`<Plus className="w-5 h-5" \\/> ${buttonText}\\s*<\\/button>\\s*<\\/div>`),
        `<Plus className="w-5 h-5" /> ${buttonText}\n        </button>\n        </div>\n      </div>`
    );
    
    fs.writeFileSync(file, content);
}

fixFile('src/pages/admin/AdminStudents.tsx', 'Add Student');
fixFile('src/pages/admin/AdminTeachers.tsx', 'Add Teacher');
