// Export one article from src/lib/insights.ts as paste-ready Markdown.
// node social/tools/blog-export.cjs <slug> "<publish date label>" > out.md
const fs=require('fs');const [slug,when]=process.argv.slice(2);const src=fs.readFileSync('src/lib/insights.ts','utf8');
const i=src.indexOf(`slug: "${slug}"`);if(i<0)throw new Error('no article '+slug);const s=src.lastIndexOf("{",i);
let d=0,e=s;for(;e<src.length;e++){if(src[e]=="{")d++;if(src[e]=="}"){d--;if(!d)break}}
const p=eval("("+src.slice(s,e+1)+")");
let o=`# Blog post to publish ${when}\n\nCopy each field below into the website CMS.\n\n| Field | Value |\n|---|---|\n| **URL** | valdagroup.com/insights/${p.slug} (the slug must be exactly \`${p.slug}\`, because the social posts link to it) |\n| **Title** | ${p.title} |\n| **Meta description** | ${p.description} |\n| **Category** | ${p.category} |\n| **Date** | ${when} |\n| **Read time** | ${p.readMins} min |\n| **Cover image** | ${p.cover} (in this repo: public${p.cover}) |\n| **Excerpt** | ${p.excerpt} |\n| **Keywords** | ${(p.keywords||[]).join(", ")} |\n\n---\n\n# ${p.title}\n\n`;
for(const b of p.body){if(b.type=="p")o+=b.text+"\n\n";if(b.type=="h2")o+="## "+b.text+"\n\n";if(b.type=="quote")o+="> "+b.text+"\n\n";if(b.type=="ul")o+=b.items.map(x=>"- "+x).join("\n")+"\n\n";}
if(p.faqs)o+="## FAQ\n\n"+p.faqs.map(f=>"**"+f.q+"**\n\n"+f.a).join("\n\n")+"\n";
process.stdout.write(o);
