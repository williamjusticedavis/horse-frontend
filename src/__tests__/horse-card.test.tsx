import { describe, test, expect, mock } from 'bun:test'
import { screen, fireEvent } from '@testing-library/react'
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
  imageUrl: null,
  tags: [
    { id: 1, category: 'gender', label: 'זכר', note: null },
    { id: 2, category: 'temperament', label: 'שקט', note: null },
  ],
}

describe('HorseCard', () => {
  test('renders the horse name', async () => {
    await renderWithProviders(() => <HorseCard horse={baseHorse} />)
    expect(screen.getByRole('heading', { name: 'Spirit' })).toBeInTheDocument()
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
    expect(screen.getByRole('heading', { name: 'Spirit' })).toBeInTheDocument()
  })

  test('calls onEditTags when edit button is clicked', async () => {
    const onEditTags = mock(() => {})
    await renderWithProviders(() => <HorseCard horse={baseHorse} onEditTags={onEditTags} />)
    fireEvent.click(screen.getByRole('button', { name: /תגיות/ }))
    expect(onEditTags).toHaveBeenCalledTimes(1)
  })

  test('calls onDelete when delete button is clicked', async () => {
    const onDelete = mock(() => {})
    await renderWithProviders(() => <HorseCard horse={baseHorse} onDelete={onDelete} />)
    fireEvent.click(screen.getByRole('button', { name: /מחק/ }))
    expect(onDelete).toHaveBeenCalledTimes(1)
  })
})
