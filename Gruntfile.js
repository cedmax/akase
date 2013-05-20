/*global module:false*/
module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    // Task configuration.
    jshint: {
      options: {
        curly: true,
        eqeqeq: true,
        immed: true,
        latedef: true,
        newcap: true,
        noarg: true,
        sub: true,
        undef: true,
        unused: true,
        boss: true,
        eqnull: true,
        browser: true,
        globals: {}
      },
      lib_test: {
        src: ['lib/**/*.js', 'test/**/*.js']
      }
    },
    qunit_amd: {
        unit: function(file){
            var config = {
                require: {
                    baseUrl: 'lib'
                }
            };

            if (file) {
                config.tests = ["tests/"+file+".js"];
            } else {
                config.tests = ["tests/*.js"];
            }
            return config;
        }
      }
  });

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-qunit-amd');

    grunt.registerTask('qunit', function(file){
        grunt.task.run('qunit_amd:unit' + ((file)? ":" + file : ""));
    });

  // Default task.
  grunt.registerTask('test', ['jshint', 'qunit']);

};
