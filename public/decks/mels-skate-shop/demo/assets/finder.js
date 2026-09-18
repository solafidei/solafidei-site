// public/decks/mels-skate-shop/demo/assets/finder.js — task 16 (issue #34),
// rulings #597, #600-#603.
//
// Three exports: findSize(brand, input) and whichSky(mm, kg, level) are PURE
// -- no DOM, no globals, no network, no fs -- and initFinder(root) is the
// page's DOM wiring. Same shape as site.js's initDerbyFilters() and pdp.js's
// initPdp(): inert on import, guarded behind `typeof document !== "undefined"`
// at the very bottom of this file (site.js:tail / pdp.js:tail are the two
// precedents; T16's build brief §2.3 names both).
//
// THE SIZES CONSTANT BELOW is sizes.json's content, embedded verbatim as a
// plain JS object literal (JSON is a syntactic subset of a JS object
// literal, so no JSON.parse() and no readFileSync() are needed). Brief §7:
// "How sizes.json is loaded matters ... Do not fetch() ... Do not
// readFileSync() either ... If you find no shape that is both browser-safe
// and Node-pure, that is a blocker to report." This IS that shape: a
// browser loads it exactly as it loads any other ES module (no runtime
// `fetch(` call — the prohibition in the Never list is about a runtime
// network request, not the module graph every `<script type="module">` on
// this site already resolves over HTTP, same as site.js/pdp.js's own
// imports), and Node's plain `import` of a `.js` file needs no shim either.
// scripts/gen-size-finder.mjs asserts at generation time that this literal
// is deep-equal to data/sizes.json on disk, exactly the drift-guard idiom
// gen-roller-derby.mjs already uses for site.js's TEMPLATE literal -- so a
// hand-edit here that drifts from the fixture fails the generator loudly,
// not silently.
// buildWhatsAppLink is imported, never reimplemented (site.js:51 already
// normalises digits and encodes ?text=) -- a second wa.me builder would be
// exactly the duplicate-source defect draft-copy.json's `_meta.refConvention`
// forbids.
import { buildWhatsAppLink, hasValue } from "./site.js";

