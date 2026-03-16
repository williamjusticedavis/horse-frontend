import { describe, test, expect, mock } from 'bun:test'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LoginPage } from '../pages/login'
import { renderWithProviders } from './test-utils'
import { ApiError } from '../lib/query-client'

async function renderLogin(loginFn = mock(async () => {})) {
  return renderWithProviders(() => <LoginPage />, { authOverrides: { login: loginFn } })
}

function submitForm() {
  fireEvent.submit(screen.getByRole('button', { name: 'כניסה' }).closest('form')!)
}

describe('LoginPage', () => {
  test('renders the form fields and submit button', async () => {
    await renderLogin()
    expect(screen.getByLabelText('אימייל')).toBeInTheDocument()
    expect(screen.getByLabelText('סיסמה')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'כניסה' })).toBeInTheDocument()
  })

  test('shows validation error when email is empty', async () => {
    await renderLogin()
    submitForm()
    await waitFor(() => {
      expect(screen.getByText('נדרשת כתובת אימייל')).toBeInTheDocument()
    })
  })

  test('shows validation error when password is empty', async () => {
    await renderLogin()
    await userEvent.type(screen.getByLabelText('אימייל'), 'test@example.com')
    submitForm()
    await waitFor(() => {
      expect(screen.getByText('נדרשת סיסמה')).toBeInTheDocument()
    })
  })

  test('does not call login when validation fails', async () => {
    const loginFn = mock(async () => {})
    await renderLogin(loginFn)
    submitForm()
    await waitFor(() => screen.getByText('נדרשת כתובת אימייל'))
    expect(loginFn).not.toHaveBeenCalled()
  })

  test('calls login with email and password on valid submission', async () => {
    const loginFn = mock(async () => {})
    await renderLogin(loginFn)
    await userEvent.type(screen.getByLabelText('אימייל'), 'user@example.com')
    await userEvent.type(screen.getByLabelText('סיסמה'), 'secret123')
    submitForm()
    await waitFor(() => {
      expect(loginFn).toHaveBeenCalledWith('user@example.com', 'secret123')
    })
  })

  test('shows 401 error as friendly Hebrew message', async () => {
    const loginFn = mock(async () => {
      throw new ApiError(401, 'Unauthorized')
    })
    await renderLogin(loginFn)
    await userEvent.type(screen.getByLabelText('אימייל'), 'user@example.com')
    await userEvent.type(screen.getByLabelText('סיסמה'), 'wrongpassword')
    submitForm()
    await waitFor(() => {
      expect(screen.getByText('אימייל או סיסמה שגויים')).toBeInTheDocument()
    })
  })

  test('shows generic error for non-401 server errors', async () => {
    const loginFn = mock(async () => {
      throw new ApiError(500, 'Internal Server Error')
    })
    await renderLogin(loginFn)
    await userEvent.type(screen.getByLabelText('אימייל'), 'user@example.com')
    await userEvent.type(screen.getByLabelText('סיסמה'), 'password123')
    submitForm()
    await waitFor(() => {
      expect(screen.getByText('משהו השתבש. נסה שנית.')).toBeInTheDocument()
    })
  })

  test('has a link to the register page', async () => {
    await renderLogin()
    expect(screen.getByRole('link', { name: 'הירשם' })).toBeInTheDocument()
  })
})
