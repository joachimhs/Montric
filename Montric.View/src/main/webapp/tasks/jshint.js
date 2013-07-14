module.exports = {
	// define the files to lint
	files: ['Gruntfile.js', 'js/app/**/*.js', 'js/test/**/*.js'],
	// configure JSHint (documented at http://www.jshint.com/docs/)
	options: {
		// more options here if you want to override JSHint defaults
		globals: {
			jQuery: true,
			console: true,
			module: true
		}
	}
};