export const SIZES = {"marker":"demo data — confirm with Mel","markerNote":"Every brand entry below carries this marker. Nothing here is a fitting; it is a starting point Mel confirms.","disclaimer":"Brands differ by 1-2 full sizes for the same foot. This is a starting point, not a fitting - we check every order before we ship.","disclaimerSource":"report L182","fallback":"Outside our table - WhatsApp us your measurement.","measure":{"method":"Heel to wall, standing, both feet, use the larger. Trace the foot on paper against a wall, mark the longest toe, measure heel to mark.","note":"Measure late in the day, wearing the sock you skate in."},"brands":[{"key":"aura","label":"Aura","discipline":"ice","marker":"demo data — confirm with Mel","source":"melsskateshop.co.za","sourceNote":"Transcribed from the five Aura fitting-guide images published on Mel's own /size-chart/ page (decision #505). Spec section 2.2 had recorded this run as unpublished; that is superseded.","noTable":false,"unit":"mm","scaleStatement":"AURA skates are sized in millimeters from 210-300 mm and are designed to be heat molded for a custom fit.","range":{"minMm":210,"maxMm":300,"step":5},"widths":["B","C","D","E"],"widthsNote":"These are the four width COLUMNS Aura prints on its grids, not the widths available to buy. Across all six grids E is offered in no size at all, and B is offered in no men's size. Availability is C and D for men's fits and B, C and D for women's fits. Read availability from each size row's widths array, never from this list.","selectionMatrix":{"lengthBands":[{"key":"210-240","label":"210-240 mm","minMm":210,"maxMm":240},{"key":"240-265","label":"240-265 mm","minMm":240,"maxMm":265},{"key":"265-280","label":"265-280 mm","minMm":265,"maxMm":280},{"key":"280-plus","label":"280+ mm","minMm":280,"maxMm":null}],"weightBands":[{"key":"22-36","label":"22 - 36","minKg":22,"maxKg":36},{"key":"36-45","label":"36 - 45","minKg":36,"maxKg":45},{"key":"45-54","label":"45 - 54","minKg":45,"maxKg":54},{"key":"54-68","label":"54 - 68","minKg":54,"maxKg":68},{"key":"68-81","label":"68 - 81","minKg":68,"maxKg":81},{"key":"81-plus","label":"81+","minKg":81,"maxKg":null}],"jumpLevels":[{"key":"singles","label":"Singles"},{"key":"singles-doubles","label":"Singles/Doubles"},{"key":"doubles-triple","label":"Doubles/Triple"},{"key":"triples","label":"Triples"},{"key":"triples-quads","label":"Triples/Quads"}],"matrix":[{"lengthBand":"210-240","weightBand":"22-36","printed":["Sky50","Sky50","Sky50","Sky50/100","Sky100"],"models":[["Sky 50"],["Sky 50"],["Sky 50"],["Sky 50","Sky 100"],["Sky 100"]]},{"lengthBand":"210-240","weightBand":"36-45","printed":["Sky50","Sky50","Sky50","Sky50/100","Sky100"],"models":[["Sky 50"],["Sky 50"],["Sky 50"],["Sky 50","Sky 100"],["Sky 100"]]},{"lengthBand":"210-240","weightBand":"45-54","printed":["Sky50","Sky50","Sky50/100","Sky50/100","Sky100"],"models":[["Sky 50"],["Sky 50"],["Sky 50","Sky 100"],["Sky 50","Sky 100"],["Sky 100"]]},{"lengthBand":"210-240","weightBand":"54-68","printed":["Sky50","Sky50","Sky50/100","Sky100","Sky100/200"],"models":[["Sky 50"],["Sky 50"],["Sky 50","Sky 100"],["Sky 100"],["Sky 100","Sky 200"]]},{"lengthBand":"210-240","weightBand":"68-81","printed":["Sky50","Sky50/100","Sky50/100","Sky100","Sky100/200"],"models":[["Sky 50"],["Sky 50","Sky 100"],["Sky 50","Sky 100"],["Sky 100"],["Sky 100","Sky 200"]]},{"lengthBand":"210-240","weightBand":"81-plus","printed":["Sky100","Sky100/200","Sky100/200","Sky100/200","Sky200"],"models":[["Sky 100"],["Sky 100","Sky 200"],["Sky 100","Sky 200"],["Sky 100","Sky 200"],["Sky 200"]]},{"lengthBand":"240-265","weightBand":"22-36","printed":["Sky50","Sky50","Sky50","Sky50/100","Sky100"],"models":[["Sky 50"],["Sky 50"],["Sky 50"],["Sky 50","Sky 100"],["Sky 100"]]},{"lengthBand":"240-265","weightBand":"36-45","printed":["Sky50","Sky50","Sky50/100","Sky50/100","Sky100"],"models":[["Sky 50"],["Sky 50"],["Sky 50","Sky 100"],["Sky 50","Sky 100"],["Sky 100"]]},{"lengthBand":"240-265","weightBand":"45-54","printed":["Sky50","Sky50","Sky50/100","Sky100","Sky100/200"],"models":[["Sky 50"],["Sky 50"],["Sky 50","Sky 100"],["Sky 100"],["Sky 100","Sky 200"]]},{"lengthBand":"240-265","weightBand":"54-68","printed":["Sky50","Sky50","Sky50/100","Sky100/","Sky100/200"],"models":[["Sky 50"],["Sky 50"],["Sky 50","Sky 100"],["Sky 100"],["Sky 100","Sky 200"]]},{"lengthBand":"240-265","weightBand":"68-81","printed":["Sky50/100","Sky50/100","Sky100","Sky100/200","Sky200"],"models":[["Sky 50","Sky 100"],["Sky 50","Sky 100"],["Sky 100"],["Sky 100","Sky 200"],["Sky 200"]]},{"lengthBand":"240-265","weightBand":"81-plus","printed":["Sky100","Sky100/200","Sky100/200","Sky200","Sky200"],"models":[["Sky 100"],["Sky 100","Sky 200"],["Sky 100","Sky 200"],["Sky 200"],["Sky 200"]]},{"lengthBand":"265-280","weightBand":"22-36","printed":["Sky50","Sky50","Sky50","Sky50/100","Sky100"],"models":[["Sky 50"],["Sky 50"],["Sky 50"],["Sky 50","Sky 100"],["Sky 100"]]},{"lengthBand":"265-280","weightBand":"36-45","printed":["Sky50","Sky50","Sky50/100","Sky50/100","Sky100"],"models":[["Sky 50"],["Sky 50"],["Sky 50","Sky 100"],["Sky 50","Sky 100"],["Sky 100"]]},{"lengthBand":"265-280","weightBand":"45-54","printed":["Sky50","Sky50","Sky50/100","Sky100","Sky100/200"],"models":[["Sky 50"],["Sky 50"],["Sky 50","Sky 100"],["Sky 100"],["Sky 100","Sky 200"]]},{"lengthBand":"265-280","weightBand":"54-68","printed":["Sky50","Sky50/100","Sky50/100","Sky100","Sky100/200"],"models":[["Sky 50"],["Sky 50","Sky 100"],["Sky 50","Sky 100"],["Sky 100"],["Sky 100","Sky 200"]]},{"lengthBand":"265-280","weightBand":"68-81","printed":["Sky50/100","Sky50/100","Sky100","Sky100/200","Sky200"],"models":[["Sky 50","Sky 100"],["Sky 50","Sky 100"],["Sky 100"],["Sky 100","Sky 200"],["Sky 200"]]},{"lengthBand":"265-280","weightBand":"81-plus","printed":["Sky100/200","Sky100/200","Sky200","Sky200","Sky200"],"models":[["Sky 100","Sky 200"],["Sky 100","Sky 200"],["Sky 200"],["Sky 200"],["Sky 200"]]},{"lengthBand":"280-plus","weightBand":"22-36","printed":["Sky100","Sky100/200","Sky100/200","Sky100/200","Sky100/200"],"models":[["Sky 100"],["Sky 100","Sky 200"],["Sky 100","Sky 200"],["Sky 100","Sky 200"],["Sky 100","Sky 200"]]},{"lengthBand":"280-plus","weightBand":"36-45","printed":["Sky100","Sky100/100","Sky200","Sky200","Sky200"],"models":[["Sky 100"],["Sky 100"],["Sky 200"],["Sky 200"],["Sky 200"]]},{"lengthBand":"280-plus","weightBand":"45-54","printed":["Sky100/200","Sky100/200","Sky200","Sky200","Sky200"],"models":[["Sky 100","Sky 200"],["Sky 100","Sky 200"],["Sky 200"],["Sky 200"],["Sky 200"]]},{"lengthBand":"280-plus","weightBand":"54-68","printed":["Sky100/200","Sky200","Sky200","Sky200","Sky200"],"models":[["Sky 100","Sky 200"],["Sky 200"],["Sky 200"],["Sky 200"],["Sky 200"]]},{"lengthBand":"280-plus","weightBand":"68-81","printed":["Sky100/200","Sky200","Sky200","Sky200","Sky200"],"models":[["Sky 100","Sky 200"],["Sky 200"],["Sky 200"],["Sky 200"],["Sky 200"]]},{"lengthBand":"280-plus","weightBand":"81-plus","printed":["Sky100/200","Sky200","Sky200","Sky200","Sky200"],"models":[["Sky 100","Sky 200"],["Sky 200"],["Sky 200"],["Sky 200"],["Sky 200"]]}]},"models":[{"key":"sky-50-mens","model":"Sky 50","gender":"mens","label":"SKY50 - Men's","sizes":[{"mm":210,"widths":["C"]},{"mm":215,"widths":["C"]},{"mm":220,"widths":["C"]},{"mm":225,"widths":["C"]},{"mm":230,"widths":["C"]},{"mm":235,"widths":["C","D"]},{"mm":240,"widths":["C","D"]},{"mm":245,"widths":["C","D"]},{"mm":250,"widths":["C","D"]},{"mm":255,"widths":["C","D"]},{"mm":260,"widths":["C","D"]},{"mm":265,"widths":["C","D"]},{"mm":270,"widths":["C","D"]},{"mm":275,"widths":["C","D"]},{"mm":280,"widths":["C","D"]},{"mm":285,"widths":[]}]},{"key":"sky-50-womens","model":"Sky 50","gender":"womens","label":"SKY50 - Women's","sizes":[{"mm":210,"widths":["B","C"]},{"mm":215,"widths":["B","C"]},{"mm":220,"widths":["B","C"]},{"mm":225,"widths":["B","C"]},{"mm":230,"widths":["B","C"]},{"mm":235,"widths":["B","C","D"]},{"mm":240,"widths":["B","C","D"]},{"mm":245,"widths":["B","C","D"]},{"mm":250,"widths":["B","C","D"]},{"mm":255,"widths":["B","C","D"]},{"mm":260,"widths":["B","C","D"]},{"mm":265,"widths":["B","C","D"]},{"mm":270,"widths":["B","C","D"]},{"mm":275,"widths":["B","C","D"]},{"mm":280,"widths":["B","C","D"]},{"mm":285,"widths":[]}]},{"key":"sky-100-mens","model":"Sky 100","gender":"mens","label":"SKY100 - Men's","sizes":[{"mm":210,"widths":["C"]},{"mm":215,"widths":["C"]},{"mm":220,"widths":["C"]},{"mm":225,"widths":["C"]},{"mm":230,"widths":["C"]},{"mm":235,"widths":["C"]},{"mm":240,"widths":["C"]},{"mm":245,"widths":["C"]},{"mm":250,"widths":["C"]},{"mm":255,"widths":["C","D"]},{"mm":260,"widths":["C","D"]},{"mm":265,"widths":["C","D"]},{"mm":270,"widths":["C","D"]},{"mm":275,"widths":["C","D"]},{"mm":280,"widths":["C","D"]},{"mm":285,"widths":["C"]}]},{"key":"sky-100-womens","model":"Sky 100","gender":"womens","label":"SKY100 - Women's","sizes":[{"mm":210,"widths":["B","C"]},{"mm":215,"widths":["B","C"]},{"mm":220,"widths":["B","C"]},{"mm":225,"widths":["B","C"]},{"mm":230,"widths":["B","C"]},{"mm":235,"widths":["B","C"]},{"mm":240,"widths":["B","C"]},{"mm":245,"widths":["B","C"]},{"mm":250,"widths":["B","C"]},{"mm":255,"widths":["B","C","D"]},{"mm":260,"widths":["B","C","D"]},{"mm":265,"widths":["B","C","D"]},{"mm":270,"widths":["B","C","D"]},{"mm":275,"widths":["B","C","D"]},{"mm":280,"widths":["B","C","D"]},{"mm":285,"widths":[]}]},{"key":"sky-200-mens","model":"Sky 200","gender":"mens","label":"SKY200 - Men's","sizes":[{"mm":225,"widths":[]},{"mm":230,"widths":[]},{"mm":235,"widths":["C"]},{"mm":240,"widths":["C"]},{"mm":245,"widths":["C"]},{"mm":250,"widths":["C"]},{"mm":255,"widths":["C","D"]},{"mm":260,"widths":["C","D"]},{"mm":265,"widths":["C","D"]},{"mm":270,"widths":["C","D"]},{"mm":275,"widths":["C","D"]},{"mm":280,"widths":["C","D"]},{"mm":285,"widths":["C"]},{"mm":290,"widths":["C"]},{"mm":295,"widths":["C"]},{"mm":300,"widths":["C"]}]},{"key":"sky-200-womens","model":"Sky 200","gender":"womens","label":"SKY200 - Women's","sizes":[{"mm":220,"widths":["B","C"]},{"mm":225,"widths":["B","C"]},{"mm":230,"widths":["B","C"]},{"mm":235,"widths":["B","C"]},{"mm":240,"widths":["B","C"]},{"mm":245,"widths":["B","C"]},{"mm":250,"widths":["B","C"]},{"mm":255,"widths":["B","C","D"]},{"mm":260,"widths":["B","C","D"]},{"mm":265,"widths":["B","C","D"]},{"mm":270,"widths":["B","C","D"]},{"mm":275,"widths":["B","C","D"]},{"mm":280,"widths":["B","C","D"]},{"mm":285,"widths":["B","C"]},{"mm":290,"widths":[]},{"mm":295,"widths":[]}]}],"modelsNote":"A size listed with an empty widths array is printed on the grid with every width shaded out: the chart lists the row but offers no width in it.","bladeChart":{"title":"AURA: BLADE SIZING CHART","columns":["bootMm","bladeInches"],"columnLabels":{"bootMm":"Boot Size (mm)","bladeInches":"Optimal Blade Sizing (Inches)"},"intro":"Once an athlete is sized for AURA skates, the next step is to provide a recommended blade size based on the chart below. Each AURA boot size comes with an optimal blade size recommendation to ensure both response and performance are tailored to the skater's fit preference.","rows":[{"bootMm":210,"bladeInches":["7.75","8"]},{"bootMm":215,"bladeInches":["8 1/4"]},{"bootMm":220,"bladeInches":["8 1/4"]},{"bootMm":225,"bladeInches":["8 1/2","8 3/4"]},{"bootMm":230,"bladeInches":["8 3/4"]},{"bootMm":235,"bladeInches":["8 3/4","9"]},{"bootMm":240,"bladeInches":["9"]},{"bootMm":245,"bladeInches":["9 1/4","9 1/2"]},{"bootMm":250,"bladeInches":["9 1/2"]},{"bootMm":255,"bladeInches":["9 3/4"]},{"bootMm":260,"bladeInches":["9 3/4"]},{"bootMm":265,"bladeInches":["10"]},{"bootMm":270,"bladeInches":["10"]},{"bootMm":275,"bladeInches":["10 1/2"]},{"bootMm":280,"bladeInches":["10 1/2"]},{"bootMm":285,"bladeInches":["10 3/4"]},{"bootMm":290,"bladeInches":["10 3/4"]},{"bootMm":295,"bladeInches":["11","11 1/4"]},{"bootMm":300,"bladeInches":["11 1/4"]}]},"fittingRules":[{"key":"brannock-is-the-tool","text":"The Brannock device is the standard foot-measuring tool for AURA's Sky line. Used correctly it gives both the actual foot measurements, length and width in millimetres, and the suggested skate size."},{"key":"measure-both-feet","text":"Measure both feet using the Brannock device. Many skaters have feet of different sizes. Always size based on the larger foot."},{"key":"weighted-stance","text":"The skater must be in a fully weighted stance: standing upright, slight bend in the knee, knee positioned over the toe, heel seated fully in the cup, wearing the sock type you skate in regularly."},{"key":"record-both","text":"Record the Suggested Size (length and width) and the Actual Length and Width (for reference only)."},{"key":"suggested-not-raw","text":"Important: AURA skate sizing is based on the Brannock Suggested Size, not raw foot length alone."},{"key":"length-high-performance","text":"Selecting skate length: the Brannock Suggested Size corresponds to a High-Performance Fit. For a Comfort Fit, move up an additional 1/2 size from the suggested size (5 mm)."},{"key":"width-from-size","text":"Selecting skate width: width is selected based on the chosen skate size, not actual foot length. Once the skate length is determined (High-Performance or Comfort), select the corresponding width shown on the Brannock."},{"key":"width-before-length","text":"KEY RULE: if the skate feels tight, move up in width before increasing length."},{"key":"heat-mould-required","text":"Heat molding requirement: AURA skates must always be heat molded. The carbon construction allows the boot to expand in width and volume and conform closely to the skater's foot shape."},{"key":"heat-mould-failure","text":"Failure to heat mold may result in incorrect sizing decisions, unnecessary length, and reduced performance and comfort."},{"key":"snug-before-moulding","text":"AURA skates are designed to fit Very Snug prior to heat molding. This is intentional and critical to achieving a true custom fit."},{"key":"final-considerations","text":"While the Brannock provides an excellent starting point, final sizing decisions should also consider what size of skate and blade the skater is currently using, overall foot volume, and soft tissue vs. hard tissue contributing to perceived fit.","note":"The published image is cropped at its lower edge, so this list may continue past the last line that is legible."}],"anomalies":[{"cell":"lengthBand 240-265, weight 54-68, Triples","printed":"Sky100/","readAs":["Sky 100"],"note":"The chart prints a trailing slash with nothing after it. Read as Sky 100; worth putting to Mel."},{"cell":"lengthBand 280+, weight 36-45, Singles/Doubles","printed":"Sky100/100","readAs":["Sky 100"],"note":"The chart prints Sky100/100. Every neighbouring cell reads Sky100/200, so this is most likely a typo on Aura's own chart. Recorded as printed, not corrected."}],"openQuestion":"Aura sizes from the Brannock Suggested Size, while the demo finder measures raw foot length. That conflict is real and is ruled at task 16 (decision #505), not here. The rules above are recorded so that task has them."},{"marker":"demo data — confirm with Mel","noTable":false,"source":"melsskateshop.co.za","key":"rio","label":"Rio Roller","discipline":"recreational","sourceNote":"Transcribed from the Rio Roller skate size chart image on Mel's /size-chart/ page (decision #506).","lengthColumn":"insoleMm","columns":["uk","eu","insoleMm"],"columnLabels":{"uk":"UK","eu":"EU","insoleMm":"Insole length (mm)"},"rows":[{"uk":"11J","eu":"29","insoleMm":200},{"uk":"12J","eu":"30.5","insoleMm":207},{"uk":"13J","eu":"32.5","insoleMm":213},{"uk":"1","eu":"33","insoleMm":220},{"uk":"2","eu":"34","insoleMm":227},{"uk":"3","eu":"35.5","insoleMm":233},{"uk":"4","eu":"37","insoleMm":240},{"uk":"5","eu":"38","insoleMm":253},{"uk":"6","eu":"39.5","insoleMm":260},{"uk":"7","eu":"40.5","insoleMm":266},{"uk":"8","eu":"42","insoleMm":272},{"uk":"9","eu":"43","insoleMm":279},{"uk":"10","eu":"44","insoleMm":286},{"uk":"11","eu":"46","insoleMm":293},{"uk":"12","eu":"47","insoleMm":300}],"notes":["The chart jumps 240 mm at UK 4 to 253 mm at UK 5 while every other step is 6 mm to 13 mm. Transcribed as printed, not smoothed."]},{"marker":"demo data — confirm with Mel","noTable":false,"source":"melsskateshop.co.za","key":"sfr","label":"SFR Galaxy","discipline":"recreational","sourceNote":"Transcribed from the SFR Galaxy Size Chart image on Mel's /size-chart/ page (decision #506).","lengthColumn":"footLengthMm","columns":["uk","eu","footLengthMm","ballGirthMm"],"columnLabels":{"uk":"UK Size","eu":"EU Size","footLengthMm":"Foot Length (mm)","ballGirthMm":"Ball Girth (mm)"},"rows":[{"uk":"J10","eu":"28","footLengthMm":166,"ballGirthMm":174},{"uk":"J11","eu":"29","footLengthMm":174,"ballGirthMm":180},{"uk":"J12","eu":"30.5","footLengthMm":190,"ballGirthMm":192},{"uk":"J13","eu":"32","footLengthMm":198,"ballGirthMm":198},{"uk":"1","eu":"33","footLengthMm":206,"ballGirthMm":204},{"uk":"2","eu":"34","footLengthMm":214,"ballGirthMm":210},{"uk":"3","eu":"35.5","footLengthMm":230,"ballGirthMm":222},{"uk":"4","eu":"37","footLengthMm":238,"ballGirthMm":228},{"uk":"5","eu":"38","footLengthMm":246,"ballGirthMm":234},{"uk":"6","eu":"39.5","footLengthMm":262,"ballGirthMm":246},{"uk":"7","eu":"40.5","footLengthMm":270,"ballGirthMm":252},{"uk":"8","eu":"42","footLengthMm":278,"ballGirthMm":258},{"uk":"9","eu":"43","footLengthMm":286,"ballGirthMm":264},{"uk":"10A","eu":"44.5","footLengthMm":302,"ballGirthMm":276}],"notes":["The chart is headed SFR Galaxy, so it covers that model rather than every SFR skate Mel's stocks.","SFR publishes a second model chart on the same page, in a tab titled \"SFR Vision\". It is an image and is not transcribed here, so SFR has two model-specific charts and only the Galaxy one can be sized against in this demo."],"otherModelCharts":[{"model":"SFR Vision","tabTitle":"SFR Vision","transcribed":false,"reason":"Published as an image, not transcribed - outside the fetch budget agreed in decision #506.","source":"melsskateshop.co.za"}]},{"marker":"demo data — confirm with Mel","noTable":false,"source":"melsskateshop.co.za","key":"chaya-emerald","label":"Chaya Emerald","discipline":"derby","sourceNote":"Transcribed from the Chaya Emerald size chart image on Mel's /size-chart/ page (decision #506).","lengthColumn":"mm","columns":["us","uk","mm"],"columnLabels":{"us":"US SIZE","uk":"UK SIZE","mm":"MM"},"rows":[{"us":"4","uk":"3.5","mm":227},{"us":"5","uk":"4","mm":236},{"us":"6","uk":"5","mm":242},{"us":"7","uk":"6","mm":249},{"us":"8","uk":"7","mm":255},{"us":"9","uk":"8","mm":262},{"us":"10","uk":"9","mm":268},{"us":"11","uk":"10","mm":275},{"us":"12","uk":"11","mm":282},{"us":"13","uk":"12","mm":289}]},{"marker":"demo data — confirm with Mel","noTable":false,"source":"melsskateshop.co.za","key":"chaya-sapphire","label":"Chaya Sapphire","discipline":"derby","sourceNote":"Transcribed from the Chaya Sapphire size chart image on Mel's /size-chart/ page (decision #506).","lengthColumn":"mm","columns":["us","uk","mm"],"columnLabels":{"us":"US SIZE","uk":"UK SIZE","mm":"MM"},"rows":[{"us":"4","uk":"2","mm":228},{"us":"5","uk":"3","mm":235},{"us":"6","uk":"4","mm":242},{"us":"7","uk":"5","mm":248},{"us":"8","uk":"6","mm":255},{"us":"9","uk":"7","mm":262},{"us":"10","uk":"8","mm":268},{"us":"11","uk":"9","mm":275},{"us":"12","uk":"10","mm":281},{"us":"13","uk":"11","mm":288},{"us":"14","uk":"12","mm":294},{"us":"15","uk":"13","mm":301}],"notes":["Emerald and Sapphire do not share a US-to-UK offset: Emerald puts US 4 at UK 3.5, Sapphire puts US 4 at UK 2. Both are transcribed as printed."]},{"marker":"demo data — confirm with Mel","noTable":false,"source":"melsskateshop.co.za","key":"atom","label":"Atom","discipline":"derby","sourceNote":"Transcribed from the two Atom chart images on Mel's /size-chart/ page (decision #506). The boot chart is headed VERTIGO - BOOT SIZE CHART (ALL MODELS) - Q6, Q4, F1; the second image is a Pilot F-16 plate chart, not a boot chart.","lengthColumn":"mm","columns":["usWomens","usUnisexWider","inches","mm","eu"],"columnLabels":{"usWomens":"Size US Women's","usUnisexWider":"Size US Unisex (wider)","inches":"Foot Length (Inches)","mm":"Metric (mm)","eu":"Size Euro"},"tableTitle":"VERTIGO - BOOT SIZE CHART (ALL MODELS) - Q6, Q4, F1","rows":[{"usWomens":"4","usUnisexWider":null,"inches":"8.5","mm":217,"eu":"36.5"},{"usWomens":"4.5","usUnisexWider":null,"inches":"8.75","mm":222,"eu":"37"},{"usWomens":"5","usUnisexWider":null,"inches":"8.94","mm":227,"eu":"37.5"},{"usWomens":"5.5","usUnisexWider":null,"inches":"9.13","mm":232,"eu":"38"},{"usWomens":"6","usUnisexWider":null,"inches":"9.31","mm":236,"eu":"38.5"},{"usWomens":"6.5","usUnisexWider":null,"inches":"9.44","mm":240,"eu":"39"},{"usWomens":"7","usUnisexWider":"6","inches":"9.63","mm":244,"eu":"39.5"},{"usWomens":"7.5","usUnisexWider":null,"inches":"9.75","mm":249,"eu":"40"},{"usWomens":"8","usUnisexWider":"7","inches":"9.94","mm":252,"eu":"40.5"},{"usWomens":"8.5","usUnisexWider":null,"inches":"10.13","mm":257,"eu":"41"},{"usWomens":"9","usUnisexWider":"8","inches":"10.31","mm":262,"eu":"41.5"},{"usWomens":"9.5","usUnisexWider":null,"inches":"10.44","mm":265,"eu":"42"},{"usWomens":"10","usUnisexWider":"9","inches":"10.63","mm":270,"eu":"42.5"},{"usWomens":"10.5","usUnisexWider":null,"inches":"10.75","mm":273,"eu":"43"},{"usWomens":"11","usUnisexWider":"10","inches":"10.94","mm":278,"eu":"43.5"},{"usWomens":"11.5","usUnisexWider":null,"inches":"11.13","mm":282,"eu":"44"},{"usWomens":"12","usUnisexWider":"11","inches":"11.25","mm":286,"eu":"44.5"},{"usWomens":null,"usUnisexWider":"12","inches":"11.56","mm":290,"eu":"45.5"},{"usWomens":null,"usUnisexWider":"13","inches":"11.87","mm":294,"eu":"46.5"}],"extraTables":[{"key":"pilot-f16-plate","title":"PILOT F-16 PLATE SIZE CHART (DERBY MOUNTING)","kind":"plate-fitment","marker":"demo data — confirm with Mel","source":"melsskateshop.co.za","note":"This maps a boot size onto a plate size. It is not a foot-length conversion table and findSize() must not use it as one. It is here because section 6.2 asks which plate size fits my boot.","columns":["plateSize","q4q6Boot","f1Boot","jacksonWomensBoot","jacksonUnisexBoot","plateLengthMm"],"columnLabels":{"plateSize":"Plate Size - Axel to Axel","q4q6Boot":"Q-4/Q-6 Boot Size","f1Boot":"F-1 Boot Size","jacksonWomensBoot":"Jackson Women's Boot Size","jacksonUnisexBoot":"Jackson Unisex Boot Size","plateLengthMm":"Plate Length (mm)"},"rows":[{"plateSize":"5.0","q4q6Boot":"4-4.5","f1Boot":null,"jacksonWomensBoot":null,"jacksonUnisexBoot":null,"plateLengthMm":218},{"plateSize":"5.25","q4q6Boot":"5-5.5","f1Boot":"4-4.5","jacksonWomensBoot":"4-4.5","jacksonUnisexBoot":null,"plateLengthMm":225},{"plateSize":"5.5","q4q6Boot":"6-6.5","f1Boot":"5-5.5","jacksonWomensBoot":"5-5.5","jacksonUnisexBoot":null,"plateLengthMm":231},{"plateSize":"5.75","q4q6Boot":"7-7.5","f1Boot":"6","jacksonWomensBoot":"6","jacksonUnisexBoot":null,"plateLengthMm":239},{"plateSize":"6.0","q4q6Boot":"8-8.5","f1Boot":"6.5-7","jacksonWomensBoot":"6.5-7","jacksonUnisexBoot":"6","plateLengthMm":246},{"plateSize":"6.25","q4q6Boot":"9","f1Boot":"7.5","jacksonWomensBoot":"7.5","jacksonUnisexBoot":null,"plateLengthMm":252},{"plateSize":"6.5","q4q6Boot":"9.5-10","f1Boot":"8-8.5","jacksonWomensBoot":"8-8.5","jacksonUnisexBoot":"7","plateLengthMm":258},{"plateSize":"6.75","q4q6Boot":"10.5-11","f1Boot":"9-9.5","jacksonWomensBoot":"9-9.5","jacksonUnisexBoot":"8","plateLengthMm":265},{"plateSize":"7.0","q4q6Boot":"11.5","f1Boot":"10","jacksonWomensBoot":"10","jacksonUnisexBoot":"9","plateLengthMm":271},{"plateSize":"7.25","q4q6Boot":"12","f1Boot":"10.5-11","jacksonWomensBoot":"10.5-11","jacksonUnisexBoot":"10","plateLengthMm":277},{"plateSize":"7.5","q4q6Boot":null,"f1Boot":"11.5-12","jacksonWomensBoot":"11.5-12","jacksonUnisexBoot":null,"plateLengthMm":284},{"plateSize":"7.75","q4q6Boot":null,"f1Boot":null,"jacksonWomensBoot":null,"jacksonUnisexBoot":"11","plateLengthMm":290},{"plateSize":"8.0","q4q6Boot":null,"f1Boot":null,"jacksonWomensBoot":null,"jacksonUnisexBoot":"12","plateLengthMm":296},{"plateSize":"8.25","q4q6Boot":null,"f1Boot":null,"jacksonWomensBoot":null,"jacksonUnisexBoot":"13","plateLengthMm":302},{"plateSize":"8.5","q4q6Boot":null,"f1Boot":null,"jacksonWomensBoot":null,"jacksonUnisexBoot":null,"plateLengthMm":309}],"mountingOptions":["Traditional mount: select one size longer (1/4 inch longer). The front axle sits roughly 1/4 inch in front of the ball of the foot, for more stability and power.","Derby mount: the front axle is under the ball of your foot, for more agility."]}],"notes":["The chart lists a Jackson boot size against each plate, but that is a plate-fitment column, not a Jackson foot-length chart. Jackson still has no transcribed size table here."]},{"key":"roll-line","label":"Roll-Line","discipline":"artistic","marker":"demo data — confirm with Mel","noTable":true,"reason":"Roll-Line is one of Mel's two flagship lines and has no size table on her /size-chart/ page at all. None was reachable anywhere else either, so nothing is transcribed and nothing is guessed.","source":"report L188","handoff":"Tell the skater we have no table for this brand and hand off to WhatsApp with the measurement already in the message."},{"key":"riedell","label":"Riedell","discipline":"derby","marker":"demo data — confirm with Mel","noTable":true,"reason":"Mel's /size-chart/ page has a Riedell tab, but it publishes no size table of its own. It sends the buyer off-site to Riedell's own sizing help page and to Riedell's ice sizing PDF. The roller link as published is also broken - the href ends \"/Support/Sizing-Hel\", truncated. So a derby or recreational buyer offered Riedell in the brand picker is sized on someone else's site, or not at all.","source":"melsskateshop.co.za","handoff":"Tell the skater we have no table for this brand and hand off to WhatsApp with the measurement already in the message.","finding":true},{"key":"sure-grip","label":"Sure-Grip","discipline":"derby","marker":"demo data — confirm with Mel","noTable":true,"reason":"Mel's /size-chart/ page has a Sure-Grip tab, but it publishes no size table. It carries Mel's own measuring method in her own voice (heel to wall, measure both feet, \"All Sure-Grip skates come in US Men's sizes\", \"From experience most girls take the same size as their S.A shoe size\") and links a printable insole size chart PDF hosted on melsskateshop.co.za. That is the most personal sizing content on her site, but a printable insole gauge is not something a size finder can consume, so there is nothing to size against here.","source":"melsskateshop.co.za","handoff":"Tell the skater we have no table for this brand and hand off to WhatsApp with the measurement already in the message.","finding":true},{"key":"powerslide","label":"Powerslide","discipline":"inline","marker":"demo data — confirm with Mel","noTable":true,"reason":"Published on Mel's /size-chart/ page as an image, not transcribed for this demo - outside the fetch budget agreed in decision #506.","source":"melsskateshop.co.za","handoff":"Tell the skater we have no table for this brand and hand off to WhatsApp with the measurement already in the message."},{"key":"playlife","label":"Playlife","discipline":"inline","marker":"demo data — confirm with Mel","noTable":true,"reason":"Published on Mel's /size-chart/ page as an image, not transcribed for this demo - outside the fetch budget agreed in decision #506.","source":"melsskateshop.co.za","handoff":"Tell the skater we have no table for this brand and hand off to WhatsApp with the measurement already in the message."},{"key":"jackson","label":"Jackson","discipline":"ice","marker":"demo data — confirm with Mel","noTable":true,"reason":"Published on Mel's /size-chart/ page as an image, not transcribed for this demo - outside the fetch budget agreed in decision #506. The Pilot F-16 plate chart under Atom names Jackson boot sizes, but only to fit a plate to them.","source":"melsskateshop.co.za","handoff":"Tell the skater we have no table for this brand and hand off to WhatsApp with the measurement already in the message."},{"key":"destiny","label":"Destiny","discipline":"artistic","marker":"demo data — confirm with Mel","noTable":true,"reason":"Published on Mel's /size-chart/ page as an image, not transcribed for this demo - outside the fetch budget agreed in decision #506.","source":"melsskateshop.co.za","handoff":"Tell the skater we have no table for this brand and hand off to WhatsApp with the measurement already in the message."},{"key":"s1","label":"S1","discipline":"protective","marker":"demo data — confirm with Mel","noTable":true,"reason":"Published on Mel's /size-chart/ page as an image, not transcribed for this demo - outside the fetch budget agreed in decision #506.","source":"melsskateshop.co.za","handoff":"Tell the skater we have no table for this brand and hand off to WhatsApp with the measurement already in the message."}]};

