import {EventEmitter} from 'events';

export class LogProvider extends EventEmitter {
	static levels = ['Debug', 'Info', 'Warning', 'Error', 'Fatal'];

	cachedEntries = [];

	constructor (limit = 50) {
		super();
		this.baseLimit = limit;
		this.loading = false;
		this.limit = limit;
		this.searchQuery = '';
	}

	reset () {
		this.limit = this.baseLimit;
		this.cachedEntries = [];
		this.loading = false;
	}

	get entries () {
		return cachedEntries;
	}

	set query (newQuery) {
		if (newQuery !== this.searchQuery) {
			this.searchQuery = newQuery;
			this.reset();
			this.load();
		}
	}

	get query () {
		return this.searchQuery;
	}

	async load () {
		this.loading = true;
		if (this.cachedEntries.length >= this.limit) {
			return;
		}
		var newData = await this.loadEntries(this.cachedEntries.length, this.limit - this.cachedEntries.length);
		this.cachedEntries = this.cachedEntries.concat(newData.data);
		this.loading = false;
		this.emit('entries', this.cachedEntries);
	}

	loadEntries (offset, count = 50) {
		if (this.searchQuery) {
			return $.get(OC.generateUrl('/apps/logreader/search'), {
				offset,
				count,
				query: this.query
			});
		} else {
			return $.get(OC.generateUrl('/apps/logreader/get'), {
				offset,
				count
			});
		}
	}

	async getLevels() {
		const levels = await $.get(OC.generateUrl('/apps/logreader/levels'));
		return levels.split('').map(level => level > 0);
	}

	setLevels(levels) {
		const levelsString = levels.map(level => level ? 1 : 0).join('');
		return $.ajax({
			type: 'PUT',
			url: OC.generateUrl('/apps/logreader/levels'),
			data: {levels: levelsString}
		});
	}
}
