/*global module:false*/
module.exports = function( grunt ) {

    grunt.initConfig({
        'jshint': {
            all: {
                src: [ 'lib/**/*.js', 'test/**/*.js' ]
            }
        },
        'qunit_amd': {
            unit: function( file ) {
                var config = {
                    require: {
                        baseUrl: 'lib'
                    }
                };

                if ( file ) {
                    config.tests = [ 'tests/' + file + 'Test.js' ];
                } else {
                    config.tests = [ 'tests/*.js' ];
                }
                return config;
            },
            integration: {
                require: {
                    baseUrl: 'dist'
                },
                tests: [ 'tests/akaseTest.js' ]
            }
        },
        'requirejs': {
            compile: {
                options: {
                    optimize:'uglify2',
                    baseUrl: 'lib',
                    dir: 'dist',
                    name: 'akase'
                }
            }
        }
    });

    grunt.loadNpmTasks( 'grunt-contrib-jshint' );
    grunt.loadNpmTasks( 'grunt-contrib-requirejs' );
    grunt.loadNpmTasks( 'grunt-qunit-amd' );

    grunt.registerTask( 'qunit', function( file ) {
        grunt.task.run( 'qunit_amd:unit' + ( ( file ) ? ':' + file : '' ) );
    });

    grunt.registerTask( 'test', [ 'jshint', 'qunit', 'qunit_amd:integration' ]);
    grunt.registerTask( 'default', [ 'requirejs' ]);

};