function findBrand(key) {
  return SIZES.brands.find((b) => b.key === key) || null;
}

// AURA has no flat `rows`/`columns` shape like the other five table brands
// (its own comment on that structure is in sizes.json itself) -- its scale
// is skate-size millimetres, checked against the SIX per-model-per-gender
// grids (measured fact / build brief §5.4). Raw foot length is rounded to
// the nearest 5 mm step within the published 210-300 mm run (ruling #600:
// the finder DISCLOSES the Brannock Suggested-Size gap rather than
// converting across it -- rounding to the nearest published skate-size
// step is not a scale conversion, it is reading the nearest row on Aura's
// own chart). Never adds Aura's own +5 mm Comfort-Fit step
// (fittingRules[5], key "length-high-performance" -- FIXED from a
// stale "[6]" citation during T16 adjudication; [6]/"width-from-size" is
// a different rule and carries no millimetre figure at all) to anything --
// that step is Suggested-Size -> Comfort-Fit, not raw-length ->
// Suggested-Size (build brief §5.1, the sharpest forbidden trap in this
// task).
//
// The gap itself (fittingRules[4], key "suggested-not-raw") is rendered
// verbatim to the skater in the Which Sky? step, plus the #600 framing
// sentence, by scripts/gen-size-finder.mjs -- see finder.js's own
// `[data-finder-sky-brannock]` element and gen-size-finder.mjs's comment
// on it. Fixed during T16 adjudication: the first cut of this task
// disclosed the gap only in this source comment, which no skater ever
// sees -- #600's binding text is "the Aura branch STATES PLAINLY", not
// "the source code states plainly".
//
// ROUNDING DIRECTION -- ruling #605. This snaps UP to the next published
// 5 mm row, never to the nearest one, so the skate is never SHORTER than
// the measured foot. That is the same "a boot must be at least as long as
// the foot" rationale findTableBrand() already states for the five flat
// -table brands, and #605 ruled Aura matches them rather than staying on
// the nearest-row reading T16 first shipped (which under-read the foot by
// up to 2.5 mm on roughly half of all inputs). Two consequences the
// spine pins as literals:
//   - a raw length ABOVE the published run is now out-of-range, because
//     there is no higher row to snap up to and clamping down to 300 would
//     hand back a skate shorter than the foot -- exactly what #605 forbids;
//   - a raw length just BELOW the run still answers 210, which is still a
//     snap UP and still never shorter than the foot, so the half-step
//     tolerance on the low side is kept.
function findAura(brand, input) {
  const raw = Number(input && input.mm);
  const { minMm, maxMm, step } = brand.range;
  if (!Number.isFinite(raw) || raw < minMm - step / 2 || raw > maxMm) {
    return { ok: false, brand: brand.key, reason: "out-of-range", message: SIZES.fallback, input };
  }
  let mm = Math.ceil((raw - minMm) / step) * step + minMm;
  mm = Math.min(maxMm, Math.max(minMm, mm));
  const availability = brand.models.map((g) => {
    const entry = g.sizes.find((s) => s.mm === mm);
    return { model: g.model, gender: g.gender, label: g.label, widths: entry ? entry.widths : [] };
  });
  return {
    ok: true,
    brand: brand.key,
    brandLabel: brand.label,
    row: { mm, measuredMm: raw, availability },
    scales: [{ key: "mm", label: "Skate size (mm)", value: mm }],
    input,
    disclaimer: SIZES.disclaimer,
  };
}

