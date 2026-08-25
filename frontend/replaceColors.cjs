const fs = require('fs');
const path = require('path');

const files = [
    'src/pages/Home.jsx',
    'src/components/Navbar.jsx',
    'src/components/ProductCard.jsx'
];

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    
    // Backgrounds
    content = content.replace(/bg-rose-500/g, 'bg-primary');
    content = content.replace(/bg-rose-600/g, 'bg-primary');
    content = content.replace(/bg-rose-50/g, 'bg-primary/10');
    content = content.replace(/bg-rose-100/g, 'bg-primary/20');
    content = content.replace(/bg-amber-50/g, 'bg-accent/10');
    content = content.replace(/bg-amber-100/g, 'bg-accent/20');
    content = content.replace(/bg-rose-900/g, 'bg-primary-dark'); // Actually we don't have primary-dark, let's use hover:opacity-90 instead, but let's just use bg-primary
    content = content.replace(/bg-rose-900/g, 'bg-primary');
    content = content.replace(/bg-\[\#faf9f6\]/g, 'bg-surface');

    // Text
    content = content.replace(/text-rose-500/g, 'text-primary');
    content = content.replace(/text-rose-600/g, 'text-primary');
    content = content.replace(/text-rose-700/g, 'text-primary');
    content = content.replace(/text-rose-200/g, 'text-accent');
    content = content.replace(/text-rose-300/g, 'text-accent');
    content = content.replace(/text-rose-400/g, 'text-accent');
    content = content.replace(/text-amber-600/g, 'text-accent');

    // Borders & Rings
    content = content.replace(/border-rose-50/g, 'border-primary/10');
    content = content.replace(/border-rose-100/g, 'border-primary/20');
    content = content.replace(/border-rose-300/g, 'border-accent');
    content = content.replace(/ring-rose-200/g, 'ring-accent');

    // Shadows
    content = content.replace(/shadow-rose-900\/5/g, 'shadow-primary/10');

    fs.writeFileSync(file, content);
    console.log(`Updated ${file}`);
});
