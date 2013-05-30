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
                    config.tests = ["tests/"+file+"Test.js"];
                } else {
                    config.tests = ["tests/*.js"];
                }
                return config;
            },
            integration: {
                require: {
                    baseUrl: 'dist'
                },  
                tests: ["tests/akaseTest.js"]
            }
        },
        requirejs: {
            compile: {
                options: {
                    optimize:"uglify2",
                    baseUrl: "lib",
                    dir: "dist",
                    name: "akase"
                }
            }
        }
    });

    // These plugins provide necessary tasks.
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-requirejs');
    grunt.loadNpmTasks('grunt-qunit-amd');


    grunt.registerTask('qunit', function(file){
        grunt.task.run('qunit_amd:unit' + ((file)? ":" + file : ""));
    });

    // Default task.
    grunt.registerTask('test', ['jshint', 'qunit', 'qunit_amd:integration']);
    grunt.registerTask('default', ['requirejs']);

};