// The five other table brands (rio, sfr, chaya-emerald, chaya-sapphire,
// atom) share one flat shape: `rows[]`, `columns[]`, `columnLabels{}`,
// `lengthColumn`. Forward lookup (input.mm) rounds UP to the next row whose
// length column is >= the measured length -- standard "the boot must be at
// least as long as the foot" fitting logic -- and is out-of-range only
// strictly outside the table's own printed min/max (never invented,
// per #506/#540). Reverse lookup (any other column present on `input`,
// e.g. {uk: "8"}) is an exact string match against that row's own value,
// per §4.2: "no conversion is ever computed between scales."
//
// FIXED during T16 adjudication: `scales` drops any column the matched row
// itself has no value for (Atom's `usUnisexWider` is null on 13 of its 19
// rows -- a boot chart with a Unisex-wider option only on some sizes). The
// first cut mapped every column unconditionally, so a null cell stringified
// to the literal word "null" and shipped in both the on-screen result and
// the WhatsApp message text to Melony -- a #540/#603(3) violation (a null
// cell is a scale that row does not carry, and #603(3) says render only
// the scales the table carries).
function findTableBrand(brand, input) {
  const lengthKey = brand.lengthColumn;
  const rows = brand.rows.slice().sort((a, b) => a[lengthKey] - b[lengthKey]);
  const min = rows[0][lengthKey];
  const max = rows[rows.length - 1][lengthKey];

  let matched = null;
  if (input && input.mm !== undefined && input.mm !== null && input.mm !== "") {
    const mm = Number(input.mm);
    if (!Number.isFinite(mm) || mm < min || mm > max) {
      return { ok: false, brand: brand.key, reason: "out-of-range", message: SIZES.fallback, input };
    }
    matched = rows.find((r) => r[lengthKey] >= mm) || null;
  } else {
    const scaleKey = brand.columns.find(
      (col) => col !== lengthKey && input && Object.prototype.hasOwnProperty.call(input, col)
    );
    if (!scaleKey) {
      return { ok: false, brand: brand.key, reason: "out-of-range", message: SIZES.fallback, input };
    }
    const needle = String(input[scaleKey]).trim().toLowerCase();
    matched =
      rows.find((r) => r[scaleKey] != null && String(r[scaleKey]).trim().toLowerCase() === needle) || null;
  }

  if (!matched) {
    return { ok: false, brand: brand.key, reason: "out-of-range", message: SIZES.fallback, input };
  }

  const scales = brand.columns
    .filter((col) => matched[col] !== null && matched[col] !== undefined)
    .map((col) => ({
      key: col,
      label: (brand.columnLabels && brand.columnLabels[col]) || col,
      value: matched[col],
    }));

  return {
    ok: true,
    brand: brand.key,
    brandLabel: brand.label,
    row: matched,
    scales,
    input,
    disclaimer: SIZES.disclaimer,
  };
}

