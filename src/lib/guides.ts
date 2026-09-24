// Original guides. Country facts are limited to what the linked official sources state.
export interface Guide {
  slug: string;
  title: string;
  description: string;
  updated: string; // YYYY-MM-DD, when the content (and its sources) were last reviewed
  sections: { heading: string; body: string[] }[];
  sources?: { label: string; url: string }[];
  related?: { href: string; label: string }[];
}

export const GUIDES: Guide[] = [
  {
    slug: "how-to-find-masters-scholarships",
    title: "How to find Master's scholarships that actually exist",
    description: "A practical method for finding real Master's funding, starting from official sources instead of scholarship blogs.",
    updated: "2026-09-24",
    sections: [
      { heading: "Start with the programme, not the scholarship", body: [
        "Most Master's funding is tied to admission: a university offers a tuition waiver or grant to students it admits to a specific programme. Searching for \"fully funded scholarships\" first usually leads to lists that are out of date or copied between blogs.",
        "Pick three to six programmes you would genuinely attend, then open each programme's official page and look for sections called Tuition fees, Scholarships, Funding or Financial aid. Note whether you apply for funding with your admission application or separately.",
      ]},
      { heading: "Then check the national and European layer", body: [
        "Many countries run an official study portal that explains fees and national schemes for international students, for example Study in Finland or Study in Denmark. Joint European Master's programmes are listed in the official Erasmus Mundus catalogue, where each programme publishes its own scholarship rules.",
        "Government schemes often have their own portal and a single call per year. Read the call text itself, not a summary of it.",
      ]},
      { heading: "Record what the source says, and when you read it", body: [
        "For each opportunity, write down the official URL, the funding components, the eligible nationalities, the official deadline and the date you checked. If the page does not yet show dates for the next cycle, record that the deadline is not announced. Don't reuse last year's date.",
        "This is the same standard this site uses: a scholarship only appears here once someone has checked it against its official page.",
      ]},
      { heading: "Warning signs", body: [
        "Be careful with posts that promise guaranteed funding, ask you to pay to apply for a scholarship, or can't link to an official page. When the official page and a blog disagree, the official page wins.",
      ]},
    ],
    sources: [
      { label: "Erasmus Mundus catalogue (European Commission)", url: "https://www.eacea.ec.europa.eu/scholarships/erasmus-mundus-catalogue_en" },
      { label: "Study in Finland: funding your studies", url: "https://www.studyinfinland.fi/funding-your-studies" },
      { label: "Study in Denmark: scholarships", url: "https://studyindenmark.dk/study-options/scholarships" },
    ],
    related: [{ href: "/search", label: "Search verified scholarships" }, { href: "/guides/scholarship-application-checklist", label: "Application checklist" }],
  },
  {
    slug: "fully-funded-vs-tuition-scholarships",
    title: "Fully funded vs tuition-only scholarships: what's the difference?",
    description: "How to read what a scholarship really covers, and why a 100% tuition waiver is not the same as full funding.",
    updated: "2026-09-24",
    sections: [
      { heading: "The components of funding", body: [
        "A scholarship can cover some or all of: tuition fees, a living stipend, accommodation, health insurance and travel. Official pages usually list these separately. Read each one rather than relying on the title.",
      ]},
      { heading: "How this site labels funding", body: [
        "Fully funded: the official source confirms full tuition AND substantial living support, such as a stipend or accommodation.",
        "100% tuition: tuition is fully covered, but living costs are not. You still need to show you can pay for rent, food and insurance, which visa authorities often ask you to prove.",
        "Partial (25%, 50%, 75% or another share): a published percentage of tuition is covered.",
        "Tuition waiver or other funding: a fee reduction or grant of a published amount.",
      ]},
      { heading: "Do the real cost calculation", body: [
        "Take the official tuition fee, subtract what the scholarship covers, then add living costs for your city for the full duration. Where you can, use the official living-cost estimate from the university or the national study portal. That total is what you actually need to fund.",
        "Study in Finland, for example, notes that university scholarships there usually cover tuition only, not living costs. It's a useful reminder to check what a waiver leaves you to pay.",
      ]},
    ],
    sources: [{ label: "Study in Finland: funding your studies", url: "https://www.studyinfinland.fi/funding-your-studies" }],
    related: [{ href: "/search?funding=fully_funded", label: "Verified fully funded scholarships" }],
  },
  {
    slug: "how-international-students-apply",
    title: "How international students apply to universities abroad",
    description: "The usual sequence from choosing programmes to visa, and which steps are official.",
    updated: "2026-09-24",
    sections: [
      { heading: "The typical sequence", body: [
        "1. Shortlist programmes and read their official entry requirements. 2. Check the application route: some countries use a national portal, others apply directly to each university. 3. Prepare documents: transcript, degree certificate, CV, motivation letter, recommendation letters, language test and passport. 4. Apply for admission, and for scholarships where they are separate. 5. After admission, follow the official visa or residence-permit process of the destination country.",
      ]},
      { heading: "Know which portal is official", body: [
        "Use the university's own website and the government portals linked from it. Italy, for example, uses Universitaly, the Ministry of University and Research's portal, which includes pre-enrolment for students from abroad. Finland uses Studyinfo for many programmes.",
      ]},
      { heading: "Plan backwards from the earliest deadline", body: [
        "Scholarship deadlines are often earlier than admission deadlines, and translations, legalisations and language tests take weeks. Put every official date in one tracker and start with the earliest.",
      ]},
    ],
    sources: [
      { label: "Universitaly (Ministry of University and Research)", url: "https://www.universitaly.it/en" },
      { label: "Studyinfo: tuition fees (Finland)", url: "https://opintopolku.fi/konfo/en/sivu/tuition-fees" },
    ],
    related: [{ href: "/tools/tracker", label: "Application tracker" }],
  },
  {
    slug: "scholarship-application-checklist",
    title: "Scholarship application checklist",
    description: "Documents and checks to complete before you submit a scholarship or university application.",
    updated: "2026-09-24",
    sections: [
      { heading: "Documents most applications ask for", body: [
        "Passport (valid well beyond your intended study period); degree certificate and full transcript, with certified translations if they are not in English or the local language; CV; motivation letter or statement of purpose; recommendation letters; language test results (IELTS, TOEFL, PTE or as accepted); and, for some programmes, a portfolio, work experience letters or financial documents.",
      ]},
      { heading: "Checks before you submit", body: [
        "Is the call for this year's cycle open on the official page? Does your nationality appear in the eligibility rules? Do you meet the minimum grade on the same scale the university uses? Are you applying through the official portal linked from the university or provider? Did you keep a copy of everything you submitted?",
      ]},
      { heading: "Keep a record", body: [
        "Note the submission date, confirmation emails and portal usernames. Our tracker lets you tick documents off per application; it stores everything only in your browser.",
      ]},
    ],
    related: [{ href: "/tools/tracker", label: "Open the tracker" }],
  },
  {
    slug: "how-to-prepare-a-cv-for-scholarships",
    title: "How to prepare a CV for scholarship applications",
    description: "Structure and content that reviewers look for, without exaggeration.",
    updated: "2026-09-24",
    sections: [
      { heading: "Structure", body: [
        "Use clear headings: Education, Experience, Projects or Research, Skills, Languages, and Awards if you have any. Put your most relevant section first. For most Master's applicants that is Education.",
      ]},
      { heading: "Education details", body: [
        "Write your degree and institution exactly as they appear on your transcript. Give your GPA with its scale (for example 3.4/4.0), and dates. Don't convert grades yourself; universities use their own equivalency methods.",
      ]},
      { heading: "Show results honestly", body: [
        "For each role or project, say what you did and what changed because of it, using real numbers where you have them. Reviewers value specific, verifiable detail over long lists of skills.",
      ]},
      { heading: "Length and format", body: [
        "One to two pages is easier to review. Use a text-based PDF rather than a scanned image so online systems can read it. Our CV assessment tool shows what a system can read from your file.",
      ]},
    ],
    related: [{ href: "/tools/cv", label: "Assess my CV" }],
  },
  {
    slug: "how-to-write-a-motivation-letter",
    title: "How to write a scholarship motivation letter",
    description: "A clear structure and the details that make a motivation letter specific to you.",
    updated: "2026-09-24",
    sections: [
      { heading: "A structure that works", body: [
        "Opening: what you are applying for and why, in two sentences. Academic background: the courses and results that prepared you. Experience: one or two concrete examples. Why this programme: specific features from its official page. Goals: what you plan to do after, and how the programme connects. Closing.",
      ]},
      { heading: "Be specific and truthful", body: [
        "Generic praise (\"world-class university\") adds nothing. Name the modules, labs or specialisations that match your interests, using the official programme page. Never claim research, awards or experience you don't have; committees check.",
      ]},
      { heading: "Follow the instructions", body: [
        "Respect the word limit and answer any questions the call asks. If the scholarship lists selection criteria, make sure your letter addresses each one with evidence.",
      ]},
    ],
    related: [{ href: "/tools/motivation-letter", label: "Motivation letter assistant" }],
  },
  {
    slug: "how-to-evaluate-university-scholarships",
    title: "How to evaluate a university scholarship offer",
    description: "Questions to ask before you accept a scholarship: coverage, conditions, renewal and total cost.",
    updated: "2026-09-24",
    sections: [
      { heading: "Coverage", body: [
        "Which components are covered (tuition, stipend, housing, insurance, travel)? For how many years? Is the amount fixed or a percentage of fees that may rise?",
      ]},
      { heading: "Conditions", body: [
        "Many awards require full-time study and a minimum number of credits each year to continue. Read the renewal conditions on the official page before you accept.",
      ]},
      { heading: "Total cost", body: [
        "Add the uncovered tuition, living costs for the whole programme and one-off costs such as visa and travel. Compare offers on the total you would pay, not the scholarship's headline.",
      ]},
    ],
  },
  {
    slug: "study-in-italy",
    title: "Study in Italy: official portals and how to start",
    description: "Where international students find programmes in Italy and how pre-enrolment from abroad works.",
    updated: "2026-09-24",
    sections: [
      { heading: "Official starting points", body: [
        "Universitaly is the Italian Ministry of University and Research's portal for students. It describes Italian degree programmes and has a section for pre-enrolment from abroad, which it describes as essential for obtaining a study visa. The Ministry of Foreign Affairs also runs a Study in Italy portal for international students.",
      ]},
      { heading: "Scholarships", body: [
        "Funding in Italy comes from universities and other official providers, each with its own rules and calls. Check the scholarship pages of the universities you apply to, and confirm each call on the provider's official site. Verified Italian scholarships on this site are listed on the Italy scholarships page.",
      ]},
      { heading: "Browse universities", body: [
        "You can see Italian universities listed in the open Hipo dataset on our Italy universities page. Each links to its official website.",
      ]},
    ],
    sources: [
      { label: "Universitaly", url: "https://www.universitaly.it/en" },
      { label: "Study in Italy (Ministry of Foreign Affairs)", url: "https://studyinitaly.esteri.it/" },
    ],
    related: [{ href: "/universities/italy", label: "Universities in Italy" }, { href: "/scholarships/italy", label: "Verified scholarships in Italy" }],
  },
  {
    slug: "study-in-spain",
    title: "Study in Spain: official portals and how to start",
    description: "Official tools for finding recognised degrees in Spain and where funding information is published.",
    updated: "2026-09-24",
    sections: [
      { heading: "Finding recognised programmes", body: [
        "SEPIE, the Spanish Service for the Internationalisation of Education, points international students to official degree search tools. RUCT is the Ministry's register of universities, centres and qualifications. QEDU helps you explore what and where to study.",
      ]},
      { heading: "Funding", body: [
        "The European Commission's Study in Europe profile for Spain notes that international students can use European schemes such as Erasmus+, national and regional scholarships, and universities' own merit- or need-based funding. It also says SEPIE publishes information on scholarships for international students. Always confirm a specific call on its official page.",
      ]},
    ],
    sources: [
      { label: "SEPIE: what to study in Spain", url: "http://sepie.es/internacionalizacion/what-to-study-in-spain.html" },
      { label: "Study in Europe: Spain (European Commission)", url: "https://education.ec.europa.eu/study-in-europe/country-profiles/spain" },
    ],
    related: [{ href: "/universities/spain", label: "Universities in Spain" }, { href: "/scholarships/spain", label: "Verified scholarships in Spain" }],
  },
  {
    slug: "study-in-denmark",
    title: "Study in Denmark: official portals and scholarships",
    description: "How Danish government scholarships work for non-EU/EEA students, according to the official Study in Denmark portal.",
    updated: "2026-09-24",
    sections: [
      { heading: "Danish government scholarships", body: [
        "According to Study in Denmark, Danish universities receive a limited number of government scholarships each year for highly qualified full-degree students from non-EU/EEA countries and Switzerland. The scholarship can be a full or partial tuition fee waiver and/or a grant towards living costs. You apply through the institution, so check the admission pages of the programme you want.",
      ]},
      { heading: "Erasmus Mundus", body: [
        "Joint Master's programmes offered by Danish institutions with other European universities are listed in the Erasmus Mundus catalogue. Each programme publishes its own scholarship rules and deadlines.",
      ]},
    ],
    sources: [
      { label: "Study in Denmark: scholarships", url: "https://studyindenmark.dk/study-options/scholarships" },
      { label: "Erasmus Mundus catalogue", url: "https://www.eacea.ec.europa.eu/scholarships/erasmus-mundus-catalogue_en" },
    ],
    related: [{ href: "/universities/denmark", label: "Universities in Denmark" }, { href: "/scholarships/denmark", label: "Verified scholarships in Denmark" }],
  },
  {
    slug: "study-in-finland",
    title: "Study in Finland: fees, scholarships and applying",
    description: "What the official Finnish portals say about tuition fees and scholarships for non-EU/EEA students.",
    updated: "2026-09-24",
    sections: [
      { heading: "Tuition fees", body: [
        "Study in Finland states that students from outside the EU/EEA or Switzerland are generally required to pay tuition fees for English-taught Bachelor's and Master's programmes.",
      ]},
      { heading: "Scholarships", body: [
        "According to Studyinfo, each university has its own scholarship system for fee-paying students, and the details are in each degree programme's description. Study in Finland adds that university scholarships usually cover tuition fees only, not living costs. It also warns that posts promising \"fully funded Finland government scholarships\" covering everything are misleading.",
      ]},
      { heading: "Applying", body: [
        "Many English-taught programmes are applied for through Studyinfo. The European Commission's Study in Europe profile notes that many programmes have one joint application period each year, usually in January, but some differ. Always check the programme's own timetable.",
      ]},
    ],
    sources: [
      { label: "Study in Finland: funding your studies", url: "https://www.studyinfinland.fi/funding-your-studies" },
      { label: "Study in Finland: Bachelor's and Master's scholarships", url: "https://www.studyinfinland.fi/funding-your-studies/bachelors-and-masters-scholarships" },
      { label: "Studyinfo: tuition fees", url: "https://opintopolku.fi/konfo/en/sivu/tuition-fees" },
      { label: "Study in Europe: Finland (European Commission)", url: "https://education.ec.europa.eu/study-in-europe/country-profiles/finland" },
    ],
    related: [{ href: "/universities/finland", label: "Universities in Finland" }, { href: "/scholarships/finland", label: "Verified scholarships in Finland" }],
  },
];

export const guideBySlug = (slug: string) => GUIDES.find((g) => g.slug === slug);
