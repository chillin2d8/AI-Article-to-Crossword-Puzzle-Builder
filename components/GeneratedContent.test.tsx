
import '@testing-library/jest-dom/vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { GeneratedContent } from './GeneratedContent';
import { mockGeneratedData } from '../__mocks__/data';

// Mock the Crossword component
vi.mock('./Crossword', () => ({
    Crossword: () => <div data-testid="crossword-mock">Crossword Puzzle Mock</div>
}));


describe('GeneratedContent Component', () => {

  const defaultProps = {
    data: mockGeneratedData,
    tier: 'Free' as const,
    onDownloadPdf: vi.fn(),
    showSolutions: false,
    onToggleSolutions: vi.fn(),
    onReset: vi.fn(),
    onSummaryChange: vi.fn(),
  };

  it('renders the title and summary correctly', () => {
    render(<GeneratedContent {...defaultProps} />);

    // Check for title
    expect(screen.getByText(`${mockGeneratedData.title} - Activity Sheet`)).toBeInTheDocument();

    // Check for summary
    expect(screen.getByText(mockGeneratedData.summary)).toBeInTheDocument();
  });

  it('renders the "Start Over" button', () => {
    render(<GeneratedContent {...defaultProps} />);
    expect(screen.getByText('Start Over')).toBeInTheDocument();
  });


  it('renders the crossword puzzle and clues', () => {
    render(<GeneratedContent {...defaultProps} />);

    // Check for puzzle heading
    expect(screen.getByText('Crossword Puzzle')).toBeInTheDocument();

    // Check for a specific clue
    const clue = mockGeneratedData.gridData.placedWords[0].clue;
    expect(screen.getByText(new RegExp(clue))).toBeInTheDocument();
  });

  it('does not render the crossword section if there are no placed words', () => {
    const dataWithoutWords = {
      ...mockGeneratedData,
      gridData: { ...mockGeneratedData.gridData, placedWords: [] },
    };

    render(<GeneratedContent {...defaultProps} data={dataWithoutWords} />);

    expect(screen.queryByText('Crossword Puzzle')).not.toBeInTheDocument();
  });

  it('displays the crossword warning when present', () => {
    const dataWithWarning = {
      ...mockGeneratedData,
      crosswordWarning: 'This is a test warning.',
    };
    render(<GeneratedContent {...defaultProps} data={dataWithWarning} />);

    expect(screen.getByText('Crossword Notice')).toBeInTheDocument();
    expect(screen.getByText('This is a test warning.')).toBeInTheDocument();
  });
});