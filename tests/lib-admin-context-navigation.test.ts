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
});
