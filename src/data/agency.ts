export const projects = [
  {
    slug: 'web-networks', name: 'Web Networks', category: 'Platforms & apps', type: 'platforms',
    headline: 'Connection, made clear.', number: '01', color: '#d8f0f9', image: 'webnetwork',
    alt: 'Web Networks account dashboard on a laptop and mobile phone',
    summary: 'A connected account experience that puts internet plans, usage and payments in view.',
    scope: ['Interface design', 'Customer dashboard', 'Mobile experience'],
    context: 'An internet connection runs quietly in the background. Managing it should feel just as straightforward. The Web Networks project brings account information and everyday customer actions into one interface.',
    challenge: 'Plans, usage, remaining days and payments all compete for attention. The design challenge was to make the current account status easy to understand while keeping the next action close at hand.',
    approach: 'The dashboard establishes a clear order: current usage, account status, then subscription details. On mobile, compact cards make space for the same information, with frequently used actions grouped near the top.',
    outcome: 'The project designs connect a desktop customer dashboard with a mobile account experience. Usage charts, plan summaries and payment actions share a consistent visual language across the two formats.',
    detail: 'appnet', detailAlt: 'Web Networks mobile interface showing a searchable list of leads',
    detailTitle: 'A smaller screen. The same clarity.',
    detailCopy: 'The mobile work extends to list-based workflows. Search, status filters and contact actions give dense information a simple, repeatable structure.',
    next: 'osgx'
  },
  {
    slug: 'osgx', name: 'OffshoreGeniX', category: 'Website design & development', type: 'websites',
    headline: 'An agency, expressed.', number: '02', color: '#fff0b7', image: 'work3',
    alt: 'OffshoreGeniX website presented on a tablet, with a dark layout and yellow accents',
    summary: 'A WordPress website for a digital marketing agency working across Australia and New Zealand.',
    scope: ['Web design', 'WordPress development', 'SEO'],
    context: 'OffshoreGeniX provides digital marketing services to businesses in Australia and New Zealand. Its website brings the agency’s positioning, services and contact information into a single public presence.',
    challenge: 'A service business needs to explain both what it does and why a prospective client should keep reading. The website needed a clear path from introduction to services and contact.',
    approach: 'A dark visual direction and contrasting yellow accents give the opening a distinct tone. The site is structured around home, about, services and contact pages, with WordPress and Elementor supporting the build.',
    outcome: 'A multi-page agency website combining web design, WordPress development and SEO work. The project brings the brand’s visual presentation and service information together in an editable publishing platform.',
    next: 'beauty-and-nails'
  },
  {
    slug: 'beauty-and-nails', name: 'Beauty & Nails', category: 'Visual direction', type: 'identity',
    headline: 'A softer expression.', number: '03', color: '#eee5e7', image: 'work2',
    alt: 'Beauty and Nails visual direction with muted pink, botanical linework and beauty photography',
    summary: 'A beauty brand study built around a quiet palette, botanical detail and human imagery.',
    scope: ['Visual direction', 'Brand presentation'],
    context: 'The Beauty & Nails portfolio artwork explores a softer visual language for a beauty business. Photography, botanical linework and a restrained colour palette set the tone.',
    challenge: 'The presentation needed to communicate beauty and care without overwhelming the subject. Colour, image and supporting details had to work as one composition.',
    approach: 'Muted rose and neutral tones create a quiet backdrop. Fine botanical linework balances the photographic focal point, while a simple wordmark keeps the business name legible.',
    outcome: 'A visual direction showing how colour, photography and illustration can support a coherent brand presentation. This project is presented as a design study.',
    next: 'web-networks'
  }
];
export const services = [
  { slug:'websites', number:'01', name:'Websites', phrase:'Make the right first impression.', short:'A clear story. A considered experience. A website your team can keep moving.', description:'Your website has a job to do: explain your business, earn attention and help someone take the next step. We connect content, interface design and development around that job.', deliverables:['Content structure & user journeys','Responsive interface design','CMS & e-commerce development','Accessibility & performance checks'], questions:['Who needs to use the site, and what are they looking for?','What should a visitor understand before getting in touch?','Who will manage content after launch?'], project:'osgx' },
  { slug:'mobile-apps', number:'02', name:'Mobile apps', phrase:'Make everyday feel effortless.', short:'Useful on the move. Native and cross-platform experiences built around real tasks.', description:'A good app earns its place on someone’s phone. We focus on the things people return to: finding information, completing a task and picking up where they left off.', deliverables:['User flows & interactive prototypes','iOS & Android development','API & account integration','Testing, release & ongoing support'], questions:['What is the one task your app needs to make easier?','What should work when connectivity is limited?','How will the experience fit into someone’s day?'], project:'web-networks' },
  { slug:'custom-software', number:'03', name:'Custom software', phrase:'Make your business work better.', short:'The platform behind your next chapter. Built around your people and processes.', description:'When spreadsheets and disconnected tools start slowing people down, the answer needs to fit the way your business works. We design and develop custom platforms, dashboards and integrations around those workflows.', deliverables:['Workflow discovery & technical planning','Custom web application development','Dashboards, permissions & integrations','Documentation, handover & maintenance'], questions:['Where are people repeating work or re-entering information?','Which systems need to talk to each other?','What does the team need to see and act on?'], project:'web-networks' }
];
