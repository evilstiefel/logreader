import React, {Component} from 'react/addons';
import ReactScrolla from 'react-scrolla';

import {LogProvider} from './Providers/LogProvider.js';
import {LogTable} from './Components/LogTable.js';
import {ToggleEntry} from './Components/ToggleEntry.js';
import {App as AppContainer, SideBar, Content} from 'oc-react-components';

import {LogSearch} from './Search.js';

import styles from '../css/app.css';

export class App extends Component {
	state = {
		'entries': [],
		'loading': false,
		'levels': [false, false, false, false, false]
	};

	constructor () {
		super();
		this.logProvider = new LogProvider(50);
		this.logProvider.on('entries', entries => {
			this.setState({entries});
		});
		OCA.Search.logreader = new LogSearch(this.logProvider);
		this.saveLevels = _.debounce(this.logProvider.setLevels, 100);
	}

	async componentDidMount() {
		const levels = await this.logProvider.getLevels();
		this.setState({levels});
		this.logProvider.load();
	}

	fetchNextPage = async() => {
		this.setState({loading: true});
		this.logProvider.limit += 25;
		await this.logProvider.load();
		this.setState({loading: false});
	};

	setLevel (level, newState) {
		let levels = this.state.levels;
		levels[level] = newState;
		const entries = this.state.entries.filter(entry=> {
			return this.state.levels[entry.level];
		});
		if (entries.length < 50) {
			this.fetchNextPage();
		}
		this.setState({levels});
		this.saveLevels(levels);
	}

	render () {
		let entries = this.state.entries.filter(entry=> {
			return this.state.levels[entry.level];
		});

		let filters = this.state.levels.map((status, level)=> {
			return (
				<ToggleEntry key={level} active={status}
							 onChange={this.setLevel.bind(this, level)}>
					{LogProvider.levels[level]}
				</ToggleEntry>
			);
		});

		return (
			<AppContainer appId="logreader">
				<SideBar>
					{filters}
				</SideBar>

				<ReactScrolla
					id="app-content"
					percentage={85}
					onPercentage={this.fetchNextPage}
					isLoading={this.state.loading}>
					<div className={styles.content}>
						<LogTable entries={entries}/>
					</div>
				</ReactScrolla>
			</AppContainer>
		);
	}
}