// findSize(brand, input) -- never null, never a throw (build brief §7).
export function findSize(brandKey, input) {
  const safeInput = input || {};
  const brand = findBrand(brandKey);
  if (!brand) {
    return { ok: false, brand: brandKey, reason: "unknown-brand", message: SIZES.fallback, input: safeInput };
  }
  if (brand.noTable) {
    return { ok: false, brand: brand.key, reason: "no-table", message: brand.handoff, input: safeInput };
  }
  if (brand.key === "aura") return findAura(brand, safeInput);
  return findTableBrand(brand, safeInput);
}

// whichSky(mm, kg, level) -- lower band wins on BOTH axes (ruling #602: the
// union rule returns three models at 210 mm/81 kg/Singles-Doubles, which
// the chart never prints). Bands are listed ascending in sizes.json, so
// taking the FIRST match in array order on each axis IS lower-band-wins.
export function whichSky(mm, kg, level) {
  const aura = findBrand("aura");
  const matrix = aura.selectionMatrix;
  const jumpIdx = matrix.jumpLevels.findIndex((j) => j.key === level);
  if (jumpIdx === -1) {
    return { ok: false, reason: "out-of-range", message: SIZES.fallback };
  }
  const mmNum = Number(mm);
  const kgNum = Number(kg);
  const lengthBand = matrix.lengthBands.find(
    (b) => Number.isFinite(mmNum) && mmNum >= b.minMm && (b.maxMm === null || mmNum <= b.maxMm)
  );
  if (!lengthBand) {
    return { ok: false, reason: "out-of-range", message: SIZES.fallback };
  }
  const weightBand = matrix.weightBands.find(
    (b) => Number.isFinite(kgNum) && kgNum >= b.minKg && (b.maxKg === null || kgNum <= b.maxKg)
  );
  if (!weightBand) {
    return { ok: false, reason: "out-of-range", message: SIZES.fallback };
  }
  const row = matrix.matrix.find(
    (r) => r.lengthBand === lengthBand.key && r.weightBand === weightBand.key
  );
  if (!row) {
    return { ok: false, reason: "out-of-range", message: SIZES.fallback };
  }
  return {
    ok: true,
    models: row.models[jumpIdx],
    printed: row.printed[jumpIdx],
    lengthBand: lengthBand.key,
    weightBand: weightBand.key,
    jumpLevel: level,
  };
}

