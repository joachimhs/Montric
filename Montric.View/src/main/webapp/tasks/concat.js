module.exports = {
	options: {
		// define a string to put between each file in the concatenated output
		separator: '\n'
	},
	dist: {
		// the files to concatenate
		src: ['js/app/**/*.js', 'dist/templates.js'],
		// the location of the resulting JS file
		dest: 'dist/<%= pkg.name %>.js'
	}
};
