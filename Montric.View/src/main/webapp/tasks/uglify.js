module.exports = {
	options: {
		banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n'
	},
	dist: {
		files: {
			'dist/<%= pkg.name %>.min.js': ['<%= concat.dist.dest %>']
		}
	}
};
