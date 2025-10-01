import { h } from 'preact';
import './style.css';

const Home = () => {
	return (
		<div class="home">
			<a href="https://preactjs.com">
				<img src="../../assets/preact-logo.svg" alt="Preact Logo" height="160" width="160" />
			</a>
			<h1>Get Started Building PWAs with Preact</h1>
			<section>
				<Resource
					title="Learn Preact"
					description="If you're new to Preact, try the interactive tutorial to learn important concepts"
					link="https://preactjs.com/tutorial/"
				/>
				<Resource
					title="Differences to React"
					description="If you're coming from React, check out our docs for where Preact differs"
					link="https://preactjs.com/guide/v10/differences-to-react"
				/>
				<Resource
					title="Learn Vite"
					description="To learn more about Vite, read through the official documentation"
					link="https://vitejs.dev/"
				/>
			</section>
		</div>
	);
};

const Resource = props => {
	return (
		<a href={props.link} class="resource">
			<h2>{props.title}</h2>
			<p>{props.description}</p>
		</a>
	);
};

export default Home;
