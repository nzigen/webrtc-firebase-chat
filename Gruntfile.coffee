module.exports = (grunt) ->
  pkg = grunt.file.readJSON 'package.json'
  grunt.initConfig
    compass:
      dist:
        options:
          config: 'compass_config.rb'
          specify: 'templates/css/sass/app.sass'
    ect:
      options:
        root: 'templates/html/ect'
      render:
        files:
          'public/index.html': ['home/index.ect']
    concat:
      js:
        options:
          separator: ';'
        src: [
          'templates/js/src/lib/adapter.js'
          'templates/js/src/main.js'
        ],
        dest: 'public/js/app.js',

    watch:
      ect:
        files:
          'templates/html/ect/**/*.ect'
        tasks: ['ect']
      sass:
        files: [
          'templates/css/sass/*.sass'
          'templates/css/sass/*.scss'
          'templates/css/sass/**/*.sass'
          'templates/css/sass/**/*.scss'
        ]
        tasks: ['compass']
#      coffee:
#        files: [
#          'templates/js/coffee/*.coffee'
#          'templates/js/coffee/**/*.coffee'
#        ]
#        tasks: ['coffee']
      js:
        files: [
          'templates/js/src/**/*.js'
        ]
        tasks: ['concat:js']

  for t of pkg.devDependencies
    if t.substring(0, 6) is 'grunt-'
        grunt.loadNpmTasks t

  grunt.loadNpmTasks 'grunt-ect'
  grunt.registerTask 'default', ['concat:js', 'ect', 'compass']
