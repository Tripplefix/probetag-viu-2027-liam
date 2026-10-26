import { render, screen } from '@testing-library/react';
import App from './App';

// Beispieltest: zeigt, dass Vitest und Testing Library laufen.
// Ersetze oder ergänze ihn durch deine eigenen Tests.
describe('App', () => {
  it('zeigt den Titel der News-Wall', () => {
    vi.stubGlobal('fetch', vi.fn(() => new Promise(() => {})));
    render(<App />);
    expect(screen.getByRole('heading', { name: 'News aus der Verwaltung' })).toBeInTheDocument();
  });
});
