import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import StarRating from '../src/components/StarRating'; // Adjust the import path based on your folder structure

describe('StarRating Component', () => {
    test('renders correct number of stars', () => {
        render(<StarRating rating={3} maxStars={5} />);

        // Check if 5 stars are rendered
        const stars = screen.getAllByLabelText(/star/i);
        expect(stars).toHaveLength(5);
    });

    test('renders the correct number of filled stars based on the rating', () => {
        render(<StarRating rating={3} maxStars={5} />);

        // Check if the correct number of stars are filled
        const filledStars = screen.getAllByText('★', { exact: false }).filter(star => star.classList.contains('filled'));
        expect(filledStars).toHaveLength(3);
    });

    test('renders stars within valid rating bounds', () => {
        // Rating greater than maxStars should still only fill maxStars
        render(<StarRating rating={7} maxStars={5} />);

        const stars = screen.getAllByLabelText(/star/i);
        expect(stars).toHaveLength(5);

        const filledStars = screen.getAllByText('★', { exact: false }).filter(star => star.classList.contains('filled'));
        expect(filledStars).toHaveLength(5); // Should fill all 5 stars

        // Now check rating less than 0
        render(<StarRating rating={-3} maxStars={5} />);

        const noFilledStars = screen.getAllByText('★', { exact: false }).filter(star => !star.classList.contains('filled'));
        expect(noFilledStars).toHaveLength(5); // No stars should be filled
    });

    test('renders correctly with a custom maxStars value', () => {
        render(<StarRating rating={2} maxStars={10} />);

        // Check if 10 stars are rendered
        const stars = screen.getAllByLabelText(/star/i);
        expect(stars).toHaveLength(10);

        // Check if the first 2 stars are filled
        const filledStars = screen.getAllByText('★', { exact: false }).filter(star => star.classList.contains('filled'));
        expect(filledStars).toHaveLength(2);
    });

    test('renders correctly with rating equal to maxStars', () => {
        render(<StarRating rating={5} maxStars={5} />);

        // Check if all 5 stars are filled
        const filledStars = screen.getAllByText('★', { exact: false }).filter(star => star.classList.contains('filled'));
        expect(filledStars).toHaveLength(5);
    });

    test('renders correctly with rating 0', () => {
        render(<StarRating rating={0} maxStars={5} />);

        // Check if no stars are filled
        const filledStars = screen.getAllByText('★', { exact: false }).filter(star => star.classList.contains('filled'));
        expect(filledStars).toHaveLength(0);
    });
});