import { excerpt, highlightHtml } from './format';

describe('highlightHtml', () => {
  it('markiert Treffer nur im Text, nicht in Tags oder Attributen', () => {
    const html = '<p>Anmeldung über das <a href="/anmeldung">Anmeldeformular</a></p>';
    expect(highlightHtml(html, ['anmeld'])).toBe(
      '<p><mark>Anmeld</mark>ung über das <a href="/anmeldung"><mark>Anmeld</mark>eformular</a></p>',
    );
  });

  it('behandelt Sonderzeichen in der Suche als normalen Text', () => {
    expect(highlightHtml('<p>Kosten (CHF)</p>', ['(chf)'])).toBe('<p>Kosten <mark>(CHF)</mark></p>');
  });
});

describe('excerpt', () => {
  it('beginnt den Teaser kurz vor einem Treffer weit hinten im Text', () => {
    const text = `${'Einleitung '.repeat(20)}Pikettplan Winterdienst`;
    const result = excerpt(text, ['pikettplan']);
    expect(result.startsWith('… ')).toBe(true);
    expect(result).toContain('Pikettplan');
  });
});
