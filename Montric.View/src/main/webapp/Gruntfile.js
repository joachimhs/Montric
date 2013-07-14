function config(name) {
	return require('./tasks/' + name);
}

module.exports = function(grunt) {

	// Project configuration.
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		concat: config('concat'),
		jshint: config('jshint'),
		emberTemplates: config('emberTemplates'),
		uglify: config('uglify')
	});

	// Load the plugin that provides the "concat" task.
	grunt.loadNpmTasks('grunt-contrib-concat');

	// Load the plugin that provides the "jshint" task.
	grunt.loadNpmTasks('grunt-contrib-jshint');
	
	//Load the plugin that provides Handlebars Template Precompilation
	grunt.loadNpmTasks('grunt-ember-templates');

	// Load the plugin that provides the "jshint" task.
	grunt.loadNpmTasks('grunt-contrib-uglify');
	
	// Default task(s).
	grunt.registerTask('default', ['emberTemplates', 'concat', 'uglify']);

};
