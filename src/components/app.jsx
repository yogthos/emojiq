import { h } from 'preact';
import { Router } from 'preact-router';

import Header from './header';

// Code-splitting is automated for `routes` directory
import Profile from '../routes/profile';
import EmojiGame from './EmojiGame';

const App = () => (
	<div id="app">
		<Header />
		<main>
			<Router>
				<EmojiGame path="/" />
				<Profile path="/profile/" user="me" />
				<Profile path="/profile/:user" />
			</Router>
		</main>
	</div>
);

export default App;
