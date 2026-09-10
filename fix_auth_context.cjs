const fs = require('fs');
let content = fs.readFileSync('src/contexts/AuthContext.tsx', 'utf-8');

content = content.replace(
  /throw new Error\("Account configuration error. User record not found in database. If you are setting up the platform, use the 'Initialize Platform' link."\);/,
  `throw new Error("Account configuration error. User record not found in database.");`
);

fs.writeFileSync('src/contexts/AuthContext.tsx', content);
