import { describe, test, expect } from 'bun:test'
import { screen } from '@testing-library/react'
import { HorseCard } from '../components/horse/card'
import { renderWithProviders } from './test-utils'
import type { Horse } from '../data/horses'

const baseHorse: Horse = {
  id: 1,
  name: 'Spirit',
  age: 7,
  description: 'A free-spirited horse',
  fullDescription: null,
  breed: 'Mustang',
  color: null,
  imageEmoji: '🐴',
  imageUrl: null,
  tags: [
    { id: 1, category: 'gender', label: 'זכר', note: null },
    { id: 2, category: 'temperament', label: 'שקט', note: null },
  ],
}

describe('HorseCard', () => {
  test('renders the horse name', async () => {
    await renderWithProviders(() => <HorseCard horse={baseHorse} />)
    expect(screen.getByText('Spirit')).toBeInTheDocument()
  })

  test('renders the horse age', async () => {
    await renderWithProviders(() => <HorseCard horse={baseHorse} />)
    expect(screen.getByText('גיל: 7')).toBeInTheDocument()
  })

  test('renders the description', async () => {
    await renderWithProviders(() => <HorseCard horse={baseHorse} />)
    expect(screen.getByText('A free-spirited horse')).toBeInTheDocument()
  })

  test('renders the emoji when no imageUrl', async () => {
    await renderWithProviders(() => <HorseCard horse={baseHorse} />)
    expect(screen.getByText('🐴')).toBeInTheDocument()
  })

  test('falls back to default emoji when imageEmoji is null', async () => {
    await renderWithProviders(() => <HorseCard horse={{ ...baseHorse, imageEmoji: null }} />)
    expect(screen.getByText('🐴')).toBeInTheDocument()
  })

  test('renders all tag labels', async () => {
    await renderWithProviders(() => <HorseCard horse={baseHorse} />)
    expect(screen.getByText('זכר')).toBeInTheDocument()
    expect(screen.getByText('שקט')).toBeInTheDocument()
  })

  test('renders a link pointing to the horse detail page', async () => {
    await renderWithProviders(() => <HorseCard horse={baseHorse} />)
    const link = screen.getByRole('link')
    expect(link).toBeInTheDocument()
    expect(link.getAttribute('href')).toContain('/horse/1')
  })

  test('renders a horse with no tags without crashing', async () => {
    await renderWithProviders(() => <HorseCard horse={{ ...baseHorse, tags: [] }} />)
    expect(screen.getByText('Spirit')).toBeInTheDocument()
  })
})
