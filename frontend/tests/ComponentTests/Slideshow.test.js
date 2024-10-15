import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Slideshow from '../../src/components/Slideshow'; // Adjust the import path as necessary
import { BrowserRouter as Router } from 'react-router-dom';

// Mock the image imports
jest.mock('../src/assets/homepage_image1.jpg', () => 'image1');
jest.mock('../src/assets/gallery/gallery1.jpg', () => 'image2');

describe('Slideshow Component', () => {
    beforeEach(() => {
        jest.useFakeTimers(); // Use fake timers to control setInterval
        jest.clearAllTimers(); // Clear any timers before each test
    });

    afterEach(() => {
        jest.useRealTimers(); // Restore real timers after each test
    });

    test('renders the correct images and buttons', async () => {
        render(
            <Router>
                <Slideshow />
            </Router>
        );

        // Check the motto of the first slide
        expect(screen.getByText(/The pain-free gardening solution suitable for everybody/i)).toBeInTheDocument();

        // Fast-forward time to simulate the slide change
        jest.advanceTimersByTime(12000); // Move to the next slide after 12 seconds

        // Now check for the button on the second slide
        const orderButton = await screen.findByRole('button', { name: /Order Customised Planter Box/i });

        // Expect the button to be in the document
        expect(orderButton).toBeInTheDocument();
    });

    test('clicking next button advances the slide', async () => {
        render(
            <Router>
                <Slideshow />
            </Router>
        );

        // Click the next button
        fireEvent.click(screen.getByRole('button', { name: /→/i }));

        // Expect the second slide to be active
        const secondSlideHeading = await screen.findByText(/Order Customised Ezee Planter Box/i);
        expect(secondSlideHeading).toBeVisible();
    });

    test('clicking previous button goes back to the slide', async () => {
        render(
            <Router>
                <Slideshow />
            </Router>
        );

        // Move to the second slide
        fireEvent.click(screen.getByRole('button', { name: /→/i }));

        // Now click the previous button
        fireEvent.click(screen.getByRole('button', { name: /←/i }));

        // Expect to see the first slide's motto text
        const firstSlideMotto = await screen.findByText(/The pain-free gardening solution suitable for everybody/i);
        expect(firstSlideMotto).toBeVisible();
    });

    test('auto-slide changes the current slide', async () => {
        render(
            <Router>
                <Slideshow />
            </Router>
        );

        // Advance time by 12000 ms to simulate auto-slide
        jest.advanceTimersByTime(12000);

        // The second slide should be active after 12000 ms
        const secondSlideHeading = await screen.findByText(/Order Customised Ezee Planter Box/i);
        expect(secondSlideHeading).toBeVisible();

        // Advance time again to move to the first slide
        jest.advanceTimersByTime(12000);
        const firstSlideMotto = await screen.findByText(/The pain-free gardening solution suitable for everybody/i);
        expect(firstSlideMotto).toBeVisible();
    });
});
