import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react'
import { describe, it, expect, vi, afterEach } from 'vitest'
import Signup from '@/app/signup/page'

// Clean DOM between tests
afterEach(() => {
  cleanup()
})

// Mock Next router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}))

// Mock Supabase
vi.mock('@/app/lib/supabaseClient', () => ({
  supabase: {
    auth: {
      signUp: vi.fn().mockResolvedValue({
        data: { user: { id: '123', email: 'test@test.com' } },
        error: null,
      }),
    },
    from: vi.fn(() => ({
      insert: vi.fn().mockResolvedValue({ error: null }),
    })),
  },
}))

describe('Signup page (client-side)', () => {
  it('renders signup form', () => {
    render(<Signup />)

    expect(
      screen.getByRole('heading', { name: /sign up/i })
    ).toBeInTheDocument()

    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument()

    expect(
      screen.getByRole('button', { name: /sign up/i })
    ).toBeInTheDocument()
  })

  it('shows loading state after form submission', async () => {
    render(<Signup />)

    fireEvent.change(screen.getByPlaceholderText('Email'), {
      target: { value: 'test@test.com' },
    })

    fireEvent.change(screen.getByPlaceholderText('Password'), {
      target: { value: 'password123' },
    })

    fireEvent.click(
      screen.getByRole('button', { name: /sign up/i })
    )

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /creating account/i })
      ).toBeInTheDocument()
    })
  })
})