// --- DOM wiring (task 16) ----------------------------------------------
// The picker's own membership (the six table brands minus aura, plus
// riedell and sure-grip -- rulings #603(1)/(2)) is baked into the page by
// scripts/gen-size-finder.mjs's PICKER_BRAND_KEYS constant, not repeated
// here: this module only ever queries the [data-finder-brand] buttons the
// generator already rendered, so it never needs its own copy of that list.

function esc(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// Returns {stem, phrase} rather than one string: a raw mm input IS a foot
// measurement ("my foot measures 255 mm"), but a reverse lookup (shoe size
// or an owned skate's size) is not -- it is a size the skater already
// wears, not something they measured. FIXED during T16 adjudication: the
// first cut always prefixed "my foot measures", so a UK-size reverse
// lookup composed the WhatsApp line "my foot measures UK SIZE 7", pooling
// a shoe size into a length claim it never was.
function describeInput(input, brand) {
  if (input && input.mm !== undefined && input.mm !== null && input.mm !== "") {
    return { stem: "my foot measures", phrase: `${input.mm} mm` };
  }
  if (input && brand) {
    for (const col of brand.columns) {
      if (Object.prototype.hasOwnProperty.call(input, col)) {
        const label = (brand.columnLabels && brand.columnLabels[col]) || col;
        return { stem: "I gave the Size Finder", phrase: `${label} ${input[col]}` };
      }
    }
  }
  return { stem: "I gave the Size Finder", phrase: "an unspecified measurement" };
}

export function initFinder(root) {
  const whatsappNumber = root.dataset.finderWhatsappNumber || "";

  const disciplineButtons = Array.from(root.querySelectorAll("[data-finder-discipline]"));
  const brandWrap = root.querySelector("[data-finder-brand-wrap]");
  const brandButtons = Array.from(root.querySelectorAll("[data-finder-brand]"));
  const notablePanel = root.querySelector("[data-finder-notable]");
  const notableCta = root.querySelector("[data-finder-notable-cta]");
  const fallbackPanel = root.querySelector("[data-finder-fallback]");
  const fallbackCta = root.querySelector("[data-finder-fallback-cta]");
  const measurePanel = root.querySelector("[data-finder-measure]");
  const mmInput = root.querySelector("[data-finder-mm]");
  const altModesWrap = root.querySelector("[data-finder-altmodes-wrap]");
  const altModeButtons = Array.from(root.querySelectorAll("[data-finder-altmode]"));
  const altPanel = root.querySelector("[data-finder-altpanel]");
  const altHint = root.querySelector("[data-finder-althint]");
  const scaleSelect = root.querySelector("[data-finder-scale]");
  const scaleValueInput = root.querySelector("[data-finder-scale-value]");
  const skyPanel = root.querySelector("[data-finder-sky]");
  const skyKgInput = root.querySelector("[data-finder-sky-kg]");
  const jumpButtons = Array.from(root.querySelectorAll("[data-finder-jump]"));
  const submitButton = root.querySelector("[data-finder-submit]");
  const resultRegion = root.querySelector("[data-finder-result]");
  const resultCtas = root.querySelector("[data-finder-result-ctas]");
  const whatsappCta = root.querySelector("[data-finder-whatsapp]");

  if (!disciplineButtons.length || !submitButton || !resultRegion) return;

  let discipline = null;
  let brand = null;
  let altMode = null;
  let jumpLevel = null;

  function setPressed(buttons, activeEl) {
    for (const b of buttons) b.setAttribute("aria-pressed", String(b === activeEl));
  }
  function hide(el) {
    if (el) el.hidden = true;
  }
  function show(el) {
    if (el) el.hidden = false;
  }

  function updateHandoffHref(el, mmValue) {
    if (!el || !whatsappNumber) return;
    const text =
      mmValue !== null && mmValue !== undefined && Number.isFinite(mmValue)
        ? `Hi Melony, my foot measures ${mmValue} mm and the Size Finder could not give me a number here. Can you help?`
        : `Hi Melony, the Size Finder could not give me a number here. Can you help?`;
    el.href = buildWhatsAppLink(whatsappNumber, text);
  }

  // Ruling #606: an input is "given" only when it holds a non-blank value.
  // Whitespace counts as blank -- " " would otherwise reach Number() as 0
  // by the same coercion this guard exists to stop. Promoted to site.js by
  // task 17 (booking.js needs the identical guard) -- imported above rather
  // than kept as a second file-local copy.

  function clearResult() {
    resultRegion.textContent = "";
    hide(resultCtas);
  }

  function resetDownstream() {
    hide(notablePanel);
    hide(fallbackPanel);
    hide(measurePanel);
    hide(skyPanel);
    clearResult();
    altMode = null;
    jumpLevel = null;
    setPressed(altModeButtons, null);
    setPressed(jumpButtons, null);
    if (altPanel) altPanel.hidden = true;
    if (mmInput) mmInput.value = "";
    if (skyKgInput) skyKgInput.value = "";
    if (scaleValueInput) scaleValueInput.value = "";
  }

  // AURA has no `columns`/`lengthColumn` (its scale is the per-model,
  // per-gender grids, not a flat rows table -- see finder.js's own comment
  // on findAura()), so it carries no reverse-lookup scale to populate. The
  // alt-mode ("shoe size" / "already own a skate") controls only apply to
  // the five flat-table brands and are hidden for Aura rather than left
  // showing an empty, non-functional <select>.
  function populateScaleOptions(b) {
    if (!scaleSelect) return;
    scaleSelect.textContent = "";
    if (!Array.isArray(b.columns)) return;
    for (const col of b.columns) {
      if (col === b.lengthColumn) continue;
      const opt = document.createElement("option");
      opt.value = col;
      opt.textContent = (b.columnLabels && b.columnLabels[col]) || col;
      scaleSelect.appendChild(opt);
    }
  }

  function selectBrand(key) {
    brand = key;
    setPressed(
      brandButtons,
      brandButtons.find((btn) => btn.dataset.finderBrand === key) || null
    );
    hide(notablePanel);
    hide(fallbackPanel);
    clearResult();
    const b = findBrand(key);
    if (!b) {
      hide(measurePanel);
      show(fallbackPanel);
      updateHandoffHref(fallbackCta, null);
      return;
    }
    if (b.noTable) {
      hide(measurePanel);
      show(notablePanel);
      updateHandoffHref(notableCta, null);
      return;
    }
    if (altModesWrap) altModesWrap.hidden = !Array.isArray(b.columns);
    if (!Array.isArray(b.columns) && altPanel) {
      altMode = null;
      setPressed(altModeButtons, null);
      altPanel.hidden = true;
    }
    populateScaleOptions(b);
    show(measurePanel);
  }

  function selectDiscipline(key) {
    discipline = key;
    setPressed(
      disciplineButtons,
      disciplineButtons.find((btn) => btn.dataset.finderDiscipline === key) || null
    );
    resetDownstream();
    brand = null;
    if (key === "derby") {
      show(brandWrap);
      setPressed(brandButtons, null);
      hide(measurePanel);
      return;
    }
    hide(brandWrap);
    if (key === "ice") {
      show(skyPanel);
      selectBrand("aura");
    } else if (key === "artistic") {
      selectBrand("roll-line");
    } else if (key === "kids") {
      show(fallbackPanel);
      updateHandoffHref(fallbackCta, null);
    }
  }

  for (const button of disciplineButtons) {
    button.addEventListener("click", () => selectDiscipline(button.dataset.finderDiscipline));
  }
  for (const button of brandButtons) {
    button.addEventListener("click", () => selectBrand(button.dataset.finderBrand));
  }
  for (const button of altModeButtons) {
    button.addEventListener("click", () => {
      const key = button.dataset.finderAltmode;
      altMode = altMode === key ? null : key;
      setPressed(altModeButtons, altMode ? button : null);
      if (altPanel) altPanel.hidden = altMode === null;
      if (altHint) {
        altHint.textContent =
          altMode === "own"
            ? root.dataset.finderAltOwnHint || ""
            : root.dataset.finderAltShoeHint || "";
      }
    });
  }
  for (const button of jumpButtons) {
    button.addEventListener("click", () => {
      jumpLevel = button.dataset.finderJump;
      setPressed(jumpButtons, button);
    });
  }

  function buildScaleTableHtml(scales) {
    const rows = scales
      .map((s) => `<tr><th scope="row">${esc(s.label)}</th><td>${esc(String(s.value))}</td></tr>`)
      .join("");
    return `<div class="table-scroll"><table class="table"><tbody>${rows}</tbody></table></div>`;
  }

  function renderNormalResult(result, input) {
    const brandObj = findBrand(brand);
    if (result.ok) {
      resultRegion.innerHTML = `<p><strong>${esc(result.brandLabel)}</strong></p>${buildScaleTableHtml(
        result.scales
      )}<p class="field__hint">${esc(root.dataset.finderDisclaimerLead || "")} ${esc(result.disclaimer)}</p>`;
      show(resultCtas);
      if (whatsappCta) {
        const summary = result.scales.map((s) => `${s.label} ${s.value}`).join(", ");
        const described = describeInput(input, brandObj);
        const text = `Hi Melony, ${described.stem} ${described.phrase}. The Size Finder says my ${result.brandLabel} size is: ${summary}.`;
        whatsappCta.href = buildWhatsAppLink(whatsappNumber, text);
      }
      return;
    }
    resultRegion.innerHTML = `<p>${esc(result.message)}</p><p class="field__hint">${esc(
      root.dataset.finderOutOfRangeNote || ""
    )}</p>`;
    show(resultCtas);
    if (whatsappCta) {
      const described = describeInput(input, brandObj);
      const text = `Hi Melony, ${described.stem} ${described.phrase}. I couldn't get a size for ${
        brandObj ? brandObj.label : brand
      } from the Size Finder. Can you help?`;
      whatsappCta.href = buildWhatsAppLink(whatsappNumber, text);
    }
  }

  function renderSkyResult(sky, auraResult, mm, kg, level) {
    if (!sky.ok) {
      resultRegion.innerHTML = `<p>${esc(sky.message)}</p><p class="field__hint">${esc(
        root.dataset.finderOutOfRangeNote || ""
      )}</p>`;
      show(resultCtas);
      if (whatsappCta) {
        const text = `Hi Melony, my foot measures ${mm} mm, I weigh ${kg} kg. The Size Finder's Which Sky? step couldn't place me. Can you help?`;
        whatsappCta.href = buildWhatsAppLink(whatsappNumber, text);
      }
      return;
    }
    const modelNames = sky.models.join(" or ");
    const availability =
      auraResult && auraResult.ok
        ? auraResult.row.availability.filter((a) => sky.models.includes(a.model))
        : [];
    const rows = availability
      .map(
        (a) =>
          `<tr><th scope="row">${esc(a.label)}</th><td>${
            a.widths.length ? esc(a.widths.join(", ")) : "—"
          }</td></tr>`
      )
      .join("");
    resultRegion.innerHTML = `<p><strong>${esc(modelNames)}</strong></p>${
      rows ? `<div class="table-scroll"><table class="table"><tbody>${rows}</tbody></table></div>` : ""
    }<p class="field__hint">${esc(root.dataset.finderDisclaimerLead || "")} ${esc(SIZES.disclaimer)}</p>`;
    show(resultCtas);
    if (whatsappCta) {
      const text = `Hi Melony, my foot measures ${mm} mm, I weigh ${kg} kg, and I ${level.replace(
        /-/g,
        "/"
      )} jump. Aura's chart says: ${modelNames}.`;
      whatsappCta.href = buildWhatsAppLink(whatsappNumber, text);
    }
  }

  submitButton.addEventListener("click", () => {
    if (discipline === "ice") {
      // Ruling #606. A BLANK box is not a measurement of zero. Number("")
      // is 0 and 0 is finite, so the isFinite guard below never fired on an
      // empty field: clicking "Find my size" before typing anything
      // rendered a real out-of-range answer AND composed a WhatsApp message
      // to Melony reading "my foot measures 0 mm, I weigh 0 kg". Checked
      // ahead of Number(), never after it.
      if (!hasValue(mmInput) || !hasValue(skyKgInput)) return;
      const mm = Number(mmInput && mmInput.value);
      const kg = Number(skyKgInput && skyKgInput.value);
      if (!Number.isFinite(mm) || !Number.isFinite(kg) || !jumpLevel) return;
      const sky = whichSky(mm, kg, jumpLevel);
      const auraResult = findSize("aura", { mm });
      renderSkyResult(sky, auraResult, mm, kg, jumpLevel);
      return;
    }
    if (!brand) return;
    let input;
    if (altMode && scaleSelect && scaleValueInput && scaleValueInput.value !== "") {
      input = { [scaleSelect.value]: scaleValueInput.value };
    } else {
      // Ruling #606, the same blank-is-not-zero guard as the ice branch.
      if (!hasValue(mmInput)) return;
      const mm = Number(mmInput && mmInput.value);
      if (!Number.isFinite(mm)) return;
      input = { mm };
    }
    renderNormalResult(findSize(brand, input), input);
  });

  // ?preset= (ruling #562: the param is "preset", not "discipline") --
  // read inside the DOM guard, never at module scope (build brief §3.3).
  // An unknown/absent preset leaves the picker unset -- never a thrown
  // error and never a silently wrong branch.
  const params = new URLSearchParams(location.search);
  const preset = params.get("preset");
  if (preset === "derby") {
    selectDiscipline("derby");
  } else if (preset === "ice-aura") {
    selectDiscipline("ice");
  }
}

// ponytail: module scripts are deferred, so the DOM is parsed by the time
// this runs -- same guard shape as site.js's and pdp.js's own bottom
// blocks, and for the same reason: it is what keeps
// `node scripts/gen-size-finder.mjs` and the verify spine's plain-Node
// `import { findSize, whichSky } from "./finder.js"` working, where
// `document` does not exist.
if (typeof document !== "undefined") {
  const root = document.querySelector("[data-finder]");
  if (root) initFinder(root);
}
