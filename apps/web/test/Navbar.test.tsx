import { render, screen } from '@testing-library/react';
import { Navbar } from '../components/layout/Navbar';
import { vi } from 'vitest';
import * as AuthProviderModule from '../components/providers/AuthProvider';

describe('Navbar Component', () => {
  it('renders sign in/up buttons when not logged in', () => {
    vi.spyOn(AuthProviderModule, 'useAuth').mockReturnValue({
      user: null,
      loading: false,
      login: vi.fn(),
      logout: vi.fn(),
      register: vi.fn(),
      refetchMe: vi.fn(),
    });

    render(<Navbar />);

    expect(screen.getByText('Log in')).toBeInTheDocument();
    expect(screen.getByText('Start Building')).toBeInTheDocument();
  });

  it('renders dashboard button when logged in', () => {
    vi.spyOn(AuthProviderModule, 'useAuth').mockReturnValue({
      user: {
        id: 'user-1',
        name: 'Test',
        email: 'test@test.com',
        credits: 10,
        plan: 'free',
        role: 'user',
        authProvider: 'credentials',
        isBlocked: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      loading: false,
      login: vi.fn(),
      logout: vi.fn(),
      register: vi.fn(),
      refetchMe: vi.fn(),
    });

    render(<Navbar />);

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });
});
