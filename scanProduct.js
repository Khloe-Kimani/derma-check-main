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

const selectedAllergens = new Set();

document.addEventListener('DOMContentLoaded', () => {
  renderAllergenGrid();
  renderReferenceList();

  document.getElementById('clear-allergens').addEventListener('click', () => {
    selectedAllergens.clear();
    document.querySelectorAll('.allergen-chip').forEach((chip) => {
      chip.classList.remove('is-selected');
      chip.setAttribute('aria-pressed', 'false');
    });
  });

  document.getElementById('check-button').addEventListener('click', checkIngredients);
});

function renderAllergenGrid() {
  const grid = document.getElementById('allergen-grid');

  ALLERGENS.forEach((allergen) => {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'allergen-chip';
    chip.textContent = allergen.name;
    chip.setAttribute('aria-pressed', 'false');
    chip.dataset.id = allergen.id;

    chip.addEventListener('click', () => {
      const isSelected = selectedAllergens.has(allergen.id);

      if (isSelected) {
        selectedAllergens.delete(allergen.id);
        chip.classList.remove('is-selected');
        chip.setAttribute('aria-pressed', 'false');
      } else {
        selectedAllergens.add(allergen.id);
        chip.classList.add('is-selected');
        chip.setAttribute('aria-pressed', 'true');
      }
    });

    grid.appendChild(chip);
  });
}

function renderReferenceList() {
  const list = document.getElementById('allergen-reference-list');

  ALLERGENS.forEach((allergen) => {
    const item = document.createElement('li');
    item.className = 'allergen-reference__item';
    //adds js into HTML//
    item.innerHTML =
      '<h3>' + allergen.name + '</h3>' +
      '<p class="allergen-reference__found"><strong>Found in:</strong> ' + allergen.foundIn + '</p>' +
      '<p class="allergen-reference__reaction">' + allergen.reaction + '</p>';
    list.appendChild(item);
  });
}

function checkIngredients() {
  const input = document.getElementById('ingredient-input').value.trim().toLowerCase();
  const resultBox = document.getElementById('check-result');

  if (!input) {
    resultBox.innerHTML = '<p class="check-result__empty">Paste an ingredient list first.</p>';
    return;
  }

  if (selectedAllergens.size === 0) {
    resultBox.innerHTML = '<p class="check-result__empty">Select at least one allergen above first.</p>';
    return;
  }

  const matches = [];

  ALLERGENS.forEach((allergen) => {
    if (!selectedAllergens.has(allergen.id)) return;

    const found = allergen.aliases.find((alias) => input.includes(alias));
    if (found) {
      matches.push({ name: allergen.name, matchedAs: found });
    }
  });

  if (matches.length === 0) {
    resultBox.innerHTML =
      '<p class="check-result__ok">No matches found for your selected allergens in this ingredient list.</p>';
    return;
  }

  const items = matches
    .map((m) => '<li><strong>' + m.name + '</strong> — matched "' + m.matchedAs + '"</li>')
    .join('');

  resultBox.innerHTML =
    '<p class="check-result__warning">This product may contain ' + matches.length +
    ' of your selected allergen(s):</p><ul class="check-result__list">' + items + '</ul>';
}