import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import Game from '../src/app/page';
import "@testing-library/jest-dom/extend-expect";
import axios from 'axios';

jest.mock('axios');

describe('Game', () => {
    test('should set the initial colors on the sources for the first 3 clicks on sources', async () => {
        const mockInitialGameData = {
            userId: 'mockUserId',
            width: 10,
            height: 4,
            maxMoves: 10,
            target: [255, 255, 255],
        };

        axios.get.mockResolvedValue({ data: mockInitialGameData });

        render(<Game />);
        await waitFor(() => {
            expect(axios.get).toHaveBeenCalledWith('http://localhost:9876/init');
            // Click on the first source and verify its color
            const sourceRed = screen.getByTestId('source-1-0');
            fireEvent.click(sourceRed);
            expect(sourceRed).toHaveStyle({ backgroundColor: 'rgb(255, 0, 0)' });

            // Click on the second source and verify its color
            const sourceGreen = screen.getByTestId('source-2-0');
            fireEvent.click(sourceGreen);
            expect(sourceGreen).toHaveStyle({ backgroundColor: 'rgb(0, 255, 0)' });

            // Click on the third source and verify its color
            const sourceBlue = screen.getByTestId('source-3-0');
            fireEvent.click(sourceBlue);
            expect(sourceBlue).toHaveStyle({ backgroundColor: 'rgb(0, 0, 255)' });
        })

    });
});
