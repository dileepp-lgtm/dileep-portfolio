/* ============================================================
   Knowledge base for the portfolio assistant.
   Sourced from Dileep's CV + the work shown on this page.
   Edit freely — `k` are matching keywords, `a` is the answer.
   ============================================================ */
export const AGENT_KB = {
  /* used as the system prompt when a real LLM endpoint is configured */
  profile: [
    "You are the portfolio assistant for Dileep P, a Senior Visual Designer based in Bangalore, India.",
    "Answer in first person as Dileep's assistant (refer to him as 'Dileep' or 'he'), warm and concise — 2-4 sentences.",
    "Only use the facts below. If something isn't covered, say you're not sure and point them to dilee.live@gmail.com.",
    "",
    "FACTS:",
    "- Senior Visual Designer at Open Financial Technologies Pvt. Ltd., Dec 2020 – present.",
    "- 13+ years across product companies and advertising agencies.",
    "- Based in Bangalore, India. Raised in Kannur, Kerala.",
    "- Available for freelance and full-time work.",
    "- Email dilee.live@gmail.com · Mobile +91 97423 20825 · Behance behance.net/dilee",
    "- Earlier: Art Director at Homebliss & Unigage (Jul 2016 – Apr 2020), led a 4-member creative team across an interior design firm and an ad agency.",
    "- Earlier: Senior Visualiser at Origami Creative, Bangalore (Aug 2012 – Mar 2016), 360° campaigns for Accenture, ITC Infotech and Mindtree.",
    "- Fintech products he designs for: Open Money, Zwitch, Open Capital, Open Books, Open Accountant, Optotax.",
    "- Disciplines: brand identity, marketing campaigns, art direction, social and carousel creatives, landing pages and websites, email and newsletters, sales and pitch decks, print and brochures, outdoor hoardings, motion graphics, AI-assisted design workflows.",
    "- Notable campaign work: Open x KKR, Open x Sunrisers Hyderabad, Open x RCB (IPL, official digital banking partner), plus Wrogn, Duroflex, BlueStone, Amazon, Scripbox and Zolostays from his agency years.",
    "- Tools: Claude, Adobe Photoshop, Illustrator, InDesign, After Effects, Premiere Pro, Firefly, Figma.",
    "- Education: B.Com from Calicut University; Diploma in Animation.",
    "- Design philosophy: a balance of bold elegance and minimalist impact — 'vivid yet cultivated, minimal but roaring'. Loves colour but believes in the narrative strength of a well-crafted greyscale image.",
    "- Interests: designing and drawing, photography, football."
  ].join("\n"),

  /* shown as tappable chips when the panel opens */
  suggestions: [
    "What does Dileep do?",
    "How many years of experience?",
    "Which tools does he use?",
    "Is he available for work?",
    "Show me his best work",
    "How do I contact him?"
  ],

  greeting: "Hi! I'm Dileep's portfolio assistant. Ask me about his experience, the work on this page, the tools he uses, or how to get in touch.",

  fallback: "I'm not certain about that one. The quickest route is to email Dileep directly at <a href=\"mailto:dilee.live@gmail.com\">dilee.live@gmail.com</a> — or use the message box below and it'll open a pre-filled email.",

  entries: [
    { k:["who is","who's","what do you do","about him","yourself","introduce","dileep","designer","bio"],
      a:"Dileep P is a Senior Visual Designer with <strong>13+ years</strong> across product companies and advertising agencies. He's currently at <strong>Open Financial Technologies</strong> in Bangalore, where he creates 360° creative — brand identity, campaigns, product marketing, websites, decks and motion — across six fintech products." },

    { k:["experience","years","how long","seniority","career"],
      a:"<strong>13+ years</strong> in total: 8 years in advertising, and since Dec 2020 in fintech at Open Financial Technologies. Before that he was Art Director at Homebliss &amp; Unigage (2016–2020) and Senior Visualiser at Origami Creative (2012–2016)." },

    { k:["current","now","open financial","present job","where does he work","employer"],
      a:"He's <strong>Senior Visual Designer at Open Financial Technologies</strong> (Dec 2020 – present), leading end-to-end visual work for Open Money, Zwitch, Open Capital, Open Books, Open Accountant and Optotax." },

    { k:["previous","past","before","history","homebliss","unigage","origami","agency","art director"],
      a:"Two roles before fintech:<br>• <strong>Art Director, Homebliss &amp; Unigage</strong> (2016–2020) — led a 4-member team across an interior design firm and an ad agency.<br>• <strong>Senior Visualiser, Origami Creative</strong> (2012–2016) — 360° campaigns for Accenture, ITC Infotech and Mindtree." },

    { k:["tool","software","stack","adobe","figma","photoshop","illustrator","ai tools","claude"],
      a:"Claude, Adobe Photoshop, Illustrator, InDesign, After Effects, Premiere Pro, Firefly and Figma — plus AI-assisted workflows built into his day-to-day process." },

    { k:["skill","expertise","specialise","specialize","discipline","services","what can he do"],
      a:"Brand identity, marketing campaigns, art direction, social and carousel creatives, landing pages and websites, email and newsletters, sales and pitch decks, print and brochures, outdoor hoardings, motion graphics, and AI-assisted design workflows." },

    { k:["available","availability","hire","hiring","freelance","full time","fulltime","open to work","opportunit"],
      a:"Yes — he's <strong>available for both freelance and full-time</strong> roles. Email <a href=\"mailto:dilee.live@gmail.com\">dilee.live@gmail.com</a> and he'll get back to you." },

    { k:["contact","email","reach","get in touch","message","talk","connect"],
      a:"Email <a href=\"mailto:dilee.live@gmail.com\">dilee.live@gmail.com</a>, call <a href=\"tel:+919742320825\">+91 97423 20825</a>, or browse <a href=\"https://www.behance.net/dilee\" target=\"_blank\" rel=\"noopener\">behance.net/dilee</a>. You can also type a message below and it'll open a pre-filled email." },

    { k:["phone","mobile","call","number","whatsapp","contact number"],
      a:"You can reach him on <a href=\"tel:+919742320825\">+91 97423 20825</a>, or email <a href=\"mailto:dilee.live@gmail.com\">dilee.live@gmail.com</a>." },

    { k:["resume","cv","download"],
      a:"You can <a href=\"assets/files/Dileep-P-Resume.pdf\" download>download his resume here</a> — it's also the <em>Resume</em> button in the hero and contact sections." },

    { k:["location","where","based","city","bangalore","relocate","remote"],
      a:"He's based in <strong>Bangalore, India</strong>, and originally from Kannur, Kerala." },

    { k:["product","fintech","open money","zwitch","open capital","open books","accountant","optotax"],
      a:"Six fintech products at Open: <strong>Open Money</strong> (SME banking), <strong>Zwitch</strong> (embedded finance), <strong>Open Capital</strong> (business credit), <strong>Open Books</strong> (accounting), <strong>Open Accountant</strong> and <strong>Optotax</strong> (tax filing)." },

    { k:["best work","portfolio","show","case study","project","examples","see work"],
      a:"Head to <a href=\"/work\">Selected Work</a> — it's grouped by discipline, and every cover opens full screen so you can scroll the whole set. Highlights: the IPL campaigns with <strong>KKR</strong>, <strong>Sunrisers Hyderabad</strong> and <strong>RCB</strong>, the Zwitch and HDFC/HSBC/SBI decks, and the Wrogn brand campaign." },

    { k:["ipl","cricket","kkr","srh","sunrisers","rcb","sponsor","hoarding","billboard","outdoor"],
      a:"Open was <strong>official digital banking partner</strong> for KKR, Sunrisers Hyderabad and RCB. Dileep designed the hoardings, standees, newspaper full-pagers and social creatives for those campaigns — see the <em>Outdoor</em> and <em>Print</em> sections." },

    { k:["deck","presentation","pitch","sales deck","hdfc","hsbc","sbi"],
      a:"He designs sales and pitch decks for banks and enterprise partners — HDFC MyBusiness, HSBC, SBI, plus Zwitch product decks, Card Programme and Supply Chain Finance. They're in the <em>Presentations</em> section, viewable full screen." },

    { k:["motion","video","animation","after effects","film"],
      a:"Yes — motion graphics and campaign films, including Diwali, Eid and International Yoga Day films for Open. See the <em>Motion</em> section." },

    { k:["brand","identity","logo","branding"],
      a:"Brand identity is his core strength — building brands from the ground up and revitalising established ones. Recent examples include the AI-assisted work for <strong>Caramel</strong> and <strong>Fethr</strong>." },

    { k:["education","study","degree","college","university","qualification"],
      a:"<strong>B.Com</strong> from Calicut University, plus a <strong>Diploma in Animation</strong>." },

    { k:["philosophy","approach","process","style","how do you work","method"],
      a:"His philosophy: a balance of <strong>bold elegance and minimalist impact</strong> — \"vivid yet cultivated, minimal but roaring\". He loves colour but believes in the narrative strength of a well-crafted greyscale image. Process runs Discover → Strategy → Design → Launch → Measure &amp; Iterate." },

    { k:["ai","artificial intelligence","genai","midjourney","firefly","workflow"],
      a:"AI is part of his daily workflow — Claude and Adobe Firefly for ideation, art direction and asset generation. The <strong>Caramel</strong> and <strong>Fethr</strong> campaigns were built with AI-assisted design." },

    { k:["interest","hobby","hobbies","outside work","football","photography"],
      a:"Designing and drawing, photography, and football." },

    { k:["team","lead","manage","leadership","mentor"],
      a:"Yes — he led a 4-member creative team as Art Director at Homebliss &amp; Unigage, managing a dual role across two companies, and now works across multiple business units at Open." },

    { k:["client","brands","worked with","companies"],
      a:"From his agency years: <strong>Accenture, ITC Infotech, Mindtree, Wrogn, Duroflex, BlueStone, Amazon, Scripbox, Zolostays</strong> and Kerala Runners. In fintech: the six Open products, plus bank partners like HDFC, HSBC and SBI." },

    { k:["salary","rate","cost","price","charge","budget"],
      a:"Rates depend on scope and engagement type. Email <a href=\"mailto:dilee.live@gmail.com\">dilee.live@gmail.com</a> with a bit about the project and he'll come back with a figure." },

    { k:["hello","hi","hey","good morning","good evening","namaste"],
      a:"Hello! Ask me anything about Dileep's experience, the work on this page, or how to reach him." },

    { k:["thanks","thank you","thankyou","great","cool","nice","awesome"],
      a:"Happy to help! If you'd like to take it further, <a href=\"mailto:dilee.live@gmail.com\">drop him an email</a>." }
  ]
};
