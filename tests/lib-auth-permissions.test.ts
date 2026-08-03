import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getUserPermissions, requirePermission, checkPermission, checkModuleAccess, type PermissionFlag } from '@/lib/auth/permissions';
import * as supabaseServer from '@/lib/supabase/server';

vi.mock('@/lib/supabase/server');

const mockCreateClient = vi.mocked(supabaseServer.createClient);

describe('lib/auth/permissions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getUserPermissions', () => {
    it('returns null when user is not authenticated', async () => {
      mockCreateClient.mockResolvedValueOnce({
        auth: {
          getUser: vi.fn().mockResolvedValueOnce({
            data: { user: null },
          }),
        },
      } as any);

      const result = await getUserPermissions();
      expect(result).toBeNull();
    });

    it('returns null when getUser throws error', async () => {
      mockCreateClient.mockResolvedValueOnce({
        auth: {
          getUser: vi.fn().mockRejectedValueOnce(new Error('Auth error')),
        },
      } as any);

      const result = await getUserPermissions();
      expect(result).toBeNull();
    });

    it('returns user permissions from database', async () => {
      const mockUser = { id: 'user-123', app_metadata: {} };
      const mockUserSistema = {
        id: 'user-123',
        pessoa_id: 'pessoa-456',
        perfil: 'admin',
        pode_escalas: true,
        pode_biblioteca: true,
        pode_livraria: false,
        pode_financeiro: true,
        pode_pessoas: true,
        pode_publicar: false,
        pode_mediunidade: true,
        pode_atendimento: true,
        pode_apse: false,
      };

      mockCreateClient.mockResolvedValueOnce({
        auth: {
          getUser: vi.fn().mockResolvedValueOnce({
            data: { user: mockUser },
          }),
        },
        from: vi.fn().mockReturnValueOnce({
          select: vi.fn().mockReturnValueOnce({
            eq: vi.fn().mockReturnValueOnce({
              maybeSingle: vi.fn().mockResolvedValueOnce({
                data: mockUserSistema,
                error: null,
              }),
            }),
          }),
        }),
      } as any);

      const result = await getUserPermissions();
      expect(result).toEqual(mockUserSistema);
      expect(result?.pode_escalas).toBe(true);
      expect(result?.pode_biblioteca).toBe(true);
    });

    it('falls back to app_metadata when database query fails', async () => {
      const mockUser = {
        id: 'user-123',
        app_metadata: {
          site_role: 'moderador',
          pode_escalas: true,
          pode_pessoas: false,
          pode_mediunidade: true,
        },
      };

      mockCreateClient.mockResolvedValueOnce({
        auth: {
          getUser: vi.fn().mockResolvedValueOnce({
            data: { user: mockUser },
          }),
        },
        from: vi.fn().mockReturnValueOnce({
          select: vi.fn().mockReturnValueOnce({
            eq: vi.fn().mockReturnValueOnce({
              maybeSingle: vi.fn().mockResolvedValueOnce({
                data: null,
                error: new Error('DB error'),
              }),
            }),
          }),
        }),
      } as any);

      const result = await getUserPermissions();
      expect(result).toEqual({
        id: 'user-123',
        pessoa_id: null,
        perfil: 'moderador',
        pode_escalas: true,
        pode_biblioteca: false,
        pode_livraria: false,
        pode_financeiro: false,
        pode_pessoas: false,
        pode_publicar: false,
        pode_mediunidade: true,
        pode_atendimento: false,
        pode_apse: false,
      });
    });

    it('defaults to publico role when site_role is not set', async () => {
      const mockUser = {
        id: 'user-123',
        app_metadata: {},
      };

      mockCreateClient.mockResolvedValueOnce({
        auth: {
          getUser: vi.fn().mockResolvedValueOnce({
            data: { user: mockUser },
          }),
        },
        from: vi.fn().mockReturnValueOnce({
          select: vi.fn().mockReturnValueOnce({
            eq: vi.fn().mockReturnValueOnce({
              maybeSingle: vi.fn().mockResolvedValueOnce({
                data: null,
              }),
            }),
          }),
        }),
      } as any);

      const result = await getUserPermissions();
      expect(result?.perfil).toBe('publico');
      expect(result?.pode_escalas).toBe(false);
    });
  });

  describe('requirePermission', () => {
    it('throws error when permission is denied', async () => {
      mockCreateClient.mockResolvedValueOnce({
        auth: {
          getUser: vi.fn().mockResolvedValueOnce({
            data: { user: null },
          }),
        },
      } as any);

      await expect(requirePermission('pode_financeiro')).rejects.toThrow(
        'Access denied: pode_financeiro required',
      );
    });

    it('returns permissions when permission is granted', async () => {
      const mockUser = { id: 'user-123', app_metadata: { pode_financeiro: true } };
      const mockPerms = {
        id: 'user-123',
        pessoa_id: null,
        perfil: 'admin',
        pode_escalas: true,
        pode_biblioteca: true,
        pode_livraria: true,
        pode_financeiro: true,
        pode_pessoas: true,
        pode_publicar: true,
        pode_mediunidade: true,
        pode_atendimento: true,
        pode_apse: true,
      };

      mockCreateClient.mockResolvedValueOnce({
        auth: {
          getUser: vi.fn().mockResolvedValueOnce({
            data: { user: mockUser },
          }),
        },
        from: vi.fn().mockReturnValueOnce({
          select: vi.fn().mockReturnValueOnce({
            eq: vi.fn().mockReturnValueOnce({
              maybeSingle: vi.fn().mockResolvedValueOnce({
                data: mockPerms,
              }),
            }),
          }),
        }),
      } as any);

      const result = await requirePermission('pode_financeiro');
      expect(result).toEqual(mockPerms);
    });

    it('throws error when permission flag is false', async () => {
      const mockUser = { id: 'user-123', app_metadata: { pode_financeiro: false } };

      mockCreateClient.mockResolvedValueOnce({
        auth: {
          getUser: vi.fn().mockResolvedValueOnce({
            data: { user: mockUser },
          }),
        },
        from: vi.fn().mockReturnValueOnce({
          select: vi.fn().mockReturnValueOnce({
            eq: vi.fn().mockReturnValueOnce({
              maybeSingle: vi.fn().mockResolvedValueOnce({
                data: null,
              }),
            }),
          }),
        }),
      } as any);

      await expect(requirePermission('pode_financeiro')).rejects.toThrow(
        'Access denied: pode_financeiro required',
      );
    });
  });

  describe('checkPermission', () => {
    it('returns false when user is not authenticated', async () => {
      mockCreateClient.mockResolvedValueOnce({
        auth: {
          getUser: vi.fn().mockResolvedValueOnce({
            data: { user: null },
          }),
        },
      } as any);

      const result = await checkPermission('pode_escalas');
      expect(result).toBe(false);
    });

    it('returns true when permission is granted', async () => {
      const mockUser = { id: 'user-123', app_metadata: { pode_escalas: true } };
      const mockPerms = {
        id: 'user-123',
        pessoa_id: null,
        perfil: 'admin',
        pode_escalas: true,
        pode_biblioteca: true,
        pode_livraria: true,
        pode_financeiro: true,
        pode_pessoas: true,
        pode_publicar: true,
        pode_mediunidade: true,
        pode_atendimento: true,
        pode_apse: true,
      };

      mockCreateClient.mockResolvedValueOnce({
        auth: {
          getUser: vi.fn().mockResolvedValueOnce({
            data: { user: mockUser },
          }),
        },
        from: vi.fn().mockReturnValueOnce({
          select: vi.fn().mockReturnValueOnce({
            eq: vi.fn().mockReturnValueOnce({
              maybeSingle: vi.fn().mockResolvedValueOnce({
                data: mockPerms,
              }),
            }),
          }),
        }),
      } as any);

      const result = await checkPermission('pode_escalas');
      expect(result).toBe(true);
    });

    it('returns false when permission is explicitly denied', async () => {
      const mockUser = { id: 'user-123', app_metadata: { pode_escalas: false } };
      const mockPerms = {
        id: 'user-123',
        pessoa_id: null,
        perfil: 'user',
        pode_escalas: false,
        pode_biblioteca: false,
        pode_livraria: false,
        pode_financeiro: false,
        pode_pessoas: false,
        pode_publicar: false,
        pode_mediunidade: false,
        pode_atendimento: false,
        pode_apse: false,
      };

      mockCreateClient.mockResolvedValueOnce({
        auth: {
          getUser: vi.fn().mockResolvedValueOnce({
            data: { user: mockUser },
          }),
        },
        from: vi.fn().mockReturnValueOnce({
          select: vi.fn().mockReturnValueOnce({
            eq: vi.fn().mockReturnValueOnce({
              maybeSingle: vi.fn().mockResolvedValueOnce({
                data: mockPerms,
              }),
            }),
          }),
        }),
      } as any);

      const result = await checkPermission('pode_escalas');
      expect(result).toBe(false);
    });
  });

  describe('checkModuleAccess', () => {
    it('allows an authorized module profile without the boolean flag', async () => {
      mockCreateClient.mockResolvedValueOnce({
        auth: { getUser: vi.fn().mockResolvedValueOnce({ data: { user: { id: 'user-123', app_metadata: {} } } }) },
        from: vi.fn().mockReturnValueOnce({
          select: vi.fn().mockReturnValueOnce({
            eq: vi.fn().mockReturnValueOnce({
              maybeSingle: vi.fn().mockResolvedValueOnce({ data: { id: 'user-123', perfil: 'secretaria', pode_pessoas: false } }),
            }),
          }),
        }),
      } as any);

      await expect(checkModuleAccess('pode_pessoas', ['diretoria', 'secretaria'])).resolves.toBe(true);
    });

    it('denies an unrelated profile without the boolean flag', async () => {
      mockCreateClient.mockResolvedValueOnce({
        auth: { getUser: vi.fn().mockResolvedValueOnce({ data: { user: { id: 'user-123', app_metadata: {} } } }) },
        from: vi.fn().mockReturnValueOnce({
          select: vi.fn().mockReturnValueOnce({
            eq: vi.fn().mockReturnValueOnce({
              maybeSingle: vi.fn().mockResolvedValueOnce({ data: { id: 'user-123', perfil: 'voluntario', pode_pessoas: false } }),
            }),
          }),
        }),
      } as any);

      await expect(checkModuleAccess('pode_pessoas', ['diretoria', 'secretaria'])).resolves.toBe(false);
    });
  });
});
