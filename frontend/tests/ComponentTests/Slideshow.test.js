import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Slideshow from '../../src/components/Slideshow'; // Adjust the import path as necessary
import { BrowserRouter as Router } from 'react-router-dom';

// Mock the image imports
jest.mock('../src/assets/homepage_image1.jpg', () => 'image1');
jest.mock('../src/assets/gallery/gallery1.jpg', () => 'image2');

describe('Slideshow Component', () => {
    beforeEach(() => {
        jest.clearAllTimers(); // Clear any timers before each test
    });

    afterEach(() => {
        jest.useRealTimers(); // Restore real timers after each test
    });

    test('renders the slideshow with background images', () => {
        render(<Slideshow />);
    
        // Check the first slide's background image
        const firstSlide = screen.getByText(/The pain-free gardening solution suitable for everybody./i).closest('.slide');
        expect(firstSlide).toHaveStyle('background-image: url(homepage_image1.jpg)'); // Adjust the expected URL as necessary
    
        // Fast-forward time to simulate slide change
        jest.advanceTimersByTime(12000); // Match this to your setInterval time
        const secondSlide = screen.getByText(/Order Customised Ezee Planter Box/i).closest('.slide');
        expect(secondSlide).toHaveStyle('background-image: url(gallery/gallery1.jpg)'); // Adjust as necessary
      });

    test('clicking next button advances the slide', () => {
        render(
            <Router>
                <Slideshow />
            </Router>
        );

        // Click the next button
        fireEvent.click(screen.getByRole('button', { name: /→/i }));

        // Expect the second slide to be active
        expect(screen.getByText(/Order Customised Ezee Planter Box/i)).toBeVisible();
    });

    test('clicking previous button goes back to the slide', () => {
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
        expect(screen.getByText(/The pain-free gardening solution suitable for everybody/i)).toBeVisible();
    });

    test('auto-slide changes the current slide', () => {
        jest.useFakeTimers(); // Use fake timers to control setInterval

        render(
            <Router>
                <Slideshow />
            </Router>
        );

        // Advance time by 12000 ms to simulate auto-slide
        jest.advanceTimersByTime(12000);

        // The second slide should be active after 12000 ms
        expect(screen.getByText(/Order Customised Ezee Planter Box/i)).toBeVisible();

        // Advance time again to move to the first slide
        jest.advanceTimersByTime(12000);
        expect(screen.getByText(/The pain-free gardening solution suitable for everybody/i)).toBeVisible();
    });

    test('pause auto-slide on manual navigation', async () => {
        jest.useFakeTimers();
      
        render(
          <Router>
            <Slideshow />
          </Router>
        );
      
        // Fast forward the timer to simulate the auto-slide
        jest.advanceTimersByTime(12000); // Adjust based on your actual slide timing
      
        // Wait for the second slide's content to appear
        await waitFor(() => {
          // Check if the heading is visible using a simple query
          const heading = screen.getByText(/Order Customised Ezee Planter Box/i);
          expect(heading).toBeVisible();
        });
      
        // Look for the button
        const orderButton = screen.getByRole('button', { name: /order customised planter box/i });
        expect(orderButton).toBeVisible();
      
        // Simulate manual navigation by clicking the next button
        fireEvent.click(screen.getByRole('button', { name: /→/i }));
      
        // Fast forward the timer again
        jest.advanceTimersByTime(12000); // Adjust based on your timing
      
        // Ensure the auto-slide pauses and the heading is still visible
        await waitFor(() => {
          // Check if the heading is still visible after manual navigation
          const heading = screen.getByText(/Order Customised Ezee Planter Box/i);
          expect(heading).toBeVisible();
        });
    });    
});
