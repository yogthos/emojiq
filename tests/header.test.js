import { h } from 'preact';
import { render } from '@testing-library/preact';
import '@testing-library/jest-dom';
import Header from '../src/components/header';

describe('Initial Test of the Header', () => {
	test('Header renders correctly', () => {
		const { getByText, getAllByRole } = render(<Header />);

		// Check if the header text is present
		expect(getByText('Emoji Word Game')).toBeTruthy();

		// Check if there are 3 links (logo + 2 nav items: Play and Profile)
		const links = getAllByRole('link');
		expect(links).toHaveLength(3);

		// Check if the nav items have the correct text
		expect(getByText('Play')).toBeTruthy();
		expect(getByText('Profile')).toBeTruthy();
	});
});
