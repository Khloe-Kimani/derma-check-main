// Allergen Checker — click to select allergens, then cross-reference
// them against a pasted ingredient list.

// The database of common skincare allergens. "aliases" are the other
// names an allergen might be listed under on a product label — this is
// what the cross-reference check searches for.
const ALLERGENS = [
  {
    id: 'fragrance',
    name: 'Fragrance / Parfum',
    aliases: ['fragrance', 'parfum', 'aroma'],
    foundIn: 'Perfumes, lotions, cleansers',
    reaction: 'The most common cause of allergic contact dermatitis in cosmetics.'
  },
  {
    id: 'parabens',
    name: 'Parabens',
    aliases: ['paraben', 'methylparaben', 'propylparaben', 'butylparaben', 'ethylparaben'],
    foundIn: 'Moisturizers, makeup, shampoos',
    reaction: 'Can cause redness and irritation in sensitive skin.'
  },
  {
    id: 'sulfates',
    name: 'Sulfates (SLS/SLES)',
    aliases: ['sodium lauryl sulfate', 'sodium laureth sulfate', 'sls', 'sles'],
    foundIn: 'Cleansers, shampoos, body wash',
    reaction: 'Strips natural oils, which can cause dryness and irritation.'
  },
  {
    id: 'formaldehyde',
    name: 'Formaldehyde releasers',
    aliases: ['dmdm hydantoin', 'quaternium-15', 'imidazolidinyl urea', 'diazolidinyl urea'],
    foundIn: 'Preservatives in lotions and shampoos',
    reaction: 'A known skin sensitizer that can trigger allergic contact dermatitis.'
  },
  {
    id: 'lanolin',
    name: 'Lanolin',
    aliases: ['lanolin', 'wool alcohol', 'wool wax'],
    foundIn: 'Lip balms, moisturizers',
    reaction: 'A common allergen, especially for those with wool sensitivities.'
  },
  {
    id: 'mi',
    name: 'Methylisothiazolinone (MI/MCI)',
    aliases: ['methylisothiazolinone', 'methylchloroisothiazolinone', 'kathon cg'],
    foundIn: 'Preservative in cleansers, wipes',
    reaction: 'One of the leading causes of cosmetic allergic contact dermatitis.'
  },
  {
    id: 'essential-oils',
    name: 'Essential oils',
    aliases: ['tea tree oil', 'lavender oil', 'citrus oil', 'essential oil'],
    foundIn: 'Natural or organic skincare, aromatherapy products',
    reaction: 'Can irritate or trigger allergic reactions despite being "natural".'
  },
  {
    id: 'balsam',
    name: 'Balsam of Peru',
    aliases: ['balsam of peru', 'myroxylon pereirae'],
    foundIn: 'Fragranced products, some lip products',
    reaction: 'A frequent allergen that cross-reacts with certain fragrances.'
  },
  {
    id: 'propylene-glycol',
    name: 'Propylene Glycol',
    aliases: ['propylene glycol', '1,2-propanediol'],
    foundIn: 'Moisturizers, serums',
    reaction: 'Can cause irritant or allergic contact dermatitis in some users.'
  },
  {
    id: 'nickel',
    name: 'Nickel',
    aliases: ['nickel', 'nickel sulfate'],
    foundIn: 'Mineral makeup, some pigmented products',
    reaction: 'One of the most common metal allergens, causing contact dermatitis.'
  },
  {
    id: 'phenoxyethanol',
    name: 'Phenoxyethanol',
    aliases: ['phenoxyethanol'],
    foundIn: 'Preservative in creams, sunscreens',
    reaction: 'Generally mild, but can irritate sensitive skin.'
  },
  {
    id: 'retinoids',
    name: 'Retinoids',
    aliases: ['retinol', 'retinoic acid', 'tretinoin', 'retinyl palmitate'],
    foundIn: 'Anti-aging serums, acne treatments',
    reaction: 'Not a true allergen, but frequently causes irritation, redness, or peeling.'
  }
];

// This keeps track of which allergens the user has clicked "on".
// A Set is like an array, but it automatically ignores duplicates —
// useful here since we only ever want each allergen counted once,
// even if something accidentally tried to add it twice.
const selectedAllergens = new Set();

// This runs the setup code only once the whole HTML page has finished
// loading. Without this wrapper, the script might try to find an
// element (like #allergen-grid) before the browser has created it yet,
// which would cause an error.
document.addEventListener('DOMContentLoaded', () => {
  // Build the clickable allergen buttons and the reference list below
  // them — see the two function definitions further down for what
  // each one actually does.
  renderAllergenGrid();
  renderReferenceList();

  // Wire up the "Clear selection" button: wipe out every selected
  // allergen, and visually un-highlight every chip on the page so the
  // screen matches the (now empty) selection.
  document.getElementById('clear-allergens').addEventListener('click', () => {
    selectedAllergens.clear();
    document.querySelectorAll('.allergen-chip').forEach((chip) => {
      chip.classList.remove('is-selected');
      chip.setAttribute('aria-pressed', 'false');
    });
  });

  // Wire up the "Check ingredients" button — when clicked, run the
  // checkIngredients function defined near the bottom of this file.
  document.getElementById('check-button').addEventListener('click', checkIngredients);
});

