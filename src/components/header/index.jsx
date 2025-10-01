import { h } from 'preact';
import { Link } from 'preact-router/match';
import './style.css';

const Header = () => (
	<header class="header">
		<a href="/" class="logo">

			<h1>Emoji Word Game</h1>
		</a>
		<nav>
			<Link activeClassName="active" href="/">
				Play
			</Link>
			<Link activeClassName="active" href="/profile">
				Profile
			</Link>
		</nav>
	</header>
);

export default Header;
