import { describe, expect, it } from 'vitest';
import { isAdminContextItemActive } from '@/lib/admin-context-navigation';

const searchParams = { get: () => null };

describe('isAdminContextItemActive', () => {
  it('ativa somente Funções na rota de funções', () => {
    expect(isAdminContextItemActive({ label: 'Pessoas', href: '/admin/pessoas' }, '/admin/pessoas/funcoes', searchParams)).toBe(false);
    expect(isAdminContextItemActive({ label: 'Funções', href: '/admin/pessoas/funcoes' }, '/admin/pessoas/funcoes', searchParams)).toBe(true);
  });

  it('aceita a rota canônica de funções', () => {
    expect(isAdminContextItemActive({ label: 'Pessoas', href: '/admin/pessoas' }, '/admin/funcoes', searchParams)).toBe(false);
    expect(isAdminContextItemActive({ label: 'Funções', href: '/admin/pessoas/funcoes' }, '/admin/funcoes', searchParams)).toBe(true);
  });

  it('mantém música ativa nas páginas filhas do módulo', () => {
    expect(isAdminContextItemActive(
      { label: 'Música', href: '/admin/reuniao-publica/musica/inicio', activePath: '/admin/reuniao-publica/musica' },
      '/admin/reuniao-publica/musica/passes',
      searchParams,
    )).toBe(true);
    expect(isAdminContextItemActive(
      { label: 'Reunião', href: '/admin/reuniao-publica/reuniao' },
      '/admin/reuniao-publica/musica/passes',
      searchParams,
    )).toBe(false);
  });
});
