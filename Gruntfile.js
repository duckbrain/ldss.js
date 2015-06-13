module.exports = function (grunt) {
	grunt.initConfig({
    browserify: {
      chromeIndex: {
				src: ['scripts/**/*.js'],
        dest: 'out/chrome-app/index.js'
      },

      //standalone browserify watch - do NOT use with grunt-watch
      index: {
        src: ['scripts/**/*.js'],
        dest: 'out/browser/index.js',
        options: {
          watch: true,
          keepAlive: true
        }
      },

      //working with grunt-watch - do NOT use with keepAlive above
      watchIndex: {
        src: ['scripts/**/*.js'],
        dest: 'out/browser/index.js',
        options: {
          watch: true
        }
      }
    },

    concat: {
      'public/main.js': ['public/vendor.js', 'public/app.js']
    },

    watch: {
      concat: {
        //note that we target the OUTPUT file from watchClient, and don't trigger browserify
        //the module watching and rebundling is handled by watchify itself
        files: ['public/app.js'],
        tasks: ['concat']
      },
    }
  });

	grunt.loadTasks('node_modules/grunt-browserify/tasks/browserify.js');

	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-browserify');
	grunt.registerTask('default', 'browserify');
}
