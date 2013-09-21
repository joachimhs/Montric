function config(name) {
	return require('./tasks/' + name + ".js");
}

module.exports = function(grunt) {

	// Project configuration.
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		concat: config('concat'),
		jshint: config('jshint'),
		emberTemplates: config('emberTemplates'),
		uglify: config('uglify'),
        server: config('server'),
        watch: {
            files: ['templates/**/*.hbs', 'js/app.js', 'js/app/**/*.js'],
            tasks: ['emberTemplates', 'concat']
        }
	});

	// Load the plugin that provides the "concat" task.
	grunt.loadNpmTasks('grunt-contrib-concat');

	// Load the plugin that provides the "jshint" task.
	grunt.loadNpmTasks('grunt-contrib-jshint');
	
	//Load the plugin that provides Handlebars Template Precompilation
	grunt.loadNpmTasks('grunt-ember-templates');

	// Load the plugin that provides the "jshint" task.
	grunt.loadNpmTasks('grunt-contrib-uglify');

    //Load the grunt watch plugin
    grunt.loadNpmTasks('grunt-contrib-watch');

	// Default task(s).
	grunt.registerTask('dist', ['emberTemplates', 'concat', 'uglify']);
    grunt.registerTask('default', ['watch']);

};