// Builds the row of clickable allergen buttons ("chips") at the top
// of the page. Instead of writing each button by hand in the HTML,
// this loops through the ALLERGENS list and creates one button per
// allergen automatically — so adding a new allergen to the list above
// is enough to make a new button appear, with no extra HTML needed.
function renderAllergenGrid() {
  // Find the empty <div id="allergen-grid"> in the HTML — this is
  // the container we'll add all the new buttons into.
  const grid = document.getElementById('allergen-grid');

  // Loop over every allergen in our data list, one at a time.
  ALLERGENS.forEach((allergen) => {
    // Create a new <button> element in memory (it isn't on the page yet).
    const chip = document.createElement('button');
    chip.type = 'button'; // prevents it from accidentally submitting a form
    chip.className = 'allergen-chip'; // this is what the CSS styles target
    chip.textContent = allergen.name; // the visible label, e.g. "Parabens"

    // aria-pressed tells screen readers whether this chip is currently
    // selected — we keep it in sync every time the selection changes.
    chip.setAttribute('aria-pressed', 'false');

    // Store the allergen's id directly on the button itself, so we
    // can always tell which allergen a given chip represents.
    chip.dataset.id = allergen.id;

    // What happens when someone clicks this specific chip:
    chip.addEventListener('click', () => {
      const isSelected = selectedAllergens.has(allergen.id);

      if (isSelected) {
        // It was already selected — clicking again un-selects it.
        selectedAllergens.delete(allergen.id);
        chip.classList.remove('is-selected'); // removes the highlight styling
        chip.setAttribute('aria-pressed', 'false');
      } else {
        // It wasn't selected yet — clicking selects it.
        selectedAllergens.add(allergen.id);
        chip.classList.add('is-selected'); // adds the highlight styling
        chip.setAttribute('aria-pressed', 'true');
      }
    });

    // Actually add this finished button onto the page, inside the grid.
    grid.appendChild(chip);
  });
}

// Builds the "Common skincare allergens — full list" section further
// down the page. Unlike the clickable chips above, these are just
// informational cards — one per allergen, showing its name, where
// it's commonly found, and what reaction it can cause.
function renderReferenceList() {
  const list = document.getElementById('allergen-reference-list');

  ALLERGENS.forEach((allergen) => {
    // Create one list item (<li>) per allergen.
    const item = document.createElement('li');
    item.className = 'allergen-reference__item';

    // innerHTML lets us insert a whole chunk of HTML at once, rather
    // than creating each <h3> and <p> separately. It's quicker to
    // write, but only safe to use here because our ALLERGENS data is
    // text we wrote ourselves — innerHTML can be risky if you ever
    // insert text typed by a random user, since it could contain
    // malicious code.
    item.innerHTML =
      '<h3>' + allergen.name + '</h3>' +
      '<p class="allergen-reference__found"><strong>Found in:</strong> ' + allergen.foundIn + '</p>' +
      '<p class="allergen-reference__reaction">' + allergen.reaction + '</p>';

    list.appendChild(item);
  });
}

// Runs when the user clicks "Check ingredients". It takes whatever
// they typed or pasted into the textarea and searches it for any of
// the allergens they've selected above.
function checkIngredients() {
  // Grab the text the user typed, trim any extra whitespace from the
  // start/end, and convert it all to lowercase. We lowercase it so
  // the search isn't case-sensitive — "Parfum" and "PARFUM" should
  // both count as a match.
  const input = document.getElementById('ingredient-input').value.trim().toLowerCase();
  const resultBox = document.getElementById('check-result');

  // Guard clause #1: if the textarea is empty, stop here and tell
  // the user what to do, instead of trying to search nothing.
  if (!input) {
    resultBox.innerHTML = '<p class="check-result__empty">Paste an ingredient list first.</p>';
    return;
  }

  // Guard clause #2: if they haven't selected any allergens yet,
  // there's nothing meaningful to check against, so stop here too.
  if (selectedAllergens.size === 0) {
    resultBox.innerHTML = '<p class="check-result__empty">Select at least one allergen above first.</p>';
    return;
  }

  // This will collect every allergen we find a match for.
  const matches = [];

  // Go through every allergen in our full database...
  ALLERGENS.forEach((allergen) => {
    // ...but skip any the user hasn't selected — we only want to
    // check against allergens that actually apply to them.
    if (!selectedAllergens.has(allergen.id)) return;

    // .find() looks through this allergen's list of alternate names
    // and returns the first one that appears somewhere in the user's
    // pasted ingredient text. If none of them appear, it returns
    // undefined (which counts as "false" in the if-check below).
    const found = allergen.aliases.find((alias) => input.includes(alias));
    if (found) {
      matches.push({ name: allergen.name, matchedAs: found });
    }
  });

  // If we got through the whole list and found nothing, show a
  // reassuring "all clear" message.
  if (matches.length === 0) {
    resultBox.innerHTML =
      '<p class="check-result__ok">No matches found for your selected allergens in this ingredient list.</p>';
    return;
  }

  // Otherwise, build one bullet-point list item per match found...
  const items = matches
    .map((m) => '<li><strong>' + m.name + '</strong> — matched "' + m.matchedAs + '"</li>')
    .join('');

  // ...and display a warning message plus that list of matches.
  resultBox.innerHTML =
    '<p class="check-result__warning">This product may contain ' + matches.length +
    ' of your selected allergen(s):</p><ul class="check-result__list">' + items + '</ul>';
}