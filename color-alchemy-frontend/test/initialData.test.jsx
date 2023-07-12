import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import axios from 'axios';
import Game from '../src/app/page';
import "@testing-library/jest-dom/extend-expect";


jest.mock('axios');

describe('Game', () => {
    test('should initialize the game', async () => {
        const mockGameData = {
            userId: 'test-user',
            width: 10,
            height: 4,
            maxMoves: 10,
            target: [255, 0, 0],
        };

        axios.get.mockResolvedValue({ data: mockGameData });

        render(<Game />);

        await waitFor(() => {
            expect(axios.get).toHaveBeenCalledWith('http://localhost:9876/init');
            expect(screen.getByText('User ID: test-user')).toBeInTheDocument();
            expect(screen.getByText('Moves left: 10')).toBeInTheDocument();
            expect(screen.getByText('Target color:')).toBeInTheDocument();
            expect(screen.getByText((content, element) => {
                return element.tagName.toLowerCase() === 'div' && content.includes('Δ = 100%');
            })).toBeInTheDocument();
        });
    });
});